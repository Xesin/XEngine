namespace XEngine {

	export class Mesh extends GameObject {
		public geometry: Geometry;
		protected transposed = mat4.create();

		constructor(game: Game, posX: number, posY: number, posZ: number, geometry: Geometry, material?: Material | Array<Material>) {
			super(game, posX, posY, posZ);
			this.game = game;
			if (material === undefined) {
				this.materials[0] = XEngine.LambertMaterial.shader;
				if (geometry.materials.length > 0) {
					for (let i = 0; i < geometry.materials.length; i ++) {
						this.materials[i] = this.game.cache.materials[geometry.materials[i]];
					}
				}
			} else {
				this.materials[0] = material as Material;
			}
			this.geometry = geometry;
			for (let i = 0; i < this.materials.length; i ++) {
				this.materials[i].baseUniforms.pMatrix.value = this.game.camera.pMatrix;
				this.materials[i].baseUniforms.eyePos.value = this.game.camera.transform.position;
				this.materials[i].baseUniforms.viewMatrix.value = this.game.camera.viewMatrix.elements;
			}
		}

		public renderToCanvas(gl: WebGL2RenderingContext) {
			let renderer = this.game.renderer;
			let vertexDataBuffer = this.vertDataBuffer;
			let geometry = this.geometry;

			if (!this.geometry.initialized) {
				this.geometry.initialize(this.materials[0], this.game.renderer);
			}

			geometry.bind();

			if (this.transform.dirty) {
				mat4.invert(this.transposed, this.transform.matrix.elements);
				mat4.transpose(this.transposed, this.transposed);
				this.transform.dirty = false;
			}
			for (let i = 0; i < this.materials.length; i ++) {
				renderer.bindMaterial(this.materials[i]);
				if (this.game.camera.dirty) {
					this.materials[i].baseUniforms.pMatrix.value = this.game.camera.pMatrix;
					this.materials[i].baseUniforms.eyePos.value = this.game.camera.transform.position;
					this.materials[i].baseUniforms.viewMatrix.value = this.game.camera.viewMatrix.elements;
				}
				this.materials[i].baseUniforms.modelMatrix.value = this.transform.matrix.elements;
				this.materials[i].baseUniforms.normalMatrix.value = this.transposed;
				if (this.materials[i].lightOn) {
					this.materials[i].updateLights(gl, this.game.lights);
				}
				this.materials[i].updateUniforms(gl);
			}

			if (geometry.indexed) {
				gl.drawElements(gl.TRIANGLES, geometry.vertexCount, gl.UNSIGNED_SHORT, 0);
			} else {
				// tslint:disable-next-line:forin
				for (let i = 0; i < geometry.groups.length; i ++) {
					let group = geometry.groups[i];
					renderer.bindMaterial(this.materials[group.materialIndex]);
					gl.drawArrays(gl.TRIANGLES, group.start, group.count);
				}
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
