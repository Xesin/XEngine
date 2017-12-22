namespace XEngine {

	export class ImageLoader {

		public imageName: string;
		public imageUrl: string;
		public completed: boolean;
		public frameWidth: number;
		public frameHeight: number;

		private loader: Loader;

		constructor (imageName: string, imageUrl: string, loader: Loader, frameWidth = 0, frameHeight = 0) {
			this.imageName = imageName;
			this.imageUrl = imageUrl;
			this.completed = false;
			this.loader = loader;
			this.frameWidth = frameWidth;
			this.frameHeight = frameHeight;
		}

		public load() {
			let _this = this;
			let newImage = new Texture2D(_this.imageName, _this.frameWidth, _this.frameHeight, 1);

			let img1 = new Image();
			let handler = function () {
				let imageRef = _this.loader.game.cache.images[_this.imageName];
				imageRef.image = this;
				_this.completed = true;

				if (_this.frameWidth === 0) {
					imageRef.frameWidth = this.width;
					newImage.wrapMode = WRAP_MODE.CLAMP;
				} else {
					imageRef.frameWidth = _this.frameWidth;
				}

				if (_this.frameHeight === 0) {
					imageRef.frameHeight = this.height;
					newImage.wrapMode = WRAP_MODE.CLAMP;
				} else {
					imageRef.frameHeight = _this.frameHeight;
				}

				imageRef.createTexture(_this.loader.game.context);
				_this.loader._notifyCompleted();
			};
			img1.onload = handler;
			img1.onerror = handler;
			img1.src = _this.imageUrl;
			_this.loader.game.cache.images[newImage.imageName] = newImage;
		}
	}
}
