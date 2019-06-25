namespace XEngine2 {

	export class Cache {

		public images: Array<Texture2D>;
		public audios: Array<any>;
		public json: Array<any>;
		public geometries: IDict<StaticMesh>;
		public materials: IDict<Material>;
		private game: Game;

		constructor (game: Game) {
			this.game = game;
			this.images = new Array();
			this.audios = new Array();
			this.json = new Array();
			this.geometries = new IDict<StaticMesh>();
			this.materials = new IDict<Material>();
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
			delete this.geometries;
			delete this.materials;
			this.images = new Array();
			this.audios = new Array();
			this.json = new Array();
			this.geometries = new IDict<StaticMesh>();
			this.materials = new IDict<Material>();
		}
	}
}
