namespace XEngine {

	export class Mesh extends GameObject {

		protected indexDataBuffer = new XEngine.DataBuffer16(2 * 3);
		protected vertDataBuffer = new XEngine.DataBuffer32(26 * 4);
		protected indexBuffer: IndexBuffer;
		protected vertexBuffer: VertexBuffer;

		constructor(game: Game, posX: number, posY: number) {
			super(game, posX, posY);
			this.game = game;
			this.vertexBuffer = this.game.renderer.resourceManager.createBuffer(
				this.gl.ARRAY_BUFFER, this.vertDataBuffer.getByteCapacity(), this.gl.STREAM_DRAW) as VertexBuffer;
			this.indexBuffer = this.game.renderer.resourceManager.createBuffer(
				this.gl.ELEMENT_ARRAY_BUFFER, this.indexDataBuffer.getByteCapacity(), this.gl.STREAM_DRAW) as IndexBuffer;
			this.shader = this.game.renderer.spriteBatch.shader;
		}

		public _beginRender(gl: WebGLRenderingContext) {
			return;
		}

		public setVertices(vertices: Array<Vector>, indices: Array<number>, uv?: Array<Vector>, vertColors?: Array<number>) {
			this.vertDataBuffer.clear();
			this.indexDataBuffer.clear();
			this.vertDataBuffer = new XEngine.DataBuffer32(26 * vertices.length);
			this.indexDataBuffer = new XEngine.DataBuffer16(2 * indices.length);

			let floatBuffer = this.vertDataBuffer.getUsedBufferAsFloat();
			let uintBuffer = this.vertDataBuffer.getUsedBufferAsUint();
			let uintIndexBuffer = this.indexDataBuffer.getUsedBufferAsUint();

			let index = 0;
			let pos = new XEngine.Vector(0, 0);
			this.getWorldMatrix(this.mvMatrix);
			pos = pos.multiplyMatrix(this.mvMatrix);
			let alpha = this.getTotalAlpha();

			for (let vertex in vertices) {
				floatBuffer[index++] = vertices[vertex].x;
				floatBuffer[index++] = vertices[vertex].y;
				floatBuffer[index++] = vertices[vertex].z;
				let x = 0;
				let y = 0;
				if(uv !== undefined) {
					x = uv[vertex].x;
					y = uv[vertex].y;
				}
				floatBuffer[index++] = x;
				floatBuffer[index++] = y;
				if(vertColors !== undefined) {
					uintBuffer[index++] = vertColors[vertex];
				} else {
					uintBuffer[index++] = 0xffffff;
				}
				floatBuffer[index++] = alpha;
			}

			index = 0;

			for (let i = 0; i < indices.length; i++) {
				uintIndexBuffer[i] = indices[i];
			}

			this.vertexBuffer.updateResource(floatBuffer, 0);
			this.indexBuffer.updateResource(uintIndexBuffer, 0);
		}

		public _renderToCanvas(gl) {
				let vertexDataBuffer = this._vertDataBuffer;

				this.shader.bind(this.gl);
				this.shader.baseUniforms.pMatrix.value = this.game.camera.pMatrix;
				this.shader.updateUniforms(this.gl);
				this.vertexBuffer.bind();
				this.indexBuffer.bind();

				gl.drawElements(gl.TRIANGLES, vertexDataBuffer.wordLength, gl.UNSIGNED_SHORT, 0);
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
