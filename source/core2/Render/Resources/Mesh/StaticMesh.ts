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

		protected indexBuffer: IndexBuffer;
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
			this.materials = materials;
			this.topology = topology;
		}

		public destroy () {
			if (this.indexBuffer) {
				this.gl.deleteBuffer(this.indexBuffer.buffer);
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
				let stride = this.materials[this.groups[i].materialIndex].AttrStride;
				this.vertDataBuffer[i] = new DataBuffer32(stride * (this.groups[i].vertexCount));
				this.vertexBuffer[i] = VertexBuffer.Create(this.gl.ARRAY_BUFFER, this.vertDataBuffer[i].getByteCapacity(), this.gl.STATIC_DRAW, this.gl);

				let index = this.vertDataBuffer[i].allocate(this.vertexData.length);
				let uvIndex = 0;
				let normalIndex = 0;
				let floatBuffer = this.vertDataBuffer[i].floatView;

				this.materials[this.groups[i].materialIndex].VertexAttributes.forEach(vertexAttr => {
					this.vertexBuffer[i].addAttribute(vertexAttr, this.materials[this.groups[i].materialIndex].AttrStride);
				});

				let vertices = this.vertexData;
				let normals = this.normalData;
				let uv = this.uvData;
				// tslint:disable-next-line:forin
				for (let i = 0; i < vertices.length; i++) {

					// Positions
					if(this.materials[this.groups[i].materialIndex].HasPosition){
						floatBuffer[index++] = vertices[i++];
						floatBuffer[index++] = vertices[i++];
						floatBuffer[index++] = vertices[i++];
					}
					let x = 0;
					let y = 0;

					// UV
					if(this.materials[this.groups[i].materialIndex].HasUVs){
						if (uv !== undefined) {
							x = uv[uvIndex++];
							y = uv[uvIndex++];
						}
						floatBuffer[index++] = x;
						floatBuffer[index++] = y;
					}

					// COLORS
					if(this.materials[this.groups[i].materialIndex].HasColor){
						floatBuffer[index++] = vertices[i++]; // COLOR
						floatBuffer[index++] = vertices[i++]; // COLOR
						floatBuffer[index++] = vertices[i++]; // COLOR
						floatBuffer[index++] = vertices[i]; // COLOR
					}

					// NORMALS
					if(this.materials[this.groups[i].materialIndex].HasNormals){
						floatBuffer[index++] = normals[normalIndex++];
						floatBuffer[index++] = normals[normalIndex++];
						floatBuffer[index++] = normals[normalIndex++];
					}
				}

				this.vertexBuffer[i].updateResource(floatBuffer, 0);
			}

			if (this.indexed) {
				this.indexDataBuffer = new DataBuffer16(2 * this.indexData.length);
				this.indexBuffer = IndexBuffer.Create(
					this.gl.ELEMENT_ARRAY_BUFFER, this.indexDataBuffer.getByteCapacity(), this.gl.STATIC_DRAW, this.gl);
				let uintIndexBuffer = this.indexDataBuffer.uintView;
				let indices = this.indexData;
				this.indexDataBuffer.allocate(indices.length);
				for (let i = 0; i < indices.length; i++) {
					uintIndexBuffer[i] = indices[i];
					this.vertexCount++;
				}
				this.indexBuffer.updateResource(uintIndexBuffer, 0);
			} else {
				this.vertexCount = this.vertexData.length / 7;
			}
			this.initialized = true;
		}

		public addGroup(start, count, materialIndex) {
			this.groups.push(new MeshGroup(materialIndex, start, count, this));
		}

		public bind(materialIndex = 0) {
			this.vertexBuffer[materialIndex].bind();
			if (this.indexed) {
				this.indexBuffer.bind();
			}
		}

		public unBind(materialIndex = 0) {
			this.vertexBuffer[materialIndex].unbind();
			if (this.indexed) {
				this.indexBuffer.unbind();
			}
		}
    }
}