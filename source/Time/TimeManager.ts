import { Timer } from "./Timer"

export class TimeManager {

	public startTime: number;
	public deltaTime: number;
	public deltaTimeMillis: number;
	public frameTime: number;
	public elapsedTime: number;
	public frameLimit: number;
	private previousFrameTime: number;
	private timers: Array<Timer>;

	public init() {
		this.startTime = Date.now();
		this.previousFrameTime = 0;
		this.deltaTime = 0;
		this.deltaTimeMillis = 0;
		this.frameTime = 0;
		this.elapsedTime = 0;
		this.frameLimit = 144;
		this.timers = new Array<Timer>();
	}

	public update(): boolean {
		this.elapsedTime = Date.now() - this.startTime;
		this.frameTime = this.elapsedTime;
		this.deltaTimeMillis = Math.min(400, (this.frameTime - this.previousFrameTime));
		this.deltaTime = this.deltaTimeMillis / 1000;
		if (1 / this.frameLimit > this.deltaTime) {
			return false;
		}
		this.previousFrameTime = this.frameTime;
		this.updateTimers();
		return true;
	}

	public addTimer(duration: number, loop: boolean, autoStart = false, autoDestroy = false) {
		let timer = new Timer(duration, loop, autoDestroy);
		if (autoStart) {
			timer.start();
		}
		this.timers.push(timer);
		return timer;
	}

	private updateTimers() {
		// this.timers = this.timers.removePending();
		let queueLength = this.timers.length - 1;
		for (let i = queueLength; i >= 0; i--) {
			let timer = this.timers[i];
			timer.update(this.deltaTimeMillis);
		}
	}
}
