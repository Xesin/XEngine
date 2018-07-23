namespace XEngine {
	export class Animation {
		public rate: number;
		public currentFrame: number;
		public loop: boolean;
		public playing: boolean;
		public onComplete: Signal;
		private game: Game;
		private sprite: Sprite;
		private frames: Array<number | string>;
		private maxFrames: number;
		private frameTime: number;

		constructor(game: Game, sprite: Sprite, frames: Array<number | string>, rate: number) {
			this.rate = rate;
			this.currentFrame = 0;
			this.loop = false;
			this.playing = false;
			this.onComplete = new Signal();

			this.game = game;
			this.sprite = sprite;
			this.frames = frames;
			this.maxFrames = frames.length - 1;
			this.frameTime = 0;
		}

		public update(deltaMillis: number) {
			this.frameTime += deltaMillis;
			if (this.frameTime >= this.rate) {
				this.currentFrame++;
				this.frameTime = 0;
				if (this.currentFrame > this.maxFrames) {
					if (this.loop) {
						this.currentFrame = 0;
					} else {
						this.stop();
						this.onComplete.dispatch();
						return;
					}
				}
			}
			this.sprite.frame = this.frames[this.currentFrame];
		}

		public start() {
			this.playing = true;
		}

		public stop() {
			this.playing = false;
			this.frameTime = 0;
			this.currentFrame = 0;
		}
	}
}
