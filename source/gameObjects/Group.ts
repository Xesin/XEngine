namespace XEngine {

	export class Group extends GameObject {
		public children: Array<GameObject>;
		constructor(game: Game, posX: number, posY: number) {
			super(game, posX, posY);
			this.children = new Array<GameObject>();
		}

		public _beginRender(gl: WebGLRenderingContext) {
			return;
		}

		public update(deltaTime: number) {
			this.children = this.children.removePending();
			let childLenght = this.children.length - 1;
			for (let i = childLenght; i >= 0; i--) {
				let gameObject = this.children[i];
				if (gameObject.alive) {
					gameObject.update(deltaTime);
					if (Sprite.prototype.isPrototypeOf(gameObject)) {
						(gameObject as Sprite)._updateAnims(this.game.time.deltaTimeMillis);
					}
				}
			}
		}

		public getFirstDead() {
			for (let i = this.children.length - 1; i >= 0; i--) {
				let gameObject = this.children[i];
				if (!gameObject.alive) {
					return gameObject;
				}
			}
			return null;
		}

		public getChildAtIndex(index) {
			return this.children[index];
		}

		public childCount() {
			return this.children.length;
		}

		public destroy() {
			this.kill();
			this.isPendingDestroy = true;
			for (let i = this.children.length - 1; i >= 0; i--) {
				let gameObject = this.children[i];
				if (gameObject.destroy !== undefined) {
					gameObject.destroy();
					delete this.children[i];
				}
			}
			this.children = [];
			if (this.onDestroy !== undefined) {
				this.onDestroy();
			}
		}

		public add(gameObject) {
			if (this.game.updateQueue.indexOf(gameObject) >= 0) {
				let index = this.game.updateQueue.indexOf(gameObject);
				this.game.updateQueue.splice(index, 1);
			}
			if (this.game.renderQueue.indexOf(gameObject) >= 0) {
				let index = this.game.renderQueue.indexOf(gameObject);
				this.game.renderQueue.splice(index, 1);
			}
			if (gameObject.parent.constructor === XEngine.Group && gameObject.parent.children.indexOf(gameObject) >= 0) {
				let index = gameObject.parent.children.indexOf(gameObject);
				gameObject.parent.children.splice(index, 1);
			}
			this.children.push(gameObject);
			if (gameObject.start !== undefined) {
				gameObject.start();
			}
			gameObject.parent = this;
			return gameObject;
		}

		public setAll(property, value) {
			for (let i = this.children.length - 1; i >= 0; i--) {
				this.children[i][property] = value;
			}
		}

		public callAll(funct) {
			for (let i = this.children.length - 1; i >= 0; i--) {
				if (this.children[i][funct] !== undefined) {
					this.children[i][funct]();
				}
			}
		}
	}
}
