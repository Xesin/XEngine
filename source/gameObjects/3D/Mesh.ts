namespace XEngine {

	export class Mesh extends GameObject {
		public geometry: Geometry;
		protected transposed = mat4.create();

		constructor(game: Game, posX: number, posY: number, posZ: number, geometry: Geometry, material?: Material | Array<Material>) {
			super(game, posX, posY, posZ);
			this.game = game;
			if (material === undefined) {
				this.shader =  XEngine.LambertMaterial.shader;
				if (geometry.materials.length > 0) {
					this.shader = this.game.cache.materials[geometry.materials[0]];
				}
			} else {
				this.shader = material as Material;
			}
			this.geometry = geometry;
			this.shader.baseUniforms.pMatrix.value = this.game.camera.pMatrix;
			this.shader.baseUniforms.viewMatrix.value = this.game.camera.viewMatrix.elements;
		}

		public _renderToCanvas(gl: WebGLRenderingContext) {
			let renderer = this.game.renderer;
			let vertexDataBuffer = this.vertDataBuffer;
			let shader = this.shader as LambertMaterial;
			renderer.bindMaterial(this.shader);

			if (!this.geometry.initialized) {
				this.geometry.initialize(this.shader, this.game.renderer);
			}

			this.geometry.bind();

			if (this.transform.dirty) {
				this.getWorldMatrix(this.modelMatrix);
				mat4.invert(this.transposed, this.modelMatrix);
				mat4.transpose(this.transposed, this.transposed);
				this.transform.dirty = false;
			}
			if (this.game.camera.dirty) {
				this.shader.baseUniforms.pMatrix.value = this.game.camera.pMatrix;
				this.shader.baseUniforms.viewMatrix.value = this.game.camera.viewMatrix.elements;
			}
			shader.baseUniforms.modelMatrix.value = this.modelMatrix;
			shader.baseUniforms.normalMatrix.value = this.transposed;

			shader.updateUniforms(gl);
			if (this.geometry.indexed) {
				gl.drawElements(gl.TRIANGLES, this.geometry.vertexCount, gl.UNSIGNED_SHORT, 0);
			} else {
				gl.drawArrays(gl.TRIANGLES, 0, this.geometry.vertexCount);
			}
		}

		public reset(x: number, y: number) {
			this.transform.position.x = x;
			this.transform.position.y = y;
			this.alive = true;
			if (this.start !== undefined) {
				this.start();
			}
			if (this.body) {
				this.body.velocity = new XEngine.Vector3(0, 0);
			}
		}
	}
}
