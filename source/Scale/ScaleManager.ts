import {Vector3} from "../Math/Mathf";
import {ScaleType} from "./EScaleType";
import {Signal} from "../Signals/Signal";
import {Game} from "../core/Game"


export class ScaleManager {
	
	public scaleType: ScaleType;
	public orientation: string;
	public sourceAspectRatio: number;
	public onResized: Signal;
	public scale: Vector3;
	private game: Game;
	public currentWidth : number;
	public currentHeight : number;

	constructor(game, scaleType = ScaleType.NO_SCALE) {
		this.game = game;
		this.scaleType = scaleType;
		this.orientation = "landScape";
		this.sourceAspectRatio = 0;
		this.onResized = new Signal();
		this.scale = new Vector3(1,1,1);
		this.init();
	}

	private init() {
		let _this = this;
		this.currentHeight = this.game.height;
		this.currentWidth = this.game.width;
		let onWindowsResize = function (event) {
			_this.onWindowsResize();
		};
		window.addEventListener("resize", onWindowsResize, true);
		this.updateScale();
	}

	public updateScale() {
		let newWidth =  parseInt(this.game.canvas.getAttribute("width")) || 1280;
		let newHeight = parseInt(this.game.canvas.getAttribute("height")) || 720;
		switch(this.scaleType)
		{
			case ScaleType.FIT:
				newWidth = window.innerWidth;
				newHeight = window.innerHeight;
				break;
			case ScaleType.PRESERVE_ASPECT:
				this.sourceAspectRatio = this.game.width / this.game.height;
				newHeight = window.innerHeight;
				newWidth = newHeight * this.sourceAspectRatio;
				if (newWidth > window.innerWidth) {
					newWidth = window.innerWidth;
					newHeight = newWidth / this.sourceAspectRatio;
				}
				break;
			default:
				break;
		}
		if (this.scaleType !== ScaleType.NO_SCALE) {
			newWidth = Math.round(newWidth);
			newHeight = Math.round(newHeight);
			this.currentHeight = newHeight;
			this.currentWidth = newWidth;
			this.resizeCanvas(newWidth, newHeight);
			this.onResized.dispatch(newWidth, newHeight);
		}
	}

	private resizeCanvas(newWidth, newHeight) {
		this.game.canvas.setAttribute("width", newWidth);
		this.game.canvas.setAttribute("height", newHeight);
	}

	private onWindowsResize() {
		this.updateScale();
	}
}
