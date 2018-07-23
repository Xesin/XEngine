namespace XEngine {
	export enum WRAP_MODE {
		CLAMP,
		REPEAT,
	}

	export class Texture2D {
		public imageName: string;
		public image: any;
		public frameWidth: number;
		public frameHeight: number;
		public _texture: WebGLTexture;
		public readonly isNormal: boolean;
		public ready: boolean;
		public wrapMode: WRAP_MODE;

		constructor (name: string, width: number, height: number, wrapMode = WRAP_MODE.REPEAT, isNormal: boolean) {
			this.imageName = name;
			this.frameWidth = width;
			this.frameHeight = height;
			this._texture = null;
			this.ready = false;
			this.wrapMode = wrapMode;
			this.isNormal = isNormal;
		}

		public createTexture(gl: WebGL2RenderingContext) {
			if (this.imageName == null) {return; }

			this._texture = gl.createTexture();

			let internalFormat = gl.SRGB8_ALPHA8;
			let srcFormat = gl.RGBA;
			if (this.isNormal) {
				internalFormat = gl.RGBA;
			}
			const srcType = gl.UNSIGNED_BYTE;

			gl.bindTexture(gl.TEXTURE_2D, this._texture);
			gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
			if (this.wrapMode === WRAP_MODE.REPEAT) {
				let uinType = "Uint8Array";
				if (this.image.constructor === Uint8Array || this.image === null) {
					gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, this.frameWidth, this.frameHeight, 0, srcFormat, gl.UNSIGNED_BYTE, this.image);
				} else {
					gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, srcFormat, srcType, this.image);
				}
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
			} else {
				if (this.image.constructor === Uint8Array) {
					gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, this.frameWidth, this.frameHeight, 0, srcFormat, gl.UNSIGNED_BYTE, this.image);
				} else {
					gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, srcFormat, srcType, this.image);
				}
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
			}


			gl.generateMipmap(gl.TEXTURE_2D);

			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);

			gl.bindTexture(gl.TEXTURE_2D, null);

			this.ready = true;
		}
	}
}
