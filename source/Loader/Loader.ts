import {ImageLoader, AudioLoader, JsonImageLoader, BitmapXMLLoader, ObjMtlLoader} from "./_module/Loader" 
import {Game} from "../core/Game"
import {Signal} from "../Signals/Signal"

export class Loader {

	/**
	 * @type {number}
	 * @memberof Loader
	 */
	public progress: number;
	/**
	 * @type {boolean}
	 * @memberof Loader
	 */
	public preloading: boolean;
	/**
	 * @type {XEngine.Signal}
	 * @memberof Loader
	 */
	public onCompleteFile: Signal;
	/**
	 * @type {Game}
	 * @memberof Loader
	 */
	public game: Game;
	/**
	 * @private
	 * @type {Array<any>}
	 * @memberof Loader
	 */
	private pendingLoads: Array<any>;

	/**
	 * Creates an instance of Loader.
	 * @param {Game} game
	 * @memberof Loader
	 */
	constructor (game: Game) {
		this.game = game;
		this.pendingLoads = new Array();
		this.progress = 0;
		this.preloading = false;
		this.onCompleteFile = new Signal();
	}


	/**
	 * @param {string} imageName
	 * @param {string} imageUrl
	 * @param {boolean} [isNormal=false]
	 * @memberof Loader
	 */
	public image(imageName: string, imageUrl: string, isNormal = false) {
		this.pendingLoads.push(new ImageLoader(imageName, imageUrl, this, 0, 0, isNormal));
	}

	/**
	 * @param  {string} imageName
	 * @param  {string} imageUrl
	 * @param  {number} frameWidth
	 * @param  {number} frameHeight
	 */
	public spriteSheet(imageName: string, imageUrl: string, frameWidth: number, frameHeight: number) {
		this.pendingLoads.push(new ImageLoader(imageName, imageUrl, this, frameWidth, frameHeight));
	}

	/**
	 * @param  {string} imageName
	 * @param  {string} imageUrl
	 * @param  {string} jsonUrl
	 */
	public jsonSpriteSheet(imageName: string, imageUrl: string, jsonUrl: string) {
		this.pendingLoads.push(new JsonImageLoader(imageName, imageUrl, jsonUrl, this));
	}


	public bitmapFont(fontName, imageUrl, xmlUrl) {
		this.pendingLoads.push(new BitmapXMLLoader(fontName, imageUrl, xmlUrl, this));
	}


	public audio(audioName, audioUrl) {
		this.pendingLoads.push(new AudioLoader(audioName, audioUrl, this));
	}

	public obj(objURL, mtlUrl) {
		this.pendingLoads.push(new ObjMtlLoader(objURL, mtlUrl, this));
	}

	public _startPreload() {
		this.preloading = true;
		if (this.pendingLoads.length === 0) {
			this._callStart();
		} else {
			for (let i = 0; i < this.pendingLoads.length; i++) {
				if (!this.pendingLoads[i].isLoading) {
					this.pendingLoads[i].load();
				}
			}
		}
	}

	public _notifyCompleted() {
		let completedTasks = 0;

		for (let i = 0; i < this.pendingLoads.length; i++) {
			if (this.pendingLoads[i].completed) {
				completedTasks++;
			}
		}

		this.progress = completedTasks / this.pendingLoads.length;
		this.onCompleteFile.dispatch(this.progress);

		if (this.progress === 1) {
			delete this.pendingLoads;
			this.onCompleteFile._destroy();
			this.pendingLoads = new Array();
			this._callStart();
		}
	}

	public _callStart() {
		this.preloading = false;
		this.game.sceneManager.currentScene.start();
	}
}