namespace XEngine2 {

	export class IndexBuffer {

		private static CurrentIndexBuffer: IndexBuffer;

		public bufferType: number;
		public buffer: WebGLBuffer;
		private gl: WebGLRenderingContext;

		public static SetDiry() {
			IndexBuffer.CurrentIndexBuffer = null;
		}

		constructor(gl: WebGLRenderingContext, buffer: WebGLBuffer) {
			this.gl = gl;
			this.bufferType = gl.ELEMENT_ARRAY_BUFFER;
			this.buffer = buffer;
		}

		public updateResource(bufferData: Uint16Array, offset: number) {
			let gl = this.gl;

			this.bind();
			gl.bufferSubData(this.bufferType, offset, bufferData);
			this.unbind();
		}

		public bind() {
			let gl = this.gl;
			let buffer = this.buffer;

			// if (IndexBuffer.CurrentIndexBuffer !== this) {
				IndexBuffer.CurrentIndexBuffer = this;
				gl.bindBuffer(this.bufferType, buffer);
			// }
		}

		public unbind()
		{
			let gl = this.gl;

			if (IndexBuffer.CurrentIndexBuffer == this) {
				gl.bindBuffer(this.bufferType, null);
				VertexBuffer.SetDiry();
			}
		}

		public destroy()
		{
			let gl = this.gl;
			if (IndexBuffer.CurrentIndexBuffer == this) {
				this.unbind();
				gl.deleteBuffer(this.buffer);
			}
		}

		public static Create(target: number, initialDataOrSize: number, usage: number, gl: WebGL2RenderingContext): IndexBuffer
		{
			let buffer = gl.createBuffer();

			gl.bindBuffer(target, buffer);
			gl.bufferData(target, initialDataOrSize, usage);

			return new IndexBuffer(gl, buffer);
		}
	}
}
