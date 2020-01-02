import {BasicLoader, Loader} from "./_module/Loader" 
import {TGAParser} from "../Loader/Utils/TGAParser"
import {Texture2D, WRAP_MODE} from "../core/Render/Resources/Texture/Texture2D"

export class ImageLoader implements BasicLoader {

	public imageName: string;
	public imageUrl: string;
	public completed: boolean;
	public frameWidth: number;
	public frameHeight: number;
	public isLoading: boolean;
	public isNormal: boolean;

	private loader: Loader;

	constructor (imageName: string, imageUrl: string, loader: Loader, frameWidth = 0, frameHeight = 0, isNormal = false) {
		this.isLoading = false;
		this.imageName = imageName;
		this.imageUrl = imageUrl;
		this.completed = false;
		this.loader = loader;
		this.frameWidth = frameWidth;
		this.frameHeight = frameHeight;
		this.isNormal = isNormal;
	}

	public load() {
		this.isLoading = true;
		let _this = this;
		if (_this.loader.game.cache.images[_this.imageName] !== undefined) {
			_this.completed = true;
			_this.loader._notifyCompleted();
			return;
		}
		let isTga = false;
		if (_this.imageUrl.split(".").indexOf("tga") !== -1) {
			isTga = true;
		}
		if (!isTga) {
			_this.loadCommon();
		} else {
			_this.loadTGA();
		}
	}

	private loadCommon() {
		let _this = this;
		let img1 = new Image();
		let handler = function () {
			_this.loader.game.cache.images[_this.imageName] = Texture2D.createTexture(_this.imageName, this.width, this.height, this, WRAP_MODE.REPEAT, !_this.isNormal, _this.loader.game.renderer.gl, _this.isNormal);
			_this.completed = true;
			_this.loader._notifyCompleted();
		};
		img1.onload = handler;
		img1.onerror = handler;
		img1.src = _this.imageUrl;
	}

	private loadTGA() {
		let _this = this;
		let xhr = new XMLHttpRequest();

		xhr.open("GET", _this.imageUrl, true);
		xhr.responseType = "arraybuffer";
		xhr.onload = function() {
			if (this.status === 200) {
				let imageData = TGAParser.parse(this.response);
				_this.loader.game.cache.images[_this.imageName] = Texture2D.createTexture(_this.imageName, imageData.width, imageData.height, imageData.data, WRAP_MODE.REPEAT, !_this.isNormal, _this.loader.game.renderer.gl, _this.isNormal);
				_this.completed = true;
				_this.loader._notifyCompleted();
			}
		};
		xhr.send(null);
	}
}
