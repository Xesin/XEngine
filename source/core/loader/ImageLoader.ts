namespace XEngine {

	export class ImageLoader implements BasicLoader {

		public imageName: string;
		public imageUrl: string;
		public completed: boolean;
		public frameWidth: number;
		public frameHeight: number;
		public isLoading: boolean;

		private loader: Loader;

		constructor (imageName: string, imageUrl: string, loader: Loader, frameWidth = 0, frameHeight = 0) {
			this.isLoading = false;
			this.imageName = imageName;
			this.imageUrl = imageUrl;
			this.completed = false;
			this.loader = loader;
			this.frameWidth = frameWidth;
			this.frameHeight = frameHeight;
		}

		public load() {
			this.isLoading = true;
			let _this = this;
			if (_this.loader.game.cache.images[_this.imageName] !== undefined) {
				_this.completed = true;
				_this.loader._notifyCompleted();
				return;
			}
			let newImage = new Texture2D(_this.imageName, _this.frameWidth, _this.frameHeight, 1);
			let isTga = false;
			if (_this.imageUrl.split(".").indexOf("tga") !== -1) {
				isTga = true;
			}
			if (!isTga) {
				let img1 = new Image();
				let handler = function () {
					let imageRef = _this.loader.game.cache.images[_this.imageName];
					imageRef.image = this;
					_this.completed = true;

					if (_this.frameWidth === 0) {
						imageRef.frameWidth = this.width;
						newImage.wrapMode = WRAP_MODE.REPEAT;
					} else {
						imageRef.frameWidth = _this.frameWidth;
					}

					if (_this.frameHeight === 0) {
						imageRef.frameHeight = this.height;
						newImage.wrapMode = WRAP_MODE.REPEAT;
					} else {
						imageRef.frameHeight = _this.frameHeight;
					}

					imageRef.createTexture(_this.loader.game.context);
					_this.loader._notifyCompleted();
				};
				img1.onload = handler;
				img1.onerror = handler;
				img1.src = _this.imageUrl;
			} else {
				let xhr = new XMLHttpRequest();

				xhr.open("GET", _this.imageUrl, true);
				xhr.responseType = "arraybuffer";
				xhr.onload = function() {
					if (this.status === 200) {
						let imageData = _this.decodeTGA(this.response);
						let imageRef = _this.loader.game.cache.images[_this.imageName];
						imageRef.image = imageData.data;

						if (_this.frameWidth === 0) {
							imageRef.frameWidth = imageData.width;
							newImage.wrapMode = WRAP_MODE.REPEAT;
						} else {
							imageRef.frameWidth = _this.frameWidth;
						}

						if (_this.frameHeight === 0) {
							imageRef.frameHeight = imageData.height;
							newImage.wrapMode = WRAP_MODE.REPEAT;
						} else {
							imageRef.frameHeight = _this.frameHeight;
						}
						imageRef.createTexture(_this.loader.game.context);
						_this.completed = true;
						_this.loader._notifyCompleted();
					}
				};
				xhr.send(null);
			}
			_this.loader.game.cache.images[newImage.imageName] = newImage;
		}

		private decodeTGA(arrayBuffer) {
			let content = new Uint8Array(arrayBuffer),
				contentOffset = 18 + content[0],
				imagetype = content[2], // 2 = rgb, only supported format for now
				width = content[12] + (content[13] << 8),
				height = content[14] + (content[15] << 8),
				bpp = content[16], // should be 8,16,24,32

				bytesPerPixel = bpp / 8,
				bytesPerRow = width * 4,
				data, i, j, x, y;

			if (!width || !height) {
				console.error("Invalid dimensions");
				return null;
			}

			// if (imagetype !== 2) {
			// 	console.error("Unsupported TGA format:", imagetype);
			// 	return null;
			// }

			data = new Uint8Array(width * height * 4);
			i = contentOffset;

			// Oy, with the flipping of the rows...
			for (y = height - 1; y >= 0; --y) {
				for (x = 0; x < width; ++x, i += bytesPerPixel) {
					j = (x * 4) + (y * bytesPerRow);
					data[j] = content[i + 2];
					data[j + 1] = content[i + 1];
					data[j + 2] = content[i + 0];
					data[j + 3] = (bpp === 32 ? content[i + 3] : 255);
				}
			}

			return {
				width: width,
				height: height,
				data: data,
			};
		}
	}
}
