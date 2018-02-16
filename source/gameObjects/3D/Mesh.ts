namespace XEngine {

	export class Mesh extends GameObject {
		public geometry: Geometry;

		constructor(game: Game, posX: number, posY: number, posZ: number, geometry: Geometry, material?: Material) {
			super(game, posX, posY, posZ);
			this.game = game;
			this.shader = material == undefined ? XEngine.SimpleMaterial.shader : material;
			this.geometry = geometry;
			this.shader.initializeShader(this.game.context);
		}

		public _renderToCanvas(gl: WebGLRenderingContext) {
			let renderer = this.game.renderer;
			let vertexDataBuffer = this.vertDataBuffer;
			let shader = this.shader as SimpleMaterial;
			renderer.bindMaterial(this.shader);

			if (!this.geometry.initialized) {
				this.geometry.initialize(this.shader, this.game.renderer);
			}

			this.geometry.bind();

			this.getWorldMatrix(this.mvMatrix);
			shader.baseUniforms.mvMatrix.value = this.mvMatrix;
			shader.baseUniforms.pMatrix.value = this.game.camera.pMatrix;
			let tranposed = shader.baseUniforms.normalMatrix.value;
			mat4.invert(tranposed, shader.baseUniforms.mvMatrix.value);
			mat4.transpose(tranposed, tranposed);
			shader.baseUniforms.normalMatrix.value = tranposed;

			shader.updateUniforms(gl);

			gl.drawElements(gl.TRIANGLES, this.geometry.vertexCount, gl.UNSIGNED_SHORT, 0);
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
