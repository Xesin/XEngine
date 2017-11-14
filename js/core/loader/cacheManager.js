/**
 * @author Francisco Ferrer <xisco@xiscoferrer.com>
 * @license
 * Copyright © 2017 Francisco Ferrer Fernandez <http://www.xiscoferrer.com>
 * https://opensource.org/licenses/MIT
 */

 /**
 * Objeto que almacena los assets cargados
 * 
 * @class XEngine.Cache
 * @constructor
 * @param {XEngine.Game} game - referencia al objeto del juego
 */
XEngine.Cache = function (game) {
	this.game = game;
	this.images = new Array(); //Cache de imagenes
	this.audios = new Array(); //Cache de audios
	this.json = new Array();
};

XEngine.Cache.prototype = {
	/**
	 * Devuelve una imagen guardada en cache
	 * @method XEngine.Cache#image
	 * @param {String} imageName - keyName de la imagen
	 * @private
	 */
	image: function (imageName) {
		if (this.images[imageName] == undefined) {
			console.error('No hay imagen para el nombre: ' + imageName);
		}
		else {
			return this.images[imageName];
		}
	},

	/**
	 * Devuelve un audio guardado en cache
	 * @method XEngine.Cache#audio
	 * @param {String} audioName - keyName del audio
	 * @private
	 */
	audio: function (audioName) {
		if (this.audios[audioName] == undefined) {
			console.error('No hay audio para el nombre: ' + audioName);
		}
		else {
			return this.audios[audioName];
		}
	},

	getJson: function(jsonName){
		return this.json[jsonName];
	},

	/**
	 * Borra toda la cache
	 * @method XEngine.Cache#clearChache
	 */
	clearCache: function () {
		delete this.images;
		delete this.audios;
		delete this.json;
		this.images = new Array();
		this.audios = new Array();
		this.json = new Array();
	}
};