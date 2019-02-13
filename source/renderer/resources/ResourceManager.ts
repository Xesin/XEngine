namespace XEngine {

	export class ResourceManager {

		private gl: WebGL2RenderingContext;
		private shaderCache: Array<Material>;

		constructor(gl: WebGL2RenderingContext) {
			this.gl = gl;
			this.shaderCache = new Array();
		}

		public createBuffer(target: number, initialDataOrSize: number, usage: number): VertexBuffer | IndexBuffer {
			let gl = this.gl;
			let buffer = gl.createBuffer();

			gl.bindBuffer(target, buffer);
			gl.bufferData(target, initialDataOrSize, usage);

			switch (target) {
				case gl.ARRAY_BUFFER:
					return new VertexBuffer(gl, buffer);
				case gl.ELEMENT_ARRAY_BUFFER:
					return new IndexBuffer(gl, buffer);
			}
		}

		public createMaterial(shaderClass: any, shaderName?: string): Material {
			let shader: Material;
			if (shaderName !== undefined) {
				if (!this.shaderCache[shaderName]) {
					shader = new shaderClass();
					shader.initializeShader(this.gl);
					this.shaderCache[shaderName] = shader;
				} else {
					shader = this.shaderCache[shaderName];
				}
			} else {
				shader = new shaderClass();
				shader.initializeShader(this.gl);
			}
			return shader;
		}

		public createTexture(width: number, height: number, data: Uint8Array, wrap: WRAP_MODE, generateMipMaps: boolean, isNormal = false) {
			let gl = this.gl;
			let texture = gl.createTexture();

			let internalFormat = gl.SRGB8_ALPHA8;
			let srcFormat = gl.RGBA;

			if (isNormal) {
				internalFormat = gl.RGBA;
			}

			const srcType = gl.UNSIGNED_BYTE;

			gl.bindTexture(gl.TEXTURE_2D, texture);
			gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
			let uinType = "Uint8Array";
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

			return texture;
		}

		public createRenderBuffer(width: number, height: number) {
			let gl = this.gl;
			let buffer = gl.createFramebuffer();
			gl.bindFramebuffer(gl.FRAMEBUFFER, buffer);
			gl.bindFramebuffer(gl.FRAMEBUFFER, null);
			return;
		}
	}
}
