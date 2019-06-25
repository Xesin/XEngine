namespace XEngine2 {
	export enum WRAP_MODE {
		CLAMP,
		REPEAT,
	}

	export class Texture2D {
		public imageName: string;
		public width: number;
		public height: number;
		public _texture: WebGLTexture;
		public readonly isNormal: boolean;
		public dirty: boolean;
		public generateMipmaps: boolean;
		public wrapMode: WRAP_MODE;
		public image: any;

		constructor (name: string, width: number, height: number, wrapMode = WRAP_MODE.REPEAT, isNormal: boolean, generateMipmaps = true) {
			this.imageName = name;
			this.width = width;
			this.height = height;
			this._texture = null;
			this.dirty = true;
			this.wrapMode = wrapMode;
			this.isNormal = isNormal;
			this.generateMipmaps = generateMipmaps;
		}

		public static createTexture(name: string, width: number, height: number, data: Uint8Array, wrap: WRAP_MODE, generateMipMaps: boolean, gl: WebGL2RenderingContext, isNormal = false): Texture2D {
			let texture = gl.createTexture();
			let texture2D = new Texture2D(name, width, height, wrap, isNormal, generateMipMaps);

			let internalFormat = gl.SRGB8_ALPHA8;
			let srcFormat = gl.RGBA;

			if (isNormal) {
				internalFormat = gl.RGBA;
			}


			gl.bindTexture(gl.TEXTURE_2D, texture);
			gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);

			gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, width, height, 0, srcFormat, gl.UNSIGNED_BYTE, data);

			if (wrap === WRAP_MODE.REPEAT) {
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
			} else {
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
			}

			if (generateMipMaps) {
				gl.generateMipmap(gl.TEXTURE_2D);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
			} else {
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
			}

			gl.bindTexture(gl.TEXTURE_2D, null);
			texture2D._texture = texture;

			return texture2D;
		}

		public Equals(other: Texture2D)
		{
			return this.imageName == other.imageName;
		}
	}
}
