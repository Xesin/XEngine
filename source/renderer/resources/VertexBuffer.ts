namespace XEngine {

	export class VertexBuffer {

		private static CurrentVertexBuffer: VertexBuffer;

		public bufferType: number;
		public buffer: WebGLBuffer;
		private gl: WebGLRenderingContext;
		private attributes: Array<any>;

		public static SetDiry() {
			VertexBuffer.CurrentVertexBuffer = null;
		}

		constructor(gl: WebGLRenderingContext, buffer: WebGLBuffer) {
			this.gl = gl;
			this.bufferType = gl.ARRAY_BUFFER;
			this.buffer = buffer;
			this.attributes = new Array<any>();
		}

		public addAttribute(index: number, size: number, type: number, normalized: boolean, stride: number, offset: number) {
			this.attributes.push({
				index: index,
				size: size,
				type: type,
				normalized: normalized,
				stride: stride,
				offset: offset,
			});
		}

		public updateResource(bufferData: Float32Array | Uint32Array, offset: number) {
			let gl = this.gl;

			// if (VertexBuffer.CurrentVertexBuffer !== this) {
			// 	VertexBuffer.CurrentVertexBuffer = this;
			// 	gl.bindBuffer(this.bufferType, this.buffer);
			// }
			gl.bindBuffer(this.bufferType, this.buffer);
			gl.bufferSubData(this.bufferType, offset, bufferData);
		}

		public bind() {
			let gl = this.gl;
			let buffer = this.buffer;
			let attributes = this.attributes;
			let attributesLength = attributes.length;

			// if (VertexBuffer.CurrentVertexBuffer !== this) {
				VertexBuffer.CurrentVertexBuffer = this;
				gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

				for (let index = 0; index < attributesLength; ++index) {
					let element = attributes[index];

					if (element !== undefined && element !== null) {
						gl.enableVertexAttribArray(element.index);
						gl.vertexAttribPointer(
							element.index,
							element.size,
							element.type,
							element.normalized,
							element.stride,
							element.offset,
						);
					}
				}
			// }
		}
	}
}
