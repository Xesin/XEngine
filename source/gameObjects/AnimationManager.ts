namespace XEngine {
	export class AnimationManager {
		public currentAnimation: Animation;
		public animations: Array<Animation>;
		private sprite: Sprite;
		private game: Game;

		constructor(game: Game, sprite: Sprite) {
			this.game = game;
			this.sprite = sprite;
			this.animations = new Array();
			this.currentAnimation = null;
		}

		public update(deltaMillis: number) {
			if (this.currentAnimation && this.currentAnimation.playing) {
				this.currentAnimation.update(deltaMillis);
			}
		}

		public play(animName: string) {
			if (this.currentAnimation && this.animations[animName] !== this.currentAnimation) {
				this.currentAnimation.stop();
			}
			let anim = this.animations[animName] as Animation;
			if (!anim) {
				return;
			}
			this.currentAnimation = anim;
			anim.start();
			return this.currentAnimation;
		}

		public stop(animName: string) {
			let anim = this.animations[animName] as Animation;
			if (!anim) {
				return;
			}
			this.currentAnimation = null;
			anim.stop();
		}

		public add(animName: string, frames: Array<number | string>, rate: number, loop = false) {
			let anim = new XEngine.Animation(this.game, this.sprite, frames, rate);
			anim.loop = loop;
			this.animations[animName] = anim;
		}
	}
}
