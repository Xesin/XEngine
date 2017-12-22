/// <reference path="GameObject.ts"/>
/// <reference path="Audio.ts"/>
namespace XEngine {
	export class ObjectFactory {
		private game: Game;

		constructor(game: Game) {
			this.game = game;
		}

		public existing (gameObject: GameObject, update = true, render = false) {
			if (update) {
				this.game.updateQueue.push(gameObject);
			}
			if (render) {
				this.game.renderQueue.push(gameObject);
			}
			gameObject.parent = this.game;
			gameObject._onInitialize();
			if (gameObject.start !== undefined) {
				gameObject.start();
			}
			return gameObject;
		}

		public sprite(posX: number, posY: number, sprite: string, frame: number | string) {
			let gameObject = new XEngine.Sprite(this.game, posX, posY, sprite, frame);
			return this.existing(gameObject, true, true);
		}

		public image(posX: number, posY: number, sprite: string, frame: number | string) {
			let gameObject = new XEngine.Sprite(this.game, posX, posY, sprite, frame);
			return this.existing(gameObject, false, true);
		}

		public audio(audio: string, autoStart: boolean, volume: number) {
			let audioObject = new XEngine.Audio(this.game, audio, autoStart, volume);
			return this.existing(audioObject, true, false);
		}

		public group(posX: number, posY: number) {
			let x = posX || 0;
			let y = posY || 0;
			let gameObject = new XEngine.Group(this.game, x, y);
			return this.existing(gameObject, true, true);
		}
	}
}
