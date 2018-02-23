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
		public viewMatrix: Array<number>;
		public follow: boolean;
		public offsetLeft: number;
		public offsetUp: number;
		public dirty: boolean;
		public lookAt: Vector;

		private _dirty: boolean;

		constructor(game: Game, posX = 0, posY = 0, posZ = 0) {
			super(game, posX, posY, posZ);
			this.followedObject = null;
			this.axis = XEngine.AXIS.BOTH;
			this._dirty = true;
			this.pMatrix = mat4.create();
			this.uiMatrix = mat4.create();
			this.viewMatrix = mat4.create();
			this.lookAt = new Vector(0 , 0, -1);
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
			let right = this.game.width + this.transform.position.x;
			let up = this.game.height + this.transform.position.y;
			const fieldOfView = 45 * Math.PI / 180;   // in radians
			const aspect = this.game.width / this.game.height;
			const zNear = 0.1;
			const zFar = 1000.0;

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
				mat4.lookAt(this.viewMatrix, pos, center, [0, 1, 0]);

				mat4.ortho(this.uiMatrix, this.transform.position.x , right, up, this.transform.position.y, 0, 100);
			}
		}

		public getWorldMatrix (childMatrix: Array<number>) {
			this.parent.getWorldMatrix(childMatrix);
			let translation = [this.transform.position.x, this.transform.position.y, this.transform.position.z];
			mat4.translate(childMatrix, childMatrix, translation);
			mat4.rotateX(childMatrix, childMatrix, this.transform.rotation.x * XEngine.Mathf.TO_RADIANS);
			mat4.rotateY(childMatrix, childMatrix, this.transform.rotation.y * XEngine.Mathf.TO_RADIANS);
			mat4.rotateZ(childMatrix, childMatrix, this.transform.rotation.z * XEngine.Mathf.TO_RADIANS);
			mat4.invert(childMatrix, childMatrix);
			return childMatrix;
		}

	}

	Object.defineProperties(Camera.prototype, {
		dirty: {
			get: function() {
				return this._dirty || this.transform.dirty;
			},

			set: function(value) {
				this._dirty = this.transform.dirty = value;
			},
		},
	});
}
