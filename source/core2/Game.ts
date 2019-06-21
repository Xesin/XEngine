/// <reference path="Scale/ScaleManager.ts" />
/// <reference path="Time/TimeManager.ts" />
/// <reference path="Render/Renderer.ts" />

// attach the .equals method to Array's prototype to call it on any array
Array.prototype.equals = function (array): boolean {
	// if the other array is a falsy value, return
	if (!array) {
		return false;
	}

	// compare lengths - can save a lot of time
	if (this.length !== array.length) {
		return false;
	}

	for (let i = 0, l = this.length; i < l; i++) {
	// Check if we have nested arrays
		if (this[i] instanceof Array && array[i] instanceof Array) {
			// recurse into the nested arrays
			if (!this[i].equals(array[i])) {
				return false;
			}
		} else if (this[i] !== array[i]) {
			// Warning - two different object instances will never be equal: {x:20} != {x:20}
			return false;
		}
	}
	return true;
};

// Hide method from for-in loops
Object.defineProperty(Array.prototype, "equals", {enumerable: false});

namespace XEngine2 {

	export var version = "3.0";
	export class Game {

		public autoCulling: boolean;
		public ISO_TILE_HEIGHT: number;
		public ISO_TILE_WIDTH: number;
		public isMobile: boolean;
		public pause: boolean;
		public worldWidth: number;
		public worldHeight: number;
		public height: number;
		public width: number;

		public canvas: HTMLCanvasElement;
		public audioContext: AudioContext;
		public time: TimeManager;
		public scale: ScaleManager;
		public sceneManager: SceneManager;

		private renderer: Renderer;

		private timer: number;

		private static game: Game;

		public static GetInstance()
		{
			return Game.game;
		}

		private init() {
			this.pause = false;
			this.time.init();
			this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
			console.log("Game engine " + XEngine2.version + " arrancado con webgl!!!");
			Game.game = this;
			this.update();
		}

		constructor(width: number, height: number, idContainer: string, scaleType = ScaleType.NO_SCALE) {
			this.canvas = document.getElementById(idContainer) as HTMLCanvasElement;

			if (!this.canvas) {
				this.canvas = document.body.appendChild(document.createElement("canvas"));
				this.canvas.id = idContainer;
			}

			this.width = width;
			this.height = height;

			this.worldWidth = width;
			this.worldHeight = height;

			this.canvas.setAttribute("width", width.toString());
			this.canvas.setAttribute("height", height.toString());

			this.audioContext = new AudioContext();

			this.time = new TimeManager();
			this.scale = new ScaleManager(this, scaleType);
			this.renderer = new Renderer(this, this.canvas);
			this.sceneManager = new SceneManager(this);

			this.pause = false;
			this.isMobile = false;
			this.ISO_TILE_WIDTH = 32;
			this.ISO_TILE_HEIGHT = 32;

			this.init();
		}

		public setBackgroundColor(r: number, g: number, b: number, a: number) {
			this.renderer.setClearColor(r / 255, g / 255, b / 255, a / 255);
		}

		public update() {
			if (window.requestAnimationFrame) {
				window.requestAnimationFrame(() => { this.update(); });
			} else {
				clearTimeout(this.timer);
				this.timer = setTimeout(() => { this.update(); }, this.time.frameLimit / 1);
			}
			if (this.time.update()) {
				if (this.pause) { return; }
				this.sceneManager.update(this.time.deltaTime);
				this.sceneManager.render(this.renderer);
			}
		}

		public destroy() {
			
		}
	}
}
