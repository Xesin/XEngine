/// <reference path="GameObject.ts"/>
/// <reference path="2D/Audio.ts"/>
namespace XEngine {
	export class ObjectFactory {
		private game: Game;

		constructor(game: Game) {
			this.game = game;
		}

		public existing (gameObject: any, update = true, render = false) {
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

		public light(light: Light) {
			this.game.lights.push(light);
			light.parent = this.game;
			light._onInitialize();
			if (light.start !== undefined) {
				light.start();
			}
			return light;
		}

		public circle(posX: number, posY: number, width: number, height: number): Circle {
			let gameObject = new XEngine.Circle(this.game, posX, posY, width, height);
			return this.existing(gameObject, false, true);
		}

		public rect(posX: number, posY: number, width: number, height: number, color: number): Rect {
			let gameObject = new XEngine.Rect(this.game, posX, posY, width, height, color);
			return this.existing(gameObject, false, true);
		}

		public sprite(posX: number, posY: number, sprite: string, frame?: number | string): Sprite {
			let gameObject = new XEngine.Sprite(this.game, posX, posY, sprite, frame);
			return this.existing(gameObject, true, true);
		}

		public image(posX: number, posY: number, sprite: string, frame?: number | string): Sprite {
			let gameObject = new XEngine.Sprite(this.game, posX, posY, sprite, frame);
			return this.existing(gameObject, false, true);
		}

		public bitmapText(posX: number, posY: number, fontName: string, text: string): Sprite {
			let gameObject = new XEngine.BitmapText(this.game, posX, posY, fontName, text);
			return this.existing(gameObject, false, true);
		}

		public button(posX: number, posY: number, sprite: string,
			frameIdle?: string, spriteDown?: string, spriteOver?: string, spriteUp?: string): Button {
			let gameObject = new Button(this.game, posX, posY, sprite, frameIdle, spriteDown, spriteOver, spriteUp);
			return this.existing(gameObject, false, true);
		}

		public text(posX: number, posY: number, text: string, textStyle: any): Text {
			let gameObject = new XEngine.Text(this.game, posX, posY, text, textStyle);
			return this.existing(gameObject, true, true);
		}

		public audio(audio: string, autoStart: boolean, volume: number): Audio {
			let audioObject = new XEngine.Audio(this.game, audio, autoStart, volume);
			return this.existing(audioObject, true, false);
		}

		public mesh(posX: number, posY: number, posZ: number, geometry: Geometry, material?: Material | Array<Material>): XEngine.Mesh {
			let gameObject = new XEngine.Mesh(this.game, posX, posY, posZ, geometry, material);
			return this.existing(gameObject, true, true);
		}

		public directionalLight(intensity) {
			let go = new XEngine.DirectionalLight(this.game, intensity);
			return this.light(go);
		}

		public pointLight(intensity, range) {
			let go = new XEngine.PointLight(this.game, intensity, range);
			return this.light(go);
		}

		public group(posX: number, posY: number): Group {
			let x = posX || 0;
			let y = posY || 0;
			let gameObject = new XEngine.Group(this.game, x, y);
			return this.existing(gameObject, true, true);
		}
	}
}
