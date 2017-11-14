/**
 * Objeto que maneja la carga de atlas con JSON
 * 
 * @class XEngine.JsonImageLoader
 * @constructor
 * @param {String} imageName - KeyName de la imagen a cargar
 * @param {String} imageUrl - uri donde está la imagen
 * @param {String} jsonUrl - uri donde está el json
 * @param {XEngine.Loader} loader - referencia al loader
 */
XEngine.JsonImageLoader = function (imageName, imageUrl, jsonUrl, loader) {
	this.imageName = imageName; //Nombre de la imagen a guardar en chache
	this.imageUrl = imageUrl; //Url de la imagen (con extension y todo)
	this.jsonUrl = jsonUrl;
	this.completed = false;
	this.loader = loader; //Referencia al loader
	this.frameWidth = 0;
	this.frameHeight = 0;
	this.oneCompleted = false;
	this.loader.image(this.imageName, this.imageUrl);
};

XEngine.JsonImageLoader.prototype = {
	/**
	 * Arranca la carga de la imagen
	 * @method XEngine.ImageLoader#load
	 * @private
	 */
	load: function () {
		var _this = this;
		_this.loadJson();
	},

	loadJson: function () {
		var _this = this;
		var request = new XMLHttpRequest();
		request.open('GET', _this.jsonUrl, true);
		var handler = function () { //Creamos el handler de cuando se completa o da error
			if (request.status == 200) {
				var returnedJson = JSON.parse(request.responseText);
				var newJson = returnedJson;
				for (var i = 0; i < newJson.frames.length; i++) {
					var frame = newJson.frames[i];
					newJson[frame.filename] = frame;
				}
				_this.loader.game.cache.json[_this.imageName] = newJson;
			}
			_this.completed = true;
			_this.loader._notifyCompleted(); //Notificamos de que la carga se ha completado
		};
		request.onload = handler;
		request.send();
	},
};