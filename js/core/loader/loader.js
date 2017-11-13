/**
 * @author Francisco Ferrer <xisco@xiscoferrer.com>
 * @license
 * Copyright © 2017 Francisco Ferrer Fernandez <http://www.xiscoferrer.com>
 * https://opensource.org/licenses/MIT
 */

 /**
 * Manager que controla la carga de assets
 * 
 * @class XEngine.Loader
 * @constructor
 * @param {XEngine.Game} game - Referencia al objeto game
 */
XEngine.Loader = function (game) {
	this.game = game;
	this.pendingLoads = new Array(); //Objetos a cargar
	this.progress = 0; //Progreso (de 0 a 1 == de 0% a 100%)
	this.preloading = false; //En progreso de precarga, por defecto a false
	this.onCompleteFile = new XEngine.Signal(); //Evento que se dispara cada vez que se completa una descarga. Envía el progreso actual
};

XEngine.Loader.prototype = {
	/**
	 * Añade una imagen a la cola de carga
	 * @method XEngine.Loader#image
	 * @param {String} imageName - KeyName de la imagen
	 * @param {String} imageUrl - fuente de la imagen
	 */
	image: function (imageName, imageUrl) {
		this.pendingLoads.push(new XEngine.ImageLoader(imageName, imageUrl, this));
	},

	/**
	 * Añade hoja de sprites a la cola de carga
	 * @method XEngine.Loader#spriteSheet
	 * @param {String} imageName - KeyName de la imagen
	 * @param {String} imageUrl - fuente de la imagen
	 * @param {Number} frameWidth - ancho de cada frame
	 * @param {Number} frameHeight - alto de cada frame
	 */
	spriteSheet: function (imageName, imageUrl, frameWidth, frameHeight) {
		this.pendingLoads.push(new XEngine.ImageLoader(imageName, imageUrl, this, frameWidth, frameHeight));
	},

	/**
	 * Añade hoja de sprites a la cola de carga
	 * @method XEngine.Loader#spriteSheet
	 * @param {String} imageName - KeyName de la imagen
	 * @param {String} imageUrl - fuente de la imagen
	 * @param {String} jsonUrl - ruta donde se encuentra el json con la información del spritesheet
	 */
	jsonSpriteSheet: function (imageName, imageUrl, jsonUrl) {
		this.pendingLoads.push(new XEngine.JsonImageLoader(imageName, imageUrl, jsonUrl, this));
	},

	/**
	 * Añade un audio a la cola de carga
	 * @method XEngine.Loader#audio
	 * @param {String} audioName - KeyName del audio
	 * @param {String} audioUrl - fuente del audio
	 */
	audio: function (audioName, audioUrl) {
		this.pendingLoads.push(new XEngine.AudioLoader(audioName, audioUrl, this));
	},

	/**
	 * Arranca la carga de archivos
	 * @method XEngine.Loader#startPreload
	 * @private
	 */
	_startPreload: function () {
		this.preloading = true;
		if (this.pendingLoads.length == 0) { //Si no hay cargas pendientes, llama directamente al start
			this._callStart();
		}
		else { //En caso contrario llama al load de cada objeto a cargar
			for (var i = 0; i < this.pendingLoads.length; i++) {
				this.pendingLoads[i].load();
			}
		}
	},

	/**
	 * Actualiza las tareas completadas y las notifica cada vez que una termina
	 * @method XEngine.Loader#notifyCompleted
	 * @private
	 */
	_notifyCompleted: function () {
		var completedTasks = 0;

		for (var i = 0; i < this.pendingLoads.length; i++) { //Recorremos las cargas pendientes para ver cuales se han completado
			if (this.pendingLoads[i].completed) {
				completedTasks++;
			}
		}

		this.progress = completedTasks / this.pendingLoads.length; //Calculamos el progreso
		this.onCompleteFile.dispatch(this.progress); //Disparamos el evento

		if (this.progress == 1) { //Si el progreso llega al 100% terminamos, liberamos memoria y llamamos al start
			delete this.pendingLoads;
			this.onCompleteFile._destroy();
			this.pendingLoads = new Array();
			this._callStart();
		}
	},

	/**
	 * Una vez que finaliza el proceso de carga o no hay datos a cargar, se llama al start del estado
	 * @method XEngine.Loader#callStart
	 * @private
	 */
	_callStart: function () {
		this.preloading = false;
		this.game.state.currentState.start(); //Llama al start del estado actual
	},
};