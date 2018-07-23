namespace XEngine {

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
			let newImage = new Texture2D(_this.imageName, _this.frameWidth, _this.frameHeight, 1, this.isNormal);
			let isTga = false;
			if (_this.imageUrl.split(".").indexOf("tga") !== -1) {
				isTga = true;
			}
			if (!isTga) {
				_this.loadCommon(newImage);
			} else {
				_this.loadTGA(newImage);
			}
			_this.loader.game.cache.images[newImage.imageName] = newImage;
		}

		private loadCommon(newImage: Texture2D) {
			let _this = this;
			let img1 = new Image();
			let handler = function () {
				let imageRef = _this.loader.game.cache.images[_this.imageName];
				imageRef.image = this;
				_this.completed = true;

				if (_this.frameWidth === 0) {
					imageRef.frameWidth = this.width;
					newImage.wrapMode = WRAP_MODE.REPEAT;
				} else {
					imageRef.frameWidth = _this.frameWidth;
				}

				if (_this.frameHeight === 0) {
					imageRef.frameHeight = this.height;
					newImage.wrapMode = WRAP_MODE.REPEAT;
				} else {
					imageRef.frameHeight = _this.frameHeight;
				}

				imageRef.createTexture(_this.loader.game.context);
				_this.loader._notifyCompleted();
			};
			img1.onload = handler;
			img1.onerror = handler;
			img1.src = _this.imageUrl;
		}

		private loadTGA(newImage: Texture2D) {
			let _this = this;
			let xhr = new XMLHttpRequest();

			xhr.open("GET", _this.imageUrl, true);
			xhr.responseType = "arraybuffer";
			xhr.onload = function() {
				if (this.status === 200) {
					let imageData = TGAParser.parse(this.response);
					let imageRef = _this.loader.game.cache.images[_this.imageName];
					imageRef.image = imageData.data;

					if (_this.frameWidth === 0) {
						imageRef.frameWidth = imageData.width;
						newImage.wrapMode = WRAP_MODE.REPEAT;
					} else {
						imageRef.frameWidth = _this.frameWidth;
					}

					if (_this.frameHeight === 0) {
						imageRef.frameHeight = imageData.height;
						newImage.wrapMode = WRAP_MODE.REPEAT;
					} else {
						imageRef.frameHeight = _this.frameHeight;
					}
					imageRef.createTexture(_this.loader.game.context);
					_this.completed = true;
					_this.loader._notifyCompleted();
				}
			};
			xhr.send(null);
		}
	}
}
