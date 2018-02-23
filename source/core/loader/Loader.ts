namespace XEngine {

	export class Loader {

		public progress: number;
		public preloading: boolean;
		public onCompleteFile: XEngine.Signal;
		public game: Game;
		private pendingLoads: Array<any>;

		constructor (game: Game) {
			this.game = game;
			this.pendingLoads = new Array();
			this.progress = 0;
			this.preloading = false;
			this.onCompleteFile = new XEngine.Signal();
		}

		public image(imageName, imageUrl) {
			this.pendingLoads.push(new XEngine.ImageLoader(imageName, imageUrl, this));
		}

		/**
		 * Añade hoja de sprites a la cola de carga
		 * @method XEngine.Loader#spriteSheet
		 * @param {String} imageName - KeyName de la imagen
		 * @param {String} imageUrl - fuente de la imagen
		 * @param {Number} frameWidth - ancho de cada frame
		 * @param {Number} frameHeight - alto de cada frame
		 */
		public spriteSheet(imageName, imageUrl, frameWidth, frameHeight) {
			this.pendingLoads.push(new XEngine.ImageLoader(imageName, imageUrl, this, frameWidth, frameHeight));
		}

		/**
		 * Añade hoja de sprites a la cola de carga
		 * @method XEngine.Loader#spriteSheet
		 * @param {String} imageName - KeyName de la imagen
		 * @param {String} imageUrl - fuente de la imagen
		 * @param {String} jsonUrl - ruta donde se encuentra el json con la información del spritesheet
		 */
		public jsonSpriteSheet(imageName, imageUrl, jsonUrl) {
			this.pendingLoads.push(new XEngine.JsonImageLoader(imageName, imageUrl, jsonUrl, this));
		}

		/**
		 * Añade hoja de sprites a la cola de carga
		 * @method XEngine.Loader#spriteSheet
		 * @param {String} imageName - KeyName de la imagen
		 * @param {String} imageUrl - fuente de la imagen
		 * @param {String} jsonUrl - ruta donde se encuentra el json con la información del spritesheet
		 */
		public bitmapFont(fontName, imageUrl, xmlUrl) {
			this.pendingLoads.push(new XEngine.BitmapXMLLoader(fontName, imageUrl, xmlUrl, this));
		}

		/**
		 * Añade un audio a la cola de carga
		 * @method XEngine.Loader#audio
		 * @param {String} audioName - KeyName del audio
		 * @param {String} audioUrl - fuente del audio
		 */
		public audio(audioName, audioUrl) {
			this.pendingLoads.push(new XEngine.AudioLoader(audioName, audioUrl, this));
		}

		public obj(objURL) {
			this.pendingLoads.push(new XEngine.ObjMtlLoader(objURL, null, this));
		}

		/**
		 * Arranca la carga de archivos
		 * @method XEngine.Loader#startPreload
		 * @private
		 */
		public _startPreload() {
			this.preloading = true;
			if (this.pendingLoads.length === 0) {
				this._callStart();
			} else {
				for (let i = 0; i < this.pendingLoads.length; i++) {
					this.pendingLoads[i].load();
				}
			}
		}

		/**
		 * Actualiza las tareas completadas y las notifica cada vez que una termina
		 * @method XEngine.Loader#notifyCompleted
		 * @private
		 */
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

		/**
		 * Una vez que finaliza el proceso de carga o no hay datos a cargar, se llama al start del estado
		 * @method XEngine.Loader#callStart
		 * @private
		 */
		public _callStart() {
			this.preloading = false;
			this.game.state.currentState.start();
		}
	}
}
