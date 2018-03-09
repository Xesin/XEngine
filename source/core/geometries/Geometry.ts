namespace XEngine {
	declare var mat4: any;
	export class Geometry {

		public initialized = false;
		public vertexCount = 0;
		public indexed = true;
		public materials = new Array<string>();
		public groups: Array<{materialIndex: number, start: number, count: number}>;

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
			this.groups = new Array();
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
			let tangentIndex = 0;
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

		public addGroup(start, count, materialIndex) {
			this.groups.push({materialIndex: materialIndex, start: start, count: count});
		}

		// public CalculateTangentArray(vertexCount: number) {
		// 	let tan1 = new Array(vertexCount);
		// 	let triangleCount = vertexCount / 3;
		// 	let biTangents = new Array<Vector3>();
		// 	for (let a = 0; a < triangleCount; a++) {
		// 		let index1 = a * 21;
		// 		let index2 = index1 + 7;
		// 		let index3 = index2 + 7;

		// 		const v1 = new Vector3(this.vertexData[index1], this.vertexData[index1 + 1], this.vertexData[index1 + 2]);
		// 		const v2 = new Vector3(this.vertexData[index2], this.vertexData[index2 + 1], this.vertexData[index2 + 2]);
		// 		const v3 = new Vector3(this.vertexData[index3], this.vertexData[index3 + 1], this.vertexData[index3 + 2]);

		// 		index1 = a * 6;
		// 		index2 = index1 + 2;
		// 		index3 = index2 + 2;
		// 		const w1 = new Vector3(this.uvData[index1], this.uvData[index1 + 1]);
		// 		const w2 = new Vector3(this.uvData[index2], this.uvData[index2 + 1]);
		// 		const w3 = new Vector3(this.uvData[index3], this.uvData[index3 + 1]);

		// 		const x1 = v2.x - v1.x;
		// 		const x2 = v3.x - v1.x;
		// 		const y1 = v2.y - v1.y;
		// 		const y2 = v3.y - v1.y;
		// 		const z1 = v2.z - v1.z;
		// 		const z2 = v3.z - v1.z;
		// 		const s1 = w2.x - w1.x;
		// 		const s2 = w3.x - w1.x;
		// 		const t1 = w2.y - w1.y;
		// 		const t2 = w3.y - w1.y;

		// 		let tangent: Vector3;
		// 		let r = 1.0 / (s1 * t2 - s2 * t1);

		// 		if (r === Infinity) {
		// 			tangent = Vector3.Zero;
		// 		} else {
		// 			// tslint:disable-next-line:max-line-length
		// 			tangent = new Vector3((t2 * x1 - t1 * x2) * r, (t2 * y1 - t1 * y2) * r,
		// 		(t2 * z1 - t1 * z2) * r);
		// 		}
		// 		let bitangent = new Vector3((s1 * x2 - s2 * x1) * r, (s1 * y2 - s2 * y1) * r,
		// 		(s1 * z2 - s2 * z1) * r);
		// 		let cross = new Vector3();
		// 		cross.crossVectors(tangent.normalize(), bitangent.normalize());
		// 		// this.tangentData.push(1, 1, 1);
		// 		// this.tangentData.push(1, 1, 1);
		// 		// this.tangentData.push(1, 1, 1);
		// 		biTangents.push(bitangent);
		// 		biTangents.push(bitangent);
		// 		biTangents.push(bitangent);
		// 		this.tangentData.push(tangent.x, tangent.y, tangent.z, 1.0);
		// 		this.tangentData.push(tangent.x, tangent.y, tangent.z, 1.0);
		// 		this.tangentData.push(tangent.x, tangent.y, tangent.z, 1.0);
		// 	}

		// 	for (let a = 0; a < vertexCount; a++) {
		// 		let index1 = a * 3;
		// 		let index2 = a * 4;
		// 		let n = new Vector3(this.normalData[index1], this.normalData[index1 + 1], this.normalData[index1 + 2]);
		// 		let t = new Vector3(this.tangentData[index2], this.tangentData[index2 + 1], this.tangentData[index2 + 2]);

		// 		// Gram-Schmidt orthogonalize
		// 		let tan = t.sub(n.scalar(n.dot(t))).normalize();
		// 		this.tangentData[index2] = tan.x;
		// 		this.tangentData[index2 + 1] = tan.y;
		// 		this.tangentData[index2 + 2] = tan.z;
		// 		// // Calculate handedness
		// 		n = new Vector3(this.normalData[index1], this.normalData[index1 + 1], this.normalData[index1 + 2]);
		// 		t = new Vector3(this.tangentData[index2], this.tangentData[index2 + 1], this.tangentData[index2 + 2]);
		// 		let cross = new Vector3();
		// 		cross.crossVectors(n, t);
		// 		this.tangentData[index2 + 3] = cross.dot(biTangents[a]) < 0.0 ? -1.0 : 1.0;
		// 	}
		// }

		public bind() {
			this.vertexBuffer.bind();
			if (this.indexed) {
				this.indexBuffer.bind();
			}
		}
	}
}
