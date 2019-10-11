namespace XEngine2 {

	export class VertexBuffer {

		private static CurrentVertexBuffer: VertexBuffer;

		public bufferType: number;
		public buffer: WebGLBuffer;
		private gl: WebGL2RenderingContext;
		public attributes: Array<any>;

		public static SetDiry() {
			VertexBuffer.CurrentVertexBuffer = null;
		}

		constructor(gl: WebGL2RenderingContext, buffer: WebGLBuffer) {
			this.gl = gl;
			this.bufferType = gl.ARRAY_BUFFER;
			this.buffer = buffer;
			this.attributes = new Array<any>();
		}

		public addAttribute(vertexAttribute: VertexAttribute, stride: number, offset: number) {
			let gl = this.gl;
			this.bind();
			gl.vertexAttribPointer(
				vertexAttribute.index,
				vertexAttribute.numItems,
				vertexAttribute.type,
				vertexAttribute.normalized,
				stride,
				offset,
				);
			gl.enableVertexAttribArray(vertexAttribute.index);
		}

		public updateResource(bufferData: Float32Array | Uint32Array, offset: number) {
			let gl = this.gl;

			gl.bindBuffer(this.bufferType, this.buffer);
			gl.bufferData(this.bufferType, bufferData, gl.STATIC_DRAW);
			gl.bindBuffer(this.bufferType, null);
		}

		public bind() {
			let gl = this.gl;

			if (VertexBuffer.CurrentVertexBuffer !== this) {
				VertexBuffer.CurrentVertexBuffer = this;
				gl.bindBuffer(this.bufferType, this.buffer);
			}
		}

		public unbind()
		{
			let gl = this.gl;

			if (VertexBuffer.CurrentVertexBuffer == this) {
				gl.bindBuffer(this.bufferType, null);
				VertexBuffer.SetDiry();
			}
		}

		public destroy()
		{
			let gl = this.gl;
			if (VertexBuffer.CurrentVertexBuffer == this) {
				this.unbind();
				gl.deleteBuffer(this.buffer);
			}
		}

		public static Create(target: number, initialDataOrSize: number, usage: number, gl: WebGL2RenderingContext): VertexBuffer
		{
			let buffer = gl.createBuffer();

			gl.bindBuffer(target, buffer);
			gl.bufferData(target, initialDataOrSize, usage);

			return new VertexBuffer(gl, buffer);
		}
	}
}
