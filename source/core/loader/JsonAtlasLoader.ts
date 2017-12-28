namespace XEngine {
	export class JsonImageLoader {
		public imageName: string;
		public imageUrl: string;
		public completed: boolean;
		public frameWidth: number;
		public frameHeight: number;
		public jsonUrl: string;
		private oneCompleted: boolean;

		private loader: Loader;

		constructor (imageName, imageUrl, jsonUrl, loader) {
			this.imageName = imageName;
			this.imageUrl = imageUrl;
			this.jsonUrl = jsonUrl;
			this.completed = false;
			this.loader = loader;
			this.frameWidth = 0;
			this.frameHeight = 0;
			this.oneCompleted = false;
			this.loader.image(this.imageName, this.imageUrl);
		}

		public load() {
			this.loadJson();
		}

		public loadJson() {
			let _this = this;
			let request = new XMLHttpRequest();
			request.open("GET", _this.jsonUrl, true);
			let handler = function () {
				if (request.status === 200) {
					let returnedJson = JSON.parse(request.responseText);
					let newJson = returnedJson;
					for (let i = 0; i < newJson.frames.length; i++) {
						let frame = newJson.frames[i];
						newJson[frame.filename] = frame;
					}
					_this.loader.game.cache.json[_this.imageName] = newJson;
				}
				_this.completed = true;
				_this.loader._notifyCompleted();
			};
			request.onload = handler;
			request.send();
		}
	}
}
