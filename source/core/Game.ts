interface Array<T> {
	removePending();
	equals(array: Array<T>): boolean;
}

Array.prototype.removePending = function () {
	return this.filter(go => {
		if (go.isPendingDestroy) {
			if (go.body !== undefined) {
				go.body.destroy();
			}
			return false;
		}
		return true;
	});
};

if ( Array.prototype.equals ) {
	console.warn("Overriding existing Array.prototype.equals. \
	Possible causes: New API defines the method, there's a framework conflict or you've got double inclusions in your code.");
}
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

namespace XEngine {
	export var version = "2.0";
	declare var mat4: any;
	export class Game {

		public autoCulling: boolean;
		public ISO_TILE_HEIGHT: number;
		public ISO_TILE_WIDTH: number;
		public isMobile: boolean;
		public updateQueue: Array<GameObject>;
		public renderQueue: Array<GameObject>;
		public lights: Array<Light>;
		public pause: boolean;
		public worldWidth: number;
		public worldHeight: number;
		public height: number;
		public width: number;

		public canvas: HTMLCanvasElement;
		public context: WebGL2RenderingContext;
		public camera: Camera;
		public audioContext: AudioContext;
		public load: Loader;
		public scale: ScaleManager;
		public state: StateManager;
		public time: TimeManager;
		public cache: Cache;
		public tween: TweenManager;
		public renderer: Renderer;
		public physics: any;
		public add: ObjectFactory;
		public input: InputManager;
		public resourceManager: ResourceManager;
		public readonly position: Vector3;

		private timer: number;
		private elapsedTime: number;

		constructor(width: number, height: number, idContainer: string) {
			this.canvas = document.getElementById(idContainer) as HTMLCanvasElement;

			if (!this.canvas) {
				this.canvas = document.body.appendChild(document.createElement("canvas"));
				this.canvas.id = idContainer;
			}

			this.position = new Vector3(0);

			this.width = width;
			this.height = height;

			this.worldWidth = width;
			this.worldHeight = height;

			this.canvas.setAttribute("widht", width.toString());
			this.canvas.setAttribute("height", height.toString());

			this.audioContext = new AudioContext();

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
				if (this.state.currentState == null) { return; }
				if (!this.load.preloading) {
					let tmpLights = this.lights.removePending();
					delete this.lights;
					this.lights = tmpLights;
					let tmpUpdateQueue = this.updateQueue.removePending();
					delete this.updateQueue;
					this.updateQueue = tmpUpdateQueue;
					this.tween.update(this.time.deltaTimeMillis);
					let queueLength = this.updateQueue.length - 1;
					this.state.currentState.update(this.time.deltaTime);
					this.camera.update();
					for (let i = queueLength; i >= 0; i--) {
						let gameObject = this.updateQueue[i];
						if (gameObject.alive) {
							gameObject.update(this.time.deltaTime);
						}
					}

					// if (this.physics.systemEnabled) {
						// 	this.physics.update(this.deltaTime);
						// 	this.state.currentState.physicsUpdate();
						// }
				}
				let tmpRenderQueue = this.renderQueue.removePending();
				delete this.renderQueue;
				this.renderQueue = tmpRenderQueue;
				this.state.currentState.render(this.renderer);
				this.camera.dirty = false;
			}
		}

		public destroy() {
			for (let i = this.updateQueue.length - 1; i >= 0; i--) {
				let gameObject = this.updateQueue[i];
				if (!gameObject.persist) {
					gameObject.destroy();
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
					this.renderQueue.splice(i, 1);
				}
			}

			for (let i = this.lights.length - 1; i >= 0; i--) {
				let gameObject = this.lights[i];
				if (!gameObject.persist) {
					gameObject.destroy();
					this.lights.splice(i, 1);
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
			this.updateQueue = new Array();
			this.renderQueue = new Array();
			this.lights = new Array();
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
			this.time = new TimeManager();
			this.time.init();
			this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
			this.input = new InputManager(this);
			console.log("Game engine " + XEngine.version + " arrancado con webgl!!!");
			this.update();
		}
	}
}
