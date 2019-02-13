/// <reference path="GameObject.ts"/>
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
			light._onInitialize();
			if (light.start !== undefined) {
				light.start();
			}
			return light;
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
