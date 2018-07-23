namespace XEngine {

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

			// if (IndexBuffer.CurrentIndexBuffer !== this) {
			// 	IndexBuffer.CurrentIndexBuffer = this;
			// 	gl.bindBuffer(this.bufferType, this.buffer);
			// }
			gl.bindBuffer(this.bufferType, this.buffer);
			gl.bufferSubData(this.bufferType, offset, bufferData);
		}

		public bind() {
			let gl = this.gl;
			let buffer = this.buffer;

			if (IndexBuffer.CurrentIndexBuffer !== this) {
				IndexBuffer.CurrentIndexBuffer = this;
				gl.bindBuffer(this.bufferType, buffer);
			}
		}
	}
}
