namespace XEngine {
	enum TGA_Type {
		NO_DATA,
		INDEXED,
		RGB,
		GREY,
		RLE_INDEXED,
		RLE_RGB,
		RLE_GREY,
	}

	enum TGA_Origin {
		BOTTOM_LEFT = 0x00,
		BOTTOM_RIGHT = 0x01,
		TOP_LEFT = 0x02,
		TOP_RIGHT = 0x03,
		SHIFT = 0x04,
		MASK = 0x30,
	}

	export class TGAParser {

		public static parse(data: ArrayBuffer): any {
			let offset = 0;
			let imageData = {
				data,
				width: 0,
				height: 0,
			};
			let dataArray = new Uint8Array(data);
			// Not enough data to contain header ?
			if (dataArray.length < 0x12) {
				throw new Error("Targa::load() - Not enough data to contain header");
			}

			// Read TgaHeader
			let header = {
				/* 0x00  BYTE */  idLength:       dataArray[offset++],
				/* 0x01  BYTE */  colorMapType:   dataArray[offset++],
				/* 0x02  BYTE */  imageType:      dataArray[offset++],
				/* 0x03  WORD */  colorMapIndex:  dataArray[offset++] | dataArray[offset++] << 8,
				/* 0x05  WORD */  colorMapLength: dataArray[offset++] | dataArray[offset++] << 8,
				/* 0x07  BYTE */  colorMapDepth:  dataArray[offset++],
				/* 0x08  WORD */  offsetX:        dataArray[offset++] | dataArray[offset++] << 8,
				/* 0x0a  WORD */  offsetY:        dataArray[offset++] | dataArray[offset++] << 8,
				/* 0x0c  WORD */  width:          dataArray[offset++] | dataArray[offset++] << 8,
				/* 0x0e  WORD */  height:         dataArray[offset++] | dataArray[offset++] << 8,
				/* 0x10  BYTE */  pixelDepth:     dataArray[offset++],
				/* 0x11  BYTE */  flags:          dataArray[offset++],
				hasEncoding: false,
				hasColorMap: false,
				isGreyColor: false,
			};

			// Set shortcut
			// tslint:disable-next-line:max-line-length
			header.hasEncoding = (header.imageType === TGA_Type.RLE_INDEXED || header.imageType === TGA_Type.RLE_RGB   || header.imageType === TGA_Type.RLE_GREY);
			header.hasColorMap = (header.imageType === TGA_Type.RLE_INDEXED || header.imageType === TGA_Type.INDEXED);
			header.isGreyColor = (header.imageType === TGA_Type.RLE_GREY    || header.imageType === TGA_Type.GREY);

			// Check if a valid TGA file (or if we can load it)
			TGAParser.checkHeader(header);

			// Move to dataArray
			offset += header.idLength;
			if (offset >= dataArray.length) {
				throw new Error("Targa::load() - No dataArray");
			}
			let palette = undefined;
			// Read palette
			if (header.hasColorMap) {
				let colorMapSize  = header.colorMapLength * (header.colorMapDepth >> 3);
				palette      = dataArray.subarray( offset, offset + colorMapSize);
				offset           += colorMapSize;
			}

			let pixelSize  = header.pixelDepth >> 3;
			let imageSize  = header.width * header.height;
			let pixelTotal = imageSize * pixelSize;

			// RLE encoded
			if (header.hasEncoding) {
				imageData.data = TGAParser.decodeRLE(dataArray, offset, pixelSize, pixelTotal);
			} else {
				imageData.data = dataArray.subarray( offset, offset + (header.hasColorMap ? imageSize : pixelTotal) );
			}
			imageData.width = header.width;
			imageData.height = header.height;

			return TGAParser.getImageData(header, imageData, palette);
		}

		private static checkHeader(header: any) {
			// What the need of a file without data ?
			if (header.imageType === TGA_Type.NO_DATA) {
				throw new Error("Targa::checkHeader() - No data");
			}

			// Indexed type
			if (header.hasColorMap) {
				if (header.colorMapLength > 256 || header.colorMapSize !== 24 || header.colorMapType !== 1) {
					throw new Error("Targa::checkHeader() - Invalid colormap for indexed type");
				}
			} else {
				if (header.colorMapType) {
					throw new Error("Targa::checkHeader() - Why does the image contain a palette ?");
				}
			}

			// Check image size
			if (header.width <= 0 || header.height <= 0) {
				throw new Error("Targa::checkHeader() - Invalid image size");
			}

			// Check pixel size
			if (header.pixelDepth !== 8  &&
				header.pixelDepth !== 16 &&
				header.pixelDepth !== 24 &&
				header.pixelDepth !== 32) {
				throw new Error("Targa::checkHeader() - Invalid pixel size " + header.pixelDepth);
			}
		}

		private static decodeRLE(data: Uint8Array, offset: number, pixelSize: number, outputSize: number): Uint8Array {
			let pos, c, count, i;
			let pixels, output;

			output = new Uint8Array(outputSize);
			pixels = new Uint8Array(pixelSize);
			pos    = 0;

			while (pos < outputSize) {
				c     = data[offset++];
				count = (c & 0x7f) + 1;

				// RLE pixels.
				if (c & 0x80) {
					// Bind pixel tmp array
					for (i = 0; i < pixelSize; ++i) {
						pixels[i] = data[offset++];
					}

					// Copy pixel array
					for (i = 0; i < count; ++i) {
						output.set(pixels, pos);
						pos += pixelSize;
					}
				} else {
					count *= pixelSize;
					for (i = 0; i < count; ++i) {
						output[pos++] = data[offset++];
					}
				}
			}

			return output;
		}

		private static getImageData(header: any, imageData: any, palette: any) {
			let width  = imageData.width;
			let height = imageData.height;
			let origin = (header.flags & TGA_Origin.MASK) >> TGA_Origin.SHIFT;
			let x_start, x_step, x_end, y_start, y_step, y_end;

			if (origin === TGA_Origin.TOP_LEFT || origin === TGA_Origin.TOP_RIGHT) {
				y_start = 0;
				y_step  = 1;
				y_end   = height;
			} else {
				y_start = height - 1;
				y_step  = -1;
				y_end   = -1;
			}

			if (origin === TGA_Origin.TOP_LEFT || origin === TGA_Origin.BOTTOM_LEFT) {
				x_start = 0;
				x_step  = 1;
				x_end   = width;
			} else {
				x_start = width - 1;
				x_step  = -1;
				x_end   = -1;
			}
			let getImageData: Function;

			// TODO: use this.header.offsetX and this.header.offsetY ?

			switch (header.pixelDepth) {
				case 8:
					getImageData = header.isGreyColor ? TGAParser.getImageDataGrey8bits : TGAParser.getImageData8bits;
					break;
				case 16:
					getImageData = header.isGreyColor ? TGAParser.getImageDataGrey16bits : TGAParser.getImageData16bits;
					break;
				case 24:
					getImageData = TGAParser.getImageData24bits;
					break;
				case 32:
					getImageData = TGAParser.getImageData32bits;
					break;
			}
			let tmpData = new Uint8Array(imageData.width * imageData.height * 4);
			getImageData(tmpData, imageData.data, palette, width, y_start, y_step, y_end, x_start, x_step, x_end);
			imageData.data = tmpData;
			return imageData;
		}

		private static getImageData8bits(imageData, indexes, colormap, width, y_start, y_step, y_end, x_start, x_step, x_end) {
			let color, i, x, y;

			for (i = 0, y = y_start; y !== y_end; y += y_step) {
				for (x = x_start; x !== x_end; x += x_step, i++) {
					color = indexes[i];
					imageData[(x + width * y) * 4 + 3] = 255;
					imageData[(x + width * y) * 4 + 2] = colormap[(color * 3) + 0];
					imageData[(x + width * y) * 4 + 1] = colormap[(color * 3) + 1];
					imageData[(x + width * y) * 4 + 0] = colormap[(color * 3) + 2];
				}
			}

			return imageData;
		}

		private static getImageData16bits(imageData, pixels, colormap, width, y_start, y_step, y_end, x_start, x_step, x_end) {
			let color, i, x, y;

			for (i = 0, y = y_start; y !== y_end; y += y_step) {
				for (x = x_start; x !== x_end; x += x_step, i += 2) {
					color = pixels[i + 0] | (pixels[i + 1] << 8);
					imageData[(x + width * y) * 4 + 0] = (color & 0x7C00) >> 7;
					imageData[(x + width * y) * 4 + 1] = (color & 0x03E0) >> 2;
					imageData[(x + width * y) * 4 + 2] = (color & 0x001F) >> 3;
					imageData[(x + width * y) * 4 + 3] = (color & 0x8000) ? 0 : 255;
				}
			}

			return imageData;
		}

		private static getImageData24bits(imageData, pixels, colormap, width, y_start, y_step, y_end, x_start, x_step, x_end) {
			let i, x, y;

			for (i = 0, y = y_start; y !== y_end; y += y_step) {
				for (x = x_start; x !== x_end; x += x_step, i += 3) {
					imageData[(x + width * y) * 4 + 3] = 255;
					imageData[(x + width * y) * 4 + 2] = pixels[i + 0];
					imageData[(x + width * y) * 4 + 1] = pixels[i + 1];
					imageData[(x + width * y) * 4 + 0] = pixels[i + 2];
				}
			}

			return imageData;
		}

		private static getImageData32bits(imageData, pixels, colormap, width, y_start, y_step, y_end, x_start, x_step, x_end) {
			let i, x, y;

			for (i = 0, y = y_start; y !== y_end; y += y_step) {
				for (x = x_start; x !== x_end; x += x_step, i += 4) {
					imageData[(x + width * y) * 4 + 2] = pixels[i + 0];
					imageData[(x + width * y) * 4 + 1] = pixels[i + 1];
					imageData[(x + width * y) * 4 + 0] = pixels[i + 2];
					imageData[(x + width * y) * 4 + 3] = pixels[i + 3];
				}
			}

			return imageData;
		}

		private static getImageDataGrey8bits(imageData, pixels, colormap, width, y_start, y_step, y_end, x_start, x_step, x_end) {
			let color, i, x, y;

			for (i = 0, y = y_start; y !== y_end; y += y_step) {
				for (x = x_start; x !== x_end; x += x_step, i++) {
					color = pixels[i];
					imageData[(x + width * y) * 4 + 3] = 255;
					imageData[(x + width * y) * 4 + 2] = color;
					imageData[(x + width * y) * 4 + 1] = color;
					imageData[(x + width * y) * 4 + 0] = color;
				}
			}

			return imageData;
		}

		private static getImageDataGrey16bits(imageData, pixels, colormap, width, y_start, y_step, y_end, x_start, x_step, x_end) {
			let i, x, y;

			for (i = 0, y = y_start; y !== y_end; y += y_step) {
				for (x = x_start; x !== x_end; x += x_step, i += 2) {
					imageData[(x + width * y) * 4 + 0] = pixels[i + 0];
					imageData[(x + width * y) * 4 + 1] = pixels[i + 0];
					imageData[(x + width * y) * 4 + 2] = pixels[i + 0];
					imageData[(x + width * y) * 4 + 3] = pixels[i + 1];
				}
			}

			return imageData;
		}
	}
}
