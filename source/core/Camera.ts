/// <reference path="../gameObjects/GameObject.ts"/>
namespace XEngine {
	export class Camera extends GameObject {
		private _pMatrix: Mat4;

		private _dirty: boolean;

		constructor(game: Game, posX = 0, posY = 0, posZ = 0) {
			super(game, posX, posY, posZ);
			this._pMatrix = new Mat4();
			this._dirty = true;
		}

		public update() {
			if (this.dirty) {
				const fieldOfView = 45 * Math.PI / 180;   // in radians
				const aspect = this.game.width / this.game.height;
				const zNear = 0.1;
				const zFar = 2500.0;

			
				this.pMatrix.perspective(
					fieldOfView,
					aspect,
					zNear,
					zFar
				);

				this.transform.matrix.FPSView(
					this.transform.position, 
					this.transform.rotation.x * Mathf.TO_RADIANS, 
					this.transform.rotation.y * Mathf.TO_RADIANS
				);
			}
		}

		public renderScene(renderer: Renderer) {
			renderer.render(this.game.renderQueue, this);
		}

		get dirty(): boolean {
			return this._dirty || this.transform.dirty;
		}

		set dirty(value: boolean) {
			this._dirty = this.transform.dirty = value
		}

		get pMatrix(): Mat4{
			return this._pMatrix;
		}

		get viewMatrix(): Mat4{
			return this.transform.matrix;
		}

		set pMatrix(matrix: Mat4){
			this._pMatrix = matrix;
		}
	}
}
