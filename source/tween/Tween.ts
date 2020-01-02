import {Signal} from "../Signals/Signal";
import {Mathf} from "../Math/Mathf";

export class Tween {
	public onComplete: Signal;
	public onCompleteLoop: Signal;
	public yoyo: boolean;
	public progress: number;
	public duration: number;
	public started = false;
	public isRunning: boolean;
	public autoStart: boolean;
	public isPendingDestroy: boolean;
	public runCount: number;
	public repeat: number;
	public delay: number;
	public easing: Function;
	private time: number;

	private properties: Array<any>;
	private fromProperties: Array<any>;
	private target: any;

	constructor(target) {
		this.isPendingDestroy = false;
		this.started = false;
		this.target = target;
		this.fromProperties = new Array();
		this.properties = new Array();
		this.duration = 0;
		this.autoStart = true;
		this.easing = undefined;
		this.delay = 0;
		this.repeat = 0;
		this.runCount = 0;
		this.isRunning = false;
		this.progress = 0;
		this.time = 0;
		this.yoyo = false;
		this.onComplete = new Signal();
		this.onCompleteLoop = new Signal();
	}

	public play() {
		this.started = true;
		let _this = this;
		let timer = setTimeout(function () {
			clearTimeout(timer);
			_this.startTween();
		}, this.delay);
	}

	public to(properties: any, duration: number, ease: Function, autoStart: boolean, delay: number, repeat: number, yoyo: boolean) {
		// tslint:disable-next-line:forin
		for (let property in properties) {
			if ( typeof properties[property] === "string" ) {
				properties[property] = this.target[property] + Number(properties[property]);
			}
			this.fromProperties[property] = this.target[property];
		}
		this.properties = properties;
		this.duration = duration;
		this.easing = ease;
		this.autoStart = autoStart || true;
		this.delay = delay || 0;
		this.repeat = repeat || 0;
		this.yoyo = yoyo || false;
		return this;
	}

	public from(properties) {
		// tslint:disable-next-line:forin
		for (let property in properties) {
			this.fromProperties[property] = properties[property];
		}
		return this;
	}

	public complete() {
		this.time = this.duration;
		// tslint:disable-next-line:forin
		for (let property in this.properties) {
			this.target[property] = this.fromProperties[property];
		}
	}

	public update(deltaTime: number) {
		this.time += deltaTime;
		this.progress = Mathf.clamp(this.time / this.duration, 0, 1);
		if (this.target === undefined || this.target == null) {
			this.destroy();
			return;
		}
		if ((this.progress === 1)) {
			if (this.repeat === -1 || this.runCount <= this.repeat) {
				this.onCompleteLoop.dispatch();
				this.time = 0;
				this.progress = 0;
				this.play();
			} else {
				this.onComplete.dispatch();
				this.destroy();
			}
			return;
		}
		// tslint:disable-next-line:forin
		for (let property in this.properties) {
			let t = this.progress;
			if (this.yoyo) {
				if (t <= 0.5) {
					t *= 2;
				} else {
					let t2 = (t - 0.5) * 2;
					t = Mathf.lerp(1, 0, t2);
				}
			}
			this.target[property] = Mathf.lerp(this.fromProperties[property], this.properties[property], this.easing(t));
		}
	}

	public destroy() {
		this.isRunning = false;
		this.isPendingDestroy = true;
		if (this.onComplete !== undefined) {
			this.onComplete._destroy();
		}
		if (this.onCompleteLoop !== undefined) {
			this.onCompleteLoop._destroy();
		}
		delete this.onComplete;
		delete this.onCompleteLoop;
		delete this.fromProperties;
		delete this.properties;
	}

	private startTween() {
		this.runCount++;
		// tslint:disable-next-line:forin
		for (let property in this.properties) {
			this.target[property] = this.fromProperties[property];
		}
		this.isRunning = true;
	}

}