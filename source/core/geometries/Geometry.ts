namespace XEngine {
	declare var mat4: any;
	export class Geometry {

		public initialized = false;

		protected uvData: Array<number>;
		protected vertexData: Array<number>;
		protected indexData: Array<number>;
		protected indexDataBuffer: XEngine.DataBuffer16;
		protected vertDataBuffer: DataBuffer32;
		protected gl: WebGLRenderingContext;

		protected indexBuffer: IndexBuffer;
		protected vertexBuffer: VertexBuffer;

		constructor(vertexData:Array<number>, indexData:Array<number>, uvData:Array<number>) {
			this.vertexData = vertexData;
			this.indexData = indexData;
			this.uvData = uvData;
		}

		public destroy () {
			if (this.indexBuffer) {
				this.gl.deleteBuffer(this.indexBuffer.buffer);
				delete this.indexBuffer;
			}
			if (this.vertexBuffer) {
				this.gl.deleteBuffer(this.vertexBuffer.buffer);
				delete this.vertexBuffer;
			}
		}

		public initialize(renderer: Renderer) {
			let attributes = renderer.currentMaterial.getAttributes(renderer);
			let stride = attributes[0].stride;
			this.vertDataBuffer = new DataBuffer32(stride * this.indexData.length);
			this.indexDataBuffer = new DataBuffer16(2 * this.indexData.length);
			
			if (this.indexBuffer) {
				this.gl.deleteBuffer(this.indexBuffer.buffer);
				delete this.indexBuffer;
			}
			if (this.vertexBuffer) {
				this.gl.deleteBuffer(this.vertexBuffer.buffer);
				delete this.vertexBuffer;
			}

			this.vertexBuffer = renderer.resourceManager.createBuffer(
				this.gl.ARRAY_BUFFER, this.vertDataBuffer.getByteCapacity(), this.gl.STREAM_DRAW) as VertexBuffer;
			for (const attr in attributes) {
				if (attributes.hasOwnProperty(attr)) {
					const element = attributes[attr];
					stride = element.stride;
					this.vertexBuffer.addAttribute(element.gpuLoc, element.items, element.type, element.normalized, element.stride, element.offset);
				}
			}

			this.indexBuffer = renderer.resourceManager.createBuffer(
				this.gl.ELEMENT_ARRAY_BUFFER, this.indexDataBuffer.getByteCapacity(), this.gl.STATIC_DRAW) as IndexBuffer;

			let index = this.vertDataBuffer.allocate(this.vertexData.length);
			let uvIndex = 0;
			let colorIndex = 0;
			let floatBuffer = this.vertDataBuffer.floatView;
			let uintBuffer = this.vertDataBuffer.uintView;
			let uintIndexBuffer = this.indexDataBuffer.uintView;
			let vertices = this.vertexData;
			let uv = this.uvData;
			// tslint:disable-next-line:forin
			for (let i = 0; i < vertices.length; i++) {
				floatBuffer[index++] = vertices[i++];
				floatBuffer[index++] = vertices[i++];
				floatBuffer[index++] = vertices[i++];
				let x = 0;
				let y = 0;
				if (uv !== undefined) {
					x = uv[uvIndex++];
					y = uv[uvIndex++];
				}
				floatBuffer[index++] = x;
				floatBuffer[index++] = y;

				uintBuffer[index++] = vertices[i];
			}

			let indices = this.indexData;
			index = this.indexDataBuffer.allocate(indices.length);
			for (let i = 0; i < indices.length; i++) {
				uintIndexBuffer[i] = indices[i];
			}

			this.vertexBuffer.updateResource(floatBuffer, 0);
			this.indexBuffer.updateResource(uintIndexBuffer, 0);
		}

		public bind(){
			this.vertexBuffer.bind();
			this.indexBuffer.bind();
		}
	}
}
