namespace XEngine {

	export class Mesh extends GameObject {

		private static currentVertices = new Array<number>();
		private static renderVerts = new Array<number>();

		protected indexDataBuffer: XEngine.DataBuffer16;
		protected vertDataBuffer: XEngine.DataBuffer32;
		protected indexBuffer: IndexBuffer;
		protected myVertexBuffer: VertexBuffer;
		private buffer: any;
		private programInfo: any;
		private vertices: Array<number>;


		constructor(game: Game, posX: number, posY: number, posZ: number) {
			super(game, posX, posY, posZ);
			this.game = game;
			this.shader = XEngine.SimpleMaterial.shader;
			this.shader.initializeShader(this.game.context);
		}

		public setVertices(vertices: Array<number>, indices: Array<number>, uv?: Array<number>, vertColors?: Array<number>) {
			if (!vertices.equals(Mesh.currentVertices)) {
				this.vertices = vertices;
				Mesh.currentVertices = vertices;
			} else {
				this.vertices = Mesh.currentVertices;
			}
			this.vertDataBuffer = new XEngine.DataBuffer32(4 * vertices.length + 4 * uv.length);
			this.indexDataBuffer = new XEngine.DataBuffer16(2 * indices.length);

			this.myVertexBuffer = this.game.renderer.resourceManager.createBuffer(
				this.gl.ARRAY_BUFFER, this.vertDataBuffer.getByteCapacity(), this.gl.STREAM_DRAW) as VertexBuffer;
			this.myVertexBuffer.addAttribute(this.shader.vertPosAtt, 3, this.game.context.FLOAT, false, 20, 0);
			this.myVertexBuffer.addAttribute(this.shader.vertUvAtt, 2, this.game.context.FLOAT, false, 20, 12);
			this.indexBuffer = this.game.renderer.resourceManager.createBuffer(
				this.gl.ELEMENT_ARRAY_BUFFER, this.indexDataBuffer.getByteCapacity(), this.gl.STATIC_DRAW) as IndexBuffer;

			let floatBuffer = this.vertDataBuffer.floatView;
			// let uintBuffer = this.vertDataBuffer.uintView;
			let uintIndexBuffer = this.indexDataBuffer.uintView;

			// let pos = new XEngine.Vector(0, 0);
			// this.getWorldMatrix(this.mvMatrix);
			// pos = pos.multiplyMatrix(this.mvMatrix);
			// let alpha = this.getTotalAlpha();

			let index = this.vertDataBuffer.allocate(vertices.length);
			let uvIndex = 0;
			// tslint:disable-next-line:forin
			for (let i = 0; i < vertices.length; i++) {
				floatBuffer[index++] = vertices[i++];
				floatBuffer[index++] = vertices[i++];
				floatBuffer[index++] = vertices[i];
				let x = 0;
				let y = 0;
				if (uv !== undefined) {
					x = uv[uvIndex++];
					y = uv[uvIndex++];
				}
				floatBuffer[index++] = x;
				floatBuffer[index++] = y;
				// if (vertColors !== undefined) {
				// 	uintBuffer[index++] = vertColors[vertex];
				// } else {
				// 	uintBuffer[index++] = 0xffffff;
				// }
				// floatBuffer[index++] = alpha;
			}

			index = this.indexDataBuffer.allocate(indices.length);
			for (let i = 0; i < indices.length; i++) {
				uintIndexBuffer[i] = indices[i];
			}

			this.myVertexBuffer.updateResource(floatBuffer, 0);
			this.indexBuffer.updateResource(uintIndexBuffer, 0);
		}

		public _renderToCanvas(gl: WebGLRenderingContext) {
				let vertexDataBuffer = this.vertDataBuffer;
				this.getWorldMatrix(this.mvMatrix);
				let shader = this.shader as SimpleMaterial;
				shader.bind(this.game.renderer);

				if (Mesh.renderVerts !== this.vertices) {
					Mesh.renderVerts = this.vertices;
					this.myVertexBuffer.bind();
					this.indexBuffer.bind();
				}

				shader.uniforms.mvpMatrix.value = this.mvMatrix;
				shader.baseUniforms.pMatrix.value = this.game.camera.pMatrix;
				shader.updateUniforms(gl);

				gl.drawElements(gl.TRIANGLES, this.indexDataBuffer.wordLength, gl.UNSIGNED_SHORT, 0);
		}

		public reset(x: number, y: number) {
			this.position.x = x;
			this.position.y = y;
			this.alive = true;
			if (this.start !== undefined) {
				this.start();
			}
			if (this.body) {
				this.body.velocity = new XEngine.Vector(0, 0);
			}
		}
	}
}
