import {VertexBuffer} from "./VertexBuffer"

export class IndexBuffer {

	private static CurrentIndexBuffer: IndexBuffer;

	public bufferType: number;
	public buffer: WebGLBuffer;
	public mode: number;
	private gl: WebGLRenderingContext;

	public static SetDiry() {
		IndexBuffer.CurrentIndexBuffer = null;
	}

	constructor(gl: WebGLRenderingContext, buffer: WebGLBuffer, mode: number = gl.STATIC_DRAW) {
		this.gl = gl;
		this.bufferType = gl.ELEMENT_ARRAY_BUFFER;
		this.buffer = buffer;
		this.mode = mode;
	}

	public updateResource(bufferData: Uint16Array) {
		let gl = this.gl;
		this.bind();
		gl.bufferData(this.bufferType,  bufferData, this.mode);
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