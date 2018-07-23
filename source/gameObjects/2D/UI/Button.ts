/// <reference path="../Sprite.ts"/>
namespace XEngine {

	export class Button extends Sprite {

		public frameIdle: string;
		public frameDown: string;
		public frameOver: string;
		public frameUp: string;

		constructor(game: Game, posX: number, posY: number, sprite: string, frameIdle, frameDown, frameOver, frameUp) {
			super(game, posX, posY, sprite, frameIdle);
			this.frameIdle = frameIdle || sprite;
			this.frameDown = frameDown || this.frameIdle;
			this.frameOver = frameOver || this.frameIdle;
			this.frameUp = frameUp || this.frameIdle;
			this.inputEnabled = true;

			let me = this;
			this.onInputDown.add(function() { me.swapSprite(me.frameDown); } , this);
			this.onInputOver.add(function() {
				if (!me.isInputDown) {
					me.swapSprite(me.frameOver);
				}
			} , this);
			this.onInputLeft.add(function() {
				if (!me.isInputDown) {
					me.swapSprite(me.frameIdle);
				}
			}, this);
			this.onInputUp.add(function() {
				if (!me.isInputOver) {
					me.swapSprite(me.frameUp);
				} else {
					me.swapSprite(me.frameOver);
				}
			} , this);
		}

		private swapSprite(sprite: string) {
			if (!this.tilled) {
				this.sprite = sprite;
				let new_image = this.game.cache.image(this.sprite).image;
				this.transform.width = new_image.width || 10;
				this.transform.height = new_image.height || 10;
			} else {
				this.frame = sprite;
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
			}
		}
	}
}
