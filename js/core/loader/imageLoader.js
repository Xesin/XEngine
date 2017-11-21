/**
 * @author Francisco Ferrer <xisco@xiscoferrer.com>
 * @license
 * Copyright © 2017 Francisco Ferrer Fernandez <http://www.xiscoferrer.com>
 * https://opensource.org/licenses/MIT
 */

 /**
 * Objeto que maneja la carga de las imagenes
 * 
 * @class XEngine.ImageLoader
 * @constructor
 * @param {String} imageName - KeyName de la imagen a cargar
 * @param {String} imageUrl - uri donde está la imagen
 * @param {XEngine.Loader} loader - referencia al loader
 * @param {Number} [frameWidth] - ancho de la imagen;
 * @param {Number} [frameHeight] - alto de la imagen;
 */
XEngine.ImageLoader = function (imageName, imageUrl, loader, frameWidth, frameHeight) {
	this.imageName = imageName; //Nombre de la imagen a guardar en chache
	this.imageUrl = imageUrl; //Url de la imagen (con extension y todo)
	this.completed = false;
	this.loader = loader; //Referencia al loader
	this.frameWidth = frameWidth || 0;
	this.frameHeight = frameHeight || 0;
};

XEngine.ImageLoader.prototype = {
	/**
	 * Arranca la carga de la imagen
	 * @method XEngine.ImageLoader#load
	 * @private
	 */
	load: function () {
		var _this = this;
		var newImage = new XEngine.Texture2D(_this.imageName, _this.frameWidth, _this.frameHeight, 1);

		var img1 = new Image(); //Creamos el objeto Image
		var handler = function () { //Creamos el handler de cuando se completa o da error
			var imageRef = _this.loader.game.cache.images[_this.imageName]; //Obtenemos la imagen de cache
			imageRef.image = this; //Asignamos la referencia
			_this.completed = true; //Marcamos como completado

			if (_this.frameWidth == 0) {
				imageRef.frameWidth = this.width;
				newImage.wrapMode = XEngine.Texture2D.WRAP_MODES.CLAMP;
			}
			else {
				imageRef.frameWidth = _this.frameWidth;
			}

			if (_this.frameHeight == 0) {
				imageRef.frameHeight = this.height;
				newImage.wrapMode = XEngine.Texture2D.WRAP_MODES.CLAMP;
			}
			else {
				imageRef.frameHeight = _this.frameHeight;
			}
			
			imageRef.createTexture(_this.loader.game.context);
			_this.loader._notifyCompleted(); //Notificamos de que la carga se ha completado
		};
		img1.onload = handler; //Asignamos los handlers
		img1.onerror = handler;
		img1.src = _this.imageUrl; //Asignamos la url al objeto imagen
		_this.loader.game.cache.images[newImage.imageName] = newImage; //Guardamos nuesto objeto de imagen en cache para luego recogerlo
	}
};