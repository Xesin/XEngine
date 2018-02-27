namespace XEngine {
	declare var mat4: any;
	export class Geometry {

		public initialized = false;
		public vertexCount = 0;
		public indexed = true;
		public materials = new Array<string>();

		protected uvData: Array<number>;
		protected vertexData: Array<number>;
		protected indexData: Array<number>;
		protected normalData: Array<number>;
		protected indexDataBuffer: XEngine.DataBuffer16;
		protected vertDataBuffer: DataBuffer32;
		protected gl: WebGLRenderingContext;

		protected indexBuffer: IndexBuffer;
		protected vertexBuffer: VertexBuffer;

		// tslint:disable-next-line:max-line-length
		constructor(vertexData: Array<number>, indexData: Array<number>, uvData: Array<number>, normalData: Array<number>, materials?: Array<string>) {
			this.vertexData = vertexData;
			this.indexData = indexData;
			this.uvData = uvData;
			this.normalData = normalData;
			this.indexed = indexData != null ? true : false;
			this.materials = materials || this.materials;
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

		public initialize(material: Material, renderer: Renderer) {
			this.gl = renderer.context;
			renderer.bindMaterial(material);
			let attributes = material.getAttributes(renderer);
			let stride = material.getAttrStride();
			this.vertDataBuffer = new DataBuffer32(stride * (this.vertexData.length / 7));

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
					this.vertexBuffer.addAttribute(element.gpuLoc, element.items, element.type, element.normalized, stride, element.offset);
				}
			}

			let index = this.vertDataBuffer.allocate(this.vertexData.length);
			let uvIndex = 0;
			let colorIndex = 0;
			let normalIndex = 0;
			let floatBuffer = this.vertDataBuffer.floatView;

			let vertices = this.vertexData;
			let normals = this.normalData;
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

				floatBuffer[index++] = vertices[i++]; // COLOR
				floatBuffer[index++] = vertices[i++]; // COLOR
				floatBuffer[index++] = vertices[i++]; // COLOR
				floatBuffer[index++] = vertices[i]; // COLOR
				floatBuffer[index++] = normals[normalIndex++];
				floatBuffer[index++] = normals[normalIndex++];
				floatBuffer[index++] = normals[normalIndex++];
			}

			this.vertexBuffer.updateResource(floatBuffer, 0);
			if (this.indexed) {
				this.indexDataBuffer = new DataBuffer16(2 * this.indexData.length);
				this.indexBuffer = renderer.resourceManager.createBuffer(
					this.gl.ELEMENT_ARRAY_BUFFER, this.indexDataBuffer.getByteCapacity(), this.gl.STATIC_DRAW) as IndexBuffer;
				let uintIndexBuffer = this.indexDataBuffer.uintView;
				let indices = this.indexData;
				index = this.indexDataBuffer.allocate(indices.length);
				for (let i = 0; i < indices.length; i++) {
					uintIndexBuffer[i] = indices[i];
					this.vertexCount++;
				}
				this.indexBuffer.updateResource(uintIndexBuffer, 0);
			} else {
				this.vertexCount = vertices.length / 7;
			}
			this.initialized = true;
		}

		public bind() {
			this.vertexBuffer.bind();
			if (this.indexed) {
				this.indexBuffer.bind();
			}
		}
	}
}
