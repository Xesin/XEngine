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
			this.transform.position.setTo(posX, posY);
			this.materials[0] = this.game.renderer.spriteBatch.shader;
			this.setText(text);
		}

		public setText(text: string) {
			delete this.spriteArrays;
			this.text = text;
			let charArray = text.split("");
			this.spriteArrays = new Array<Sprite>(charArray.length);
			let startX = 0;
			let startY = 0;
			let maxX = 0;
			for (let i = 0; i < charArray.length; i++) {
				let char = charArray[i];
				if (char !== undefined) {
					let charCode = char.charCodeAt(0);
					let charData = this.bitmapData.chars[charCode];
					if (charData != null) {
						if (charCode !== 32 && charCode !== 10) {
							if (i !== 0) {
								let prevCharCode = charArray[i - 1].charCodeAt(0);
								if (this.bitmapData.kerning[prevCharCode] !== undefined && this.bitmapData.kerning[prevCharCode][charCode] !== undefined) {
									startX += this.bitmapData.kerning[prevCharCode][charCode];
								}
							}
							let newSprite = new Sprite(this.game,
								startX + charData.xoffset,
								startY + charData.yoffset,
								this.sprite, 0);
							let uvs = [
								charData.x / this.atlasWidth, 1 - (charData.y / this.atlasHeight),
								charData.x / this.atlasWidth, 1 - ((charData.y + charData.height) / this.atlasHeight),
								(charData.x + charData.width) / this.atlasWidth, 1 - (charData.y / this.atlasHeight),
								(charData.x + charData.width) / this.atlasWidth, 1 - ((charData.y + charData.height) / this.atlasHeight),
							];
							newSprite._setVertices(charData.width, charData.height, newSprite.color, uvs);
							newSprite.materials = this.materials;
							newSprite.parent = this;
							this.spriteArrays.push(newSprite);
							startX += charData.xadvance;
						} else if (charCode === 32) {
							startX += charData.xadvance;
						}
						if (startX > maxX) {
							maxX = startX;
						}
					} else if (charCode === 10) {
						startY += this.bitmapData.lineHeight;
						if (startX > startX) {
							maxX = startX;
						}
						startX = 0;
					} else if (charCode === 32) {
						startX += 20;
					}
				}
				this.width = maxX;
				this.height = startY + this.bitmapData.lineHeight;
			}
		}

		public _beginRender(gl: WebGLRenderingContext) {
			return;
		}

		public _renderToCanvas(gl) {
			for (let spriteToAdd of this.spriteArrays) {
				if (spriteToAdd !== undefined) {
					this.game.renderer.spriteBatch.addSprite(spriteToAdd, this.materials);
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
