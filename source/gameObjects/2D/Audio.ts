/// <reference path="../GameObject.ts"/>
namespace XEngine {
	export class Audio extends GameObject {

		public isLoop: boolean;
		public audio: any;
		public persist: boolean;
		public volume: number;
		public onComplete: Signal;
		public completed: boolean;

		private gainNode: GainNode;
		private source: AudioBufferSourceNode;

		constructor(game: Game, audioName: string, autoStart: boolean, volume: number) {
			super(game, 0, 0);
			this.isLoop = false;
			this.audio = this.game.cache.audio(audioName).audio;
			this.persist = false;
			this.volume = volume || 1;
			this.onComplete = new XEngine.Signal();

			this.completed = false;

			if (autoStart) {
				this.play(0);
			}
		}

		public update() {
			if (this.gainNode != null) {
				this.gainNode.gain.value = this.volume;
			}
		}

		public play(time) {
			this.source = this.game.audioContext.createBufferSource();
			this.source.buffer = this.audio;
			this.source.connect(this.game.audioContext.destination);
			this.source.onended = () => {
				this._complete();
			};
			this.gainNode = this.game.audioContext.createGain();
			this.source.connect(this.gainNode);
			this.gainNode.connect(this.game.audioContext.destination);
			this.gainNode.gain.value = this.volume;
			this.source.loop = this.isLoop;
			this.source.start(time || 0);
		}

		public stop(time = 0) {
			if (this.source) {
				this.source.stop(time || 0);
			}
		}

		public loop(value) {
			this.isLoop = value;
		}

		public destroy() {
			super.destroy();
			if (this.onComplete) {
				this.onComplete._destroy();
				delete this.onComplete;
			}
		}

		public kill() {
			this.alive = false;
			this.stop();
		}

		public _complete() {
			this.stop();
			if (this.onComplete) {
				this.onComplete.dispatch();
			}
		}
	}
}
