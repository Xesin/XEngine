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
	}
}
