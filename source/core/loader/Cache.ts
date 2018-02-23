namespace XEngine {

	export class Cache {

		public images: Array<Texture2D>;
		public audios: Array<any>;
		public json: Array<any>;
		public bitmapData: Array<BitmapData>;
		public geometries: IDict<Geometry>;
		private game: Game;

		constructor (game: Game) {
			this.game = game;
			this.images = new Array();
			this.audios = new Array();
			this.json = new Array();
			this.geometries = new IDict<Geometry>();
			this.bitmapData = new Array();
		}

		public image(imageName: string): Texture2D {
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

		public getGeometry(geoName: string) {
			if (this.geometries[geoName] === undefined) {
				console.error("No hay geometria para el nombre: " + geoName);
			} else {
				return this.geometries[geoName];
			}
		}

		/**
		 * Borra toda la cache
		 * @method XEngine.Cache#clearChache
		 */
		public clearCache() {
			delete this.images;
			delete this.audios;
			delete this.json;
			delete this.bitmapData;
			delete this.geometries;
			this.images = new Array();
			this.audios = new Array();
			this.json = new Array();
			this.bitmapData = new Array();
			this.geometries = new IDict<Geometry>();
		}
	}
}
