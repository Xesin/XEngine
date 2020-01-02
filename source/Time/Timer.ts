import { Signal } from "../Signals/Signal"

export class Timer {

	public duration: number;
	public elapsed: number;
	public remaining: number;
	public loop: boolean;
	public onCompleted: Signal;
	public pendingRestart: boolean;
	public isPendingDestroy: boolean;
	public paused: boolean;
	public destroyOnStop: boolean;

	constructor(duration: number, loop: boolean, autoDestroy: boolean) {
		this.duration = duration;
		this.elapsed = 0;
		this.remaining = duration;
		this.loop = loop;
		this.onCompleted = new Signal();
		this.paused = true;
		this.pendingRestart = false;
		this.isPendingDestroy = false;
		this.destroyOnStop = autoDestroy;
	}

	public update(deltaTimeMillis: number) {
		if (this.paused) { return; }
		if (this.pendingRestart) {
			this.elapsed = 0;
			this.remaining = this.duration;
			this.pendingRestart = false;
		}
		this.elapsed += deltaTimeMillis;
		this.elapsed = Math.min(this.elapsed, this.duration);
		this.remaining = this.duration - this.elapsed;
		if (this.remaining === 0) {
			if (this.loop) {
				this.pendingRestart = true;
			} else {
				this.stop();
			}
			this.onCompleted.dispatch();
		}
	}

	public addTime(extraTime: number) {
		this.elapsed -= extraTime;
		if (this.elapsed -= 0) {
			this.duration += (this.elapsed * (-1));
			this.elapsed = 0;
		}
		this.remaining = this.duration - this.elapsed;
	}

	public start() {
		this.paused = false;
	}

	public pause() {
		this.paused = true;
	}

	public resume() {
		this.paused = false;
	}

	public stop() {
		this.paused = true;
		this.pendingRestart = true;
		if ( this.destroyOnStop ) {
			this.destroy();
		}
	}

	public destroy () {
		this.isPendingDestroy = true;
	}
}

