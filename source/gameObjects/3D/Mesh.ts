namespace XEngine {

	export class Mesh extends GameObject {
		public geometry: Geometry;
		protected transposed = mat4.create();

		constructor(game: Game, posX: number, posY: number, posZ: number, geometry: Geometry, material?: Material | Array<Material>) {
			super(game, posX, posY, posZ);
			this.game = game;
			if (material === undefined) {
				this.materials[0] = XEngine.PhongMaterial.shader;
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
				this.materials[i].baseUniforms.pMatrix.value = this.game.camera.pMatrix.elements;
				this.materials[i].baseUniforms.eyePos.value = this.game.camera.transform.position;
				this.materials[i].baseUniforms.viewMatrix.value = this.game.camera.viewMatrix.elements;
			}
		}

		public render(gl: WebGL2RenderingContext, camera: Camera, material?: Material) {
			let renderer = this.game.renderer;
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
			
			if(geometry.indexed)
			{
				renderer.bindMaterial(this.materials[0]);

				this.materials[0].baseUniforms.pMatrix.value = camera.pMatrix.elements;
				this.materials[0].baseUniforms.eyePos.value = camera.transform.position;
				this.materials[0].baseUniforms.viewMatrix.value = camera.viewMatrix.elements;
				this.materials[0].baseUniforms.modelMatrix.value = this.transform.matrix.elements;
				this.materials[0].baseUniforms.normalMatrix.value = this.transposed;
				if (this.materials[0].lightOn) {
					this.materials[0].updateLights(gl, this.game.lights);
				}
				this.materials[0].updateUniforms(gl);
				gl.drawElements(gl.TRIANGLES, geometry.vertexCount, gl.UNSIGNED_SHORT, 0);
			}else{
				let currentMat: Material;
				for (let i = 0; i < geometry.groups.length; i ++) {
					let group = geometry.groups[i];
					if(currentMat != this.materials[group.materialIndex])
					{
						currentMat = this.materials[group.materialIndex];
						renderer.bindMaterial(currentMat);
						currentMat.baseUniforms.pMatrix.value = camera.pMatrix.elements;
						currentMat.baseUniforms.eyePos.value = camera.transform.position;
						currentMat.baseUniforms.viewMatrix.value = camera.viewMatrix.elements;
						currentMat.baseUniforms.modelMatrix.value = this.transform.matrix.elements;
						currentMat.baseUniforms.normalMatrix.value = this.transposed;
						if (currentMat.lightOn) {
							currentMat.updateLights(gl, this.game.lights);
						}
						currentMat.updateUniforms(gl);
					}
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
		}
	}
}
