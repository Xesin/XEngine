interface Array<T> {
	removePending();
}

Array.prototype.removePending = function () {
	let i = this.length;
	while (i--) {
		if (this[i].isPendingDestroy) {
			if (this[i].body !== undefined) {
				this[i].body.destroy();
			}
			delete this[i];
			this.splice(i, 1);
		}
	}
};

namespace XEngine {
	export let version = "2.0";
	declare var mat4: any;
	export class Game {

		public autoCulling: boolean;
		public ISO_TILE_HEIGHT: number;
		public ISO_TILE_WIDTH: number;
		public isMobile: boolean;
		public updateQueue: Array<GameObject>;
		public renderQueue: Array<GameObject>;
		public pause: boolean;
		public deltaMillis: number;
		public deltaTime: number;
		public previousFrameTime: number;
		public frameTime: number;
		public _elapsedTime: number;
		public _startTime: number;
		public frameLimit: number;
		public worldWidth: number;
		public worldHeight: number;
		public height: number;
		public width: number;

		public game: Game;
		public canvas: HTMLCanvasElement;
		public context: WebGLRenderingContext;
		public camera: Camera;
		public audioContext: AudioContext;
		public load: Loader;
		public scale: ScaleManager;
		public state: StateManager;
		public cache: Cache;
		public tween: TweenManager;
		public renderer: Renderer;
		public physics: any;
		public add: ObjectFactory;
		public input: InputManager;
		public resourceManager: ResourceManager;
		public readonly position: Vector;

		private timer: number;
		private elapsedTime: number;

		constructor(width: number, height: number, idContainer: string) {
			this.canvas = document.getElementById(idContainer) as HTMLCanvasElement;

			if (!this.canvas) {
				this.canvas = document.body.appendChild(document.createElement("canvas"));
				this.canvas.id = idContainer;
			}

			this.position = new Vector(0);

			this.width = width;
			this.height = height;

			this.worldWidth = width;
			this.worldHeight = height;

			this.canvas.setAttribute("widht", width.toString());
			this.canvas.setAttribute("height", height.toString());

			this.audioContext = new AudioContext();

			this.frameLimit = 30;
			this._startTime = 0;
			this._elapsedTime = 0;
			this.frameTime = 0;
			this.previousFrameTime = 0;
			this.deltaTime = 0;
			this.deltaMillis = 0;
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
				this.timer = setTimeout(() => { this.update(); }, this.frameLimit / 1);
			}
			this.elapsedTime = Date.now() - this._startTime;
			this.frameTime = this.elapsedTime;
			this.deltaMillis = Math.min(400, (this.frameTime - this.previousFrameTime));
			this.deltaTime = this.deltaMillis / 1000;
			if (1 / this.frameLimit > this.deltaTime) { return; }
			this.previousFrameTime = this.frameTime;
			if (this.pause) { return; }
			if (this.state.currentState == null) { return; }
			if (!this.load.preloading) {
				this.updateQueue.removePending();
				this.tween.update(this.deltaMillis);
				for (let i = this.updateQueue.length - 1; i >= 0; i--) {
					let gameObject = this.updateQueue[i];
					if (gameObject.alive) {
						gameObject.update(this.deltaTime);
						if (XEngine.Sprite.prototype.isPrototypeOf(gameObject)) {
							(gameObject as Sprite)._updateAnims(this.deltaMillis);
						}
					}
				}
				this.state.currentState.update(this.deltaTime);
				this.camera.update();

				// if (this.physics.systemEnabled) {
				// 	this.physics.update(this.deltaTime);
				// 	this.state.currentState.physicsUpdate();
				// }
				this.renderQueue.removePending();
				this.renderer.render();
			}
		}

		public destroy() {
			for (let i = this.updateQueue.length - 1; i >= 0; i--) {
				let gameObject = this.updateQueue[i];
				if (!gameObject.persist) {
					gameObject.destroy();
					if (gameObject.body !== undefined) {
						gameObject.body.destroy();
					}
					this.updateQueue.splice(i, 1);
				}
				let renderIndex = this.renderQueue.indexOf(gameObject);
				if (renderIndex !== -1) {
					this.renderQueue.splice(renderIndex, 1);
				}
			}
			for (let i = this.renderQueue.length - 1; i >= 0; i--) {
				let gameObject = this.renderQueue[i];
				if (!gameObject.persist) {
					gameObject.destroy();
					if (gameObject.body !== undefined) {
						gameObject.body.destroy();
					}
					this.renderQueue.splice(i, 1);
				}
			}
			// this.physics._destroy();
			// this.tween._destroy();
			delete this.camera;
			this.camera = new XEngine.Camera(this);
		}

		public getWorldPos () {
			return this.position;
		}

		public getWorldMatrix(childMatrix: Array<number>) {
			mat4.identity(childMatrix);
		}

		public getTotalRotation() {
			return 0;
		}

		private init() {
			this._startTime = Date.now();
			this._elapsedTime = 0;
			this.frameTime = 0;
			this.previousFrameTime = 0;
			this.deltaTime = 0;
			this.deltaMillis = 0;
			this.updateQueue = new Array();
			this.renderQueue = new Array();
			this.pause = false;
			this.state = new StateManager(this);
			this.add = new ObjectFactory(this);
			// this.physics = new XEngine.Physics(this);
			this.tween = new TweenManager(this);
			this.cache = new XEngine.Cache(this);
			this.load = new XEngine.Loader(this);
			this.camera = new Camera(this);
			this.renderer = new Renderer(this, this.canvas);
			this.context = this.renderer.context;
			this.resourceManager = new ResourceManager(this.context);
			this.renderer.init();
			this.scale = new ScaleManager(this);
			this.scale.init();
			this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
			this.input = new InputManager(this);
			console.log("Game engine " + XEngine.version + " arrancado con webgl!!!");
			this.update();
		}
	}
}
