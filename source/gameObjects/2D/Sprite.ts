namespace XEngine {

	export class Sprite extends TwoDObject {

		public sprite: string;
		public frame: string | number;
		public tilled: boolean;
		public json: any;
		public animation: AnimationManager;

		private columns: number;
		private rows: number;

		constructor(game: Game, posX: number, posY: number, sprite: string, frame: string | number) {
			super(game, posX, posY, 0);
			this.sprite = sprite;
			this.game = game;
			this.frame = frame || 0;
			let cache_image = this.game.cache.image(sprite);
			this.transform.width = cache_image.frameWidth || 10;
			this.transform.height = cache_image.frameHeight || 10;

			this.columns = Math.floor(cache_image.image.width / this.transform.width);
			this.rows = Math.floor(cache_image.image.height / this.transform.height);
			this.tilled = false;

			if (this.game.cache.getJson(sprite) !== undefined) {
				this.json = this.game.cache.getJson(sprite);
				let frameInfo: any;
				if (typeof this.frame === "string") {
					frameInfo = this.json[this.frame];
				} else {
					frameInfo = this.json.frames[this.frame];
				}
				this.transform.width = frameInfo.frame.w;
				this.transform.height = frameInfo.frame.h;
			}

			if (this.columns > 1 || this.rows > 1 || this.json !== undefined) {
				this.tilled = true;
			}
			this.materials[0] = XEngine.SpriteMat.shader;
			this.animation = new AnimationManager(game, this);
		}

		public beginRender(gl: WebGLRenderingContext) {
			return;
		}

		public renderToCanvas(gl) {
			if (this.tilled) {
				let startX = 0;
				let startY = 0;
				let endX = 0;
				let endY = 0;
				let cache_image = this.game.cache.image(this.sprite);
				if (this.json) {
					let frameInfo: any;
					if (typeof this.frame === "string") {
						frameInfo = this.json[this.frame];
					} else {
						frameInfo = this.json.frames[this.frame];
					}
					let width = frameInfo.frame.w;
					let height = frameInfo.frame.h;

					startX = frameInfo.frame.x;
					startY = frameInfo.frame.y;

					endX = startX + width;
					endY = startY + height;

					this.transform.width = width;
					this.transform.height = height;

				} else {
					let column = (this.frame as number);

					if (column > this.columns - 1) {
						column = (this.frame as number) % this.columns;
					}

					let row = Math.floor((this.frame as number) / this.columns);

					startX = column * cache_image.frameWidth;
					startY = row * cache_image.frameHeight;

					endX = startX + cache_image.frameWidth;
					endY = startY + cache_image.frameHeight;
				}

				let startUvX = startX / cache_image.image.width;
				let startUvY = startY / cache_image.image.height;

				let endUvX = endX / cache_image.image.width;
				let endUvY = endY / cache_image.image.height;

				this._uv = [
					startUvX, startUvY,
					startUvX, endUvY,
					endUvX, startUvY,
					endUvX, endUvY,
				];
			}
			this.game.renderer.spriteBatch.addSprite(this, this.materials);
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

		public _updateAnims(deltaMillis: number) {
			this.animation.update(deltaMillis);
		}
	}
}
