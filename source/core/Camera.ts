namespace XEngine {
	declare var mat4: any;
	export enum AXIS {
		NONE = "none",
		HORIZONTAL = "horizontal",
		VERTICAL = "vertical",
		BOTH = "both",
	}

	export class Camera {
		public position: Vector;
		public followedObject: GameObject;
		public axis: AXIS;
		public pMatrix: Array<number>;
		public uiMatrix: Array<number>;
		public follow: boolean;
		public offsetLeft: number;
		public offsetUp: number;

		private game: Game;

		constructor(game: Game) {
			this.game = game;
			this.position = new XEngine.Vector(0, 0);
			this.followedObject = null;
			this.axis = XEngine.AXIS.BOTH;

			this.pMatrix = mat4.create();
			this.uiMatrix = mat4.create();
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
						this.position.x = this.followedObject.transform.position.x - this.game.width / 2 - this.offsetLeft;
					}
				}
				if (this.axis === XEngine.AXIS.BOTH || this.axis === XEngine.AXIS.VERTICAL) {
					if (
						(this.followedObject.transform.position.y - this.offsetUp) - this.game.height / 2 > 0 &&
						(this.followedObject.transform.position.y + this.offsetUp) + this.game.height / 2 < this.game.worldHeight) {
						this.position.y = this.followedObject.transform.position.y - this.game.height / 2 - this.offsetUp;
					}
				}
			}
			let right = this.game.width + this.position.x;
			let up = this.game.height + this.position.y;
			const fieldOfView = 45 * Math.PI / 180;   // in radians
			const aspect = this.game.width / this.game.height;
			const zNear = 0.1;
			const zFar = 1000.0;

			// note: glmatrix.js always has the first argument
			// as the destination to receive the result.
			mat4.perspective(this.pMatrix,
							fieldOfView,
							aspect,
							zNear,
							zFar);
			// this.pMatrix = this.pMatrix;
			// mat4.identity(this.pMatrix);
			mat4.identity(this.uiMatrix);
			mat4.ortho(this.uiMatrix, this.position.x , right, up, this.position.y, 0.1, 100);
		}

	}
}
