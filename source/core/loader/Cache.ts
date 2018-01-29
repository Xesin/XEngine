namespace XEngine {

	export class Cache {

		public images: Array<Texture2D>;
		public audios: Array<any>;
		public json: Array<any>;
		public bitmapXML: Array<any>;
		private game: Game;

		constructor (game: Game) {
			this.game = game;
			this.images = new Array();
			this.audios = new Array();
			this.json = new Array();
		}

		public image(imageName: string) {
			if (this.images[imageName] === undefined) {
				console.error("No hay imagen para el nombre: " + imageName);
			} else {
				return this.images[imageName];
			}
		}

		public audio(audioName: string) {
			if (this.audios[audioName] === undefined) {
				console.error("No hay audio para el nombre: " + audioName);
			} else {
				return this.audios[audioName];
			}
		}

		public getJson(jsonName: string) {
			return this.json[jsonName];
		}

		/**
		 * Borra toda la cache
		 * @method XEngine.Cache#clearChache
		 */
		public clearCache() {
			delete this.images;
			delete this.audios;
			delete this.json;
			this.images = new Array();
			this.audios = new Array();
			this.json = new Array();
		}
	}
}
