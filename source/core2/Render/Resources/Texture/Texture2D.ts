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

		public static blackTexture: Texture2D;
		public static whiteTexture: Texture2D;
		public static normalTexture: Texture2D;

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

			let internalFormat = gl.RGBA;
			let srcFormat = gl.RGBA;

			if (isNormal) {
				internalFormat = gl.RGBA;
			}


			gl.bindTexture(gl.TEXTURE_2D, texture);
			gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
			// gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 1);

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

		public release(gl: WebGL2RenderingContext)
		{
			gl.deleteTexture(this._texture);
		}

		public static CreateDefaultTextures(gl: WebGL2RenderingContext)
		{
			let blackData = new Uint8Array(4);
			blackData[0] = 0;
			blackData[1] = 0;
			blackData[2] = 0;
			blackData[3] = 255;
			let whiteData = new Uint8Array(4);
			whiteData[0] = 255;
			whiteData[1] = 255;
			whiteData[2] = 255;
			whiteData[3] = 255;
			let normalData = new Uint8Array(4);
			normalData[0] = 128;
			normalData[1] = 128;
			normalData[2] = 255;
			normalData[3] = 255;

			Texture2D.blackTexture = Texture2D.createTexture('defaultBlackTexture', 1, 1, blackData, WRAP_MODE.REPEAT, true, gl);
			Texture2D.whiteTexture = Texture2D.createTexture('defaultWhiteTexture', 1, 1, whiteData, WRAP_MODE.REPEAT, true, gl);
			Texture2D.normalTexture = Texture2D.createTexture('defaultNormalTexture', 1, 1, normalData, WRAP_MODE.REPEAT, true, gl, true);
		}

		public Equals(other: Texture2D)
		{
			return other != null && other == this && this.imageName == other.imageName;
		}
	}
}
