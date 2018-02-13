namespace XEngine {

	export class Mesh extends GameObject {

		private static currentVertices = new Array<number>();
		private static renderVerts = new Array<number>();

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
