namespace XEngine {

	export class ResourceManager {

		private gl: WebGLRenderingContext;

		constructor(gl: WebGLRenderingContext) {
			this.gl = gl;
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

		public createShader(shaderClass: any) {
			let shader = new shaderClass();
			shader.initializeShader(this.gl);
			return shader;
		}
	}
}
