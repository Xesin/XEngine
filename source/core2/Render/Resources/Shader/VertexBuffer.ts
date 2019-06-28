namespace XEngine2 {

	export class VertexBuffer {

		private static CurrentVertexBuffer: VertexBuffer;

		public bufferType: number;
		public buffer: WebGLBuffer;
		public vao: WebGLVertexArrayObject;
		private gl: WebGL2RenderingContext;
		public attributes: Array<any>;

		public static SetDiry() {
			VertexBuffer.CurrentVertexBuffer = null;
		}

		constructor(gl: WebGL2RenderingContext, buffer: WebGLBuffer) {
			this.gl = gl;
			this.bufferType = gl.ARRAY_BUFFER;
			this.buffer = buffer;
			this.vao = gl.createVertexArray();
			this.attributes = new Array<any>();
		}

		public addAttribute(vertexAttribute: VertexAttribute, stride: number) {
			let gl = this.gl;
			this.bind();
			gl.enableVertexAttribArray(vertexAttribute.index);
			gl.vertexAttribPointer(
				vertexAttribute.index,
				vertexAttribute.numItems,
				vertexAttribute.type,
				vertexAttribute.normalized,
				stride,
				vertexAttribute.offset,
			);
			this.attributes.push(vertexAttribute);
		}

		public updateResource(bufferData: Float32Array | Uint32Array, offset: number) {
			let gl = this.gl;

			gl.bindBuffer(this.bufferType, this.buffer);
			gl.bufferSubData(this.bufferType, offset, bufferData);
			gl.bindBuffer(this.bufferType, null);
		}

		public bind() {
			let gl = this.gl;

			if (VertexBuffer.CurrentVertexBuffer !== this) {
				VertexBuffer.CurrentVertexBuffer = this;
				gl.bindVertexArray(this.vao);
			}
		}

		public unbind()
		{
			let gl = this.gl;

			if (VertexBuffer.CurrentVertexBuffer == this) {
				gl.bindVertexArray(null);
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
				gl.deleteVertexArray(this.vao);
				this.attributes = new Array();
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
