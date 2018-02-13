namespace XEngine {

	export class Mesh extends GameObject {

		private static currentVertices = new Array<number>();
		private static renderVerts = new Array<number>();

		protected vertNormalsDataBuffer: XEngine.DataBuffer32;
		protected vertexNormalsBuffer: VertexBuffer;

		private buffer: any;
		private programInfo: any;
		private vertices: Array<number>;


		constructor(game: Game, posX: number, posY: number, posZ: number) {
			super(game, posX, posY, posZ);
			this.game = game;
			this.shader = XEngine.SimpleMaterial.shader;
			this.shader.initializeShader(this.game.context);
		}

		public _renderToCanvas(gl: WebGLRenderingContext) {
			let vertexDataBuffer = this.vertDataBuffer;
			let shader = this.shader as SimpleMaterial;
			shader.bind(this.game.renderer);

			this.vertexBuffer.bind();
			this.indexBuffer.bind();
			if (this.vertexNormalsBuffer) {
				this.vertexNormalsBuffer.bind();
			}

			this.getWorldMatrix(this.mvMatrix);
			shader.baseUniforms.mvMatrix.value = this.mvMatrix;
			shader.baseUniforms.pMatrix.value = this.game.camera.pMatrix;
			let tranposed = shader.baseUniforms.normalMatrix.value;
			mat4.invert(tranposed, shader.baseUniforms.mvMatrix.value);
			mat4.transpose(tranposed, tranposed);
			shader.baseUniforms.normalMatrix.value = tranposed;

			shader.updateUniforms(gl);

			gl.drawElements(gl.TRIANGLES, this.indexDataBuffer.wordLength, gl.UNSIGNED_SHORT, 0);
		}

		public setNormals(vertexNormals: Array<number>) {
			this.vertNormalsDataBuffer = new XEngine.DataBuffer32(4 * vertexNormals.length);

			if (this.vertexNormalsBuffer) {
				this.gl.deleteBuffer(this.vertexNormalsBuffer);
			}

			this.vertexNormalsBuffer = this.game.renderer.resourceManager.createBuffer(
				this.gl.ARRAY_BUFFER, this.vertNormalsDataBuffer.getByteCapacity(), this.gl.STREAM_DRAW) as VertexBuffer;
			this.vertexNormalsBuffer.addAttribute(this.shader.normalPosAttr, 3, this.game.context.FLOAT, false, 12, 0);

			let floatBuffer = this.vertNormalsDataBuffer.floatView;

			let index = this.vertNormalsDataBuffer.allocate(vertexNormals.length);
			for (let i = 0; i < vertexNormals.length; i++) {
				floatBuffer[index++] = vertexNormals[i++];
				floatBuffer[index++] = vertexNormals[i++];
				floatBuffer[index++] = vertexNormals[i];
			}

			this.vertexNormalsBuffer.updateResource(floatBuffer, 0);
		}

		public reset(x: number, y: number) {
			this.transform.position.x = x;
			this.transform.position.y = y;
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
