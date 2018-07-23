/// <reference path="../gameObjects/GameObject.ts"/>
namespace XEngine {
	declare var mat4: any;
	export enum AXIS {
		NONE = "none",
		HORIZONTAL = "horizontal",
		VERTICAL = "vertical",
		BOTH = "both",
	}

	export class Camera extends GameObject {
		public followedObject: GameObject;
		public axis: AXIS;
		public pMatrix: Array<number>;
		public uiMatrix: Array<number>;
		public viewMatrix: Mat4;
		public follow: boolean;
		public offsetLeft: number;
		public offsetUp: number;
		public lookAt: Vector3;
		public renderTarget: RenderTarget;

		private _dirty: boolean;
		private readonly upVector = new Vector3(0, 1, 0);

		constructor(game: Game, posX = 0, posY = 0, posZ = 0) {
			super(game, posX, posY, posZ);
			this.followedObject = null;
			this.axis = XEngine.AXIS.BOTH;
			this._dirty = true;
			this.pMatrix = mat4.create();
			this.uiMatrix = mat4.create();
			this.viewMatrix = new Mat4();
			this.transform.matrix = this.viewMatrix;
			this.lookAt = new Vector3(0 , 0, -1);

			let right = this.game.width;
			let up = this.game.height;
			mat4.ortho(this.uiMatrix, 0.0, right, up, 0, 0.0, 100);
		}

		public followObject(gameObject: GameObject, offsetLeft: number, offsetUp: number) {
			this.follow = true;
			this.offsetLeft = offsetLeft || 0;
			this.offsetUp = offsetUp || 0;
			this.followedObject = gameObject;
		}

		public update() {
			if (this.followedObject != null) {
				if (this.axis === XEngine.AXIS.BOTH || this.axis === XEngine.AXIS.HORIZONTAL) {
					if (
						(this.followedObject.transform.position.x - this.offsetLeft) - this.game.width / 2 > 0 &&
						(this.followedObject.transform.position.x + this.offsetLeft) + this.game.width / 2 < this.game.worldWidth) {
						this.transform.position.x = this.followedObject.transform.position.x - this.game.width / 2 - this.offsetLeft;
					}
				}
				if (this.axis === XEngine.AXIS.BOTH || this.axis === XEngine.AXIS.VERTICAL) {
					if (
						(this.followedObject.transform.position.y - this.offsetUp) - this.game.height / 2 > 0 &&
						(this.followedObject.transform.position.y + this.offsetUp) + this.game.height / 2 < this.game.worldHeight) {
						this.transform.position.y = this.followedObject.transform.position.y - this.game.height / 2 - this.offsetUp;
					}
				}
			}
			let right = this.game.width;
			let up = this.game.height;
			const fieldOfView = 45 * Math.PI / 180;   // in radians
			const aspect = this.game.width / this.game.height;
			const zNear = 0.1;
			const zFar = 2500.0;

			// note: glmatrix.js always has the first argument
			// as the destination to receive the result.
			if (this.dirty) {
				mat4.perspective(this.pMatrix,
								fieldOfView,
								aspect,
								zNear,
								zFar);

				let pos = [this.transform.position.x, this.transform.position.y, this.transform.position.z ];
				let center = [this.lookAt.x, this.lookAt.y, this.lookAt.z];
				// this.viewMatrix.lookAt(this.transform.position, this.lookAt, this.upVector);
				// tslint:disable-next-line:max-line-length
				this.viewMatrix.FPSView(this.transform.position, this.transform.rotation.x * Mathf.TO_RADIANS, this.transform.rotation.y * Mathf.TO_RADIANS);
				// mat4.lookAt(this.viewMatrix.elements, pos, center, [0, 1, 0]);

				mat4.ortho(this.uiMatrix, 0.0, right, up, 0, 0.0, 100);
			}
		}

		public render(renderer: Renderer) {
			// TODO: Get objects in frustrum
			renderer.render(this.game.renderQueue, this);
		}

		get dirty(): boolean {
			return this._dirty || this.transform.dirty || this.lookAt.dirty;
		}

		set dirty(value: boolean) {
			this._dirty = this.transform.dirty = this.lookAt.dirty = value;
		}

	}
}
