namespace XEngine2 
{
    export class StaticMesh
    {
        public initialized = false;
		public vertexCount = 0;
		public indexed = true;
		public groups: Array<MeshGroup>;
		public materials: Material[];
		public topology: Topology;

		protected uvData: Array<number>;
		protected vertexData: Array<number>;
		protected indexData: Array<number>;
		protected normalData: Array<number>;
		protected indexDataBuffer: XEngine.DataBuffer16;
		protected vertDataBuffer: DataBuffer32[];
		protected gl: WebGL2RenderingContext;

		protected indexBuffer: IndexBuffer[];
		protected vertexBuffer: VertexBuffer[];

		// tslint:disable-next-line:max-line-length
		constructor(vertexData: Array<number>, indexData: Array<number>, uvData: Array<number>, normalData: Array<number>, materials: Array<Material> = new Array(), topology = Topology.TRIANGLES) {
			this.vertexData = vertexData;
			this.indexData = indexData;
			this.uvData = uvData;
			this.normalData = normalData;
			this.indexed = indexData != null ? true : false;
			this.groups = new Array();
			this.vertexBuffer = new Array();
			this.vertDataBuffer = new Array();
			this.indexBuffer = new Array();
			this.materials = materials;
			this.topology = topology;
		}

		public destroy () {
			if (this.indexBuffer.length > 0) {
				for(let i = 0; i < this.indexBuffer.length ; i++){
					this.gl.deleteBuffer(this.indexBuffer[i].buffer);
				}
			}
			if (this.vertexBuffer.length > 0) {
				for(let i = 0; i < this.vertexBuffer.length ; i++){
					this.gl.deleteBuffer(this.vertexBuffer[i].buffer);
				}
			}
		}

		public initialize(renderer: Renderer) {
			this.gl = renderer.gl;

			for(let i = 0; i < this.groups.length; i++){
				let material = this.materials[this.groups[i].materialIndex];
				material.initialize(renderer.gl);
				let stride = material.AttrStride;
				this.vertDataBuffer[i] = new DataBuffer32((this.groups[i].vertexCount) * 4);
				this.vertexBuffer[i] = VertexBuffer.Create(this.gl.ARRAY_BUFFER, this.vertDataBuffer[i].getByteCapacity(), this.gl.STATIC_DRAW, this.gl);

				let index = this.vertDataBuffer[i].allocate(this.vertexData.length);
				let uvIndex = 0;
				let normalIndex = 0;
				let floatBuffer = this.vertDataBuffer[i].floatView;
				
				for (const key in material.VertexAttributes) {
					if (material.VertexAttributes.hasOwnProperty(key)) {
						const vertexAttr = material.VertexAttributes[key];
						this.vertexBuffer[i].addAttribute(vertexAttr, stride);
					}
				}

				let vertices = this.vertexData;
				let normals = this.normalData;
				let uv = this.uvData;
				// tslint:disable-next-line:forin
				for (let i = 0; i < vertices.length; i++) {

					// Positions
					if(material.HasPosition){
						floatBuffer[index++] = vertices[i++];
						floatBuffer[index++] = vertices[i++];
						floatBuffer[index++] = vertices[i];
					}
				}

				this.vertexBuffer[i].updateResource(floatBuffer, 0);

				if (this.groups[i].indices) {
					this.indexDataBuffer = new DataBuffer16(2 * this.indexData.length);
					this.indexBuffer[i] = IndexBuffer.Create(
						this.gl.ELEMENT_ARRAY_BUFFER, this.indexDataBuffer.getByteCapacity(), this.gl.DYNAMIC_DRAW, this.gl);
					let uintIndexBuffer = this.indexDataBuffer.uintView;
					let indices = this.indexData;
					this.indexDataBuffer.allocate(indices.length);
					for (let i = 0; i < indices.length; i++) {
						uintIndexBuffer[i] = indices[i];
					}
					this.indexBuffer[i].updateResource(uintIndexBuffer, 0);
				}
			}

			this.initialized = true;
		}

		public addGroup(start, count, materialIndex, indices = null) {
			this.groups.push(new MeshGroup(materialIndex, start, count, this, indices));
		}

		public bind(materialIndex = 0) {
			this.vertexBuffer[materialIndex].bind();
			if (this.indexed) {
				this.indexBuffer[materialIndex].bind();
			}
		}

		public unBind(materialIndex = 0) {
			this.vertexBuffer[materialIndex].unbind();
			if (this.indexed) {
				this.indexBuffer[materialIndex].unbind();
			}
		}
    }
}