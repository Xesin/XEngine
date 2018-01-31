namespace XEngine {

	export class BitmapText extends GameObject {

		public sprite: string;
		public bitmapData: BitmapData;

		private text: string;
		private atlasWidth: number;
		private atlasHeight: number;
		private spriteArrays: Array<Sprite>;

		constructor(game: Game, posX: number, posY: number, fontName: string, text: string) {
			super(game, posX, posY);
			this.sprite = fontName;
			this.game = game;
			this.width = 10;
			this.height = 10;
			this.bitmapData = this.game.cache.bitmapData[fontName];
			let cache_image = this.game.cache.image(fontName);
			this.atlasWidth = cache_image.frameWidth || 10;
			this.atlasHeight = cache_image.frameHeight || 10;
			this.position.setTo(posX, posY);
			this.shader = this.game.renderer.spriteBatch.shader;
			this.setText(text);
		}

		public setText(text: string) {
			delete this.spriteArrays;
			this.text = text;
			let charArray = text.split("");
			this.spriteArrays = new Array<Sprite>(charArray.length);
			let startX = 0;
			for (let char of charArray) {
				if (char !== undefined) {
					let charCode = char.charCodeAt(0);
					let charData = this.bitmapData.chars[charCode];
					if (charData != null) {
						let newSprite = new Sprite(this.game, this.position.x + startX, this.position.y + charData.yoffset, this.sprite, 0);
						let uvs = [
							charData.x / this.atlasWidth, charData.y / this.atlasHeight,
							charData.x / this.atlasWidth, (charData.y + charData.height) / this.atlasHeight,
							(charData.x + charData.xadvance) / this.atlasWidth, charData.y / this.atlasHeight,
							(charData.x + charData.xadvance) / this.atlasWidth, (charData.y + charData.height) / this.atlasHeight,
						];
						newSprite._setVertices(charData.width, charData.height, newSprite.color, uvs);
						newSprite.shader = this.shader;
						this.spriteArrays.push(newSprite);
						startX += charData.width;
					}
				}
			}
		}

		public _beginRender(gl: WebGLRenderingContext) {
			return;
		}

		public _renderToCanvas(gl) {
			for (let spriteToAdd of this.spriteArrays) {
				if (spriteToAdd !== undefined) {
					this.game.renderer.spriteBatch.addSprite(spriteToAdd, this.shader);
				}
			}
		}

		public reset(x: number, y: number) {
			this.position.x = x;
			this.position.y = y;
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
