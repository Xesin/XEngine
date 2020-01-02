import {Tween} from "./Tween";
 
export {Tween} from "./Tween"
export {Easing} from "./Easing"

export class TweenManager {

	private tweens: Array<Tween>;

	constructor() {
		this.tweens = new Array();
	}

	public add(target: any): Tween {
		let tween = new Tween(target);
		this.tweens.push(tween);
		return tween;
	}

	public update(deltaMillis: number) {

		for (let i = 0; i < this.tweens.length; i++) {
			let tween = this.tweens[i];
			if (tween.isPendingDestroy) {
				delete this.tweens[i];
				this.tweens.splice(i, 1);
				i--;
			} else if (tween.isRunning) {
				tween.update(deltaMillis);
			} else if (tween.autoStart && !tween.started) {
				tween.play();
			}
		}
	}

	public destroy() {
		for (let i = this.tweens.length - 1; i >= 0; i--) {
			this.tweens[i].destroy();
			delete this.tweens[i];
		}
		delete this.tweens;
		this.tweens = new Array();
	}
}

