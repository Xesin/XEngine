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
};

XEngine.JsonImageLoader.prototype = {
	/**
	 * Arranca la carga de la imagen
	 * @method XEngine.ImageLoader#load
	 * @private
	 */
	load: function () {
		var _this = this;
		_this.loadImage();
		_this.loadJson();
	},

	loadImage: function () {
		var _this = this;
		var newImage = { //Creamos el objeto a guardar en cache
			imageName: _this.imageName, //Nombre de la imagen
			image: null, //Referencia de la imagen
			frameWidth: _this.frameWidth,
			frameHeight: _this.frameHeight,
			data: new Array(),
			type: "jsonSprite"
		};
		var img1 = new Image(); //Creamos el objeto Image
		var imageHandler = function () { //Creamos el handler de cuando se completa o da error
			var imageRef = _this.loader.game.cache.images[_this.imageName]; //Obtenemos la imagen de cache
			imageRef.image = this; //Asignamos la referencia

			if (_this.frameWidth == 0) {
				imageRef.frameWidth = this.width;
			}
			else {
				imageRef.frameWidth = _this.frameWidth;
			}

			if (_this.frameHeight == 0) {
				imageRef.frameHeight = this.height;
			}
			else {
				imageRef.frameHeight = _this.frameHeight;
			}

			var canvas = document.createElement("canvas");
			canvas.width = this.width;
			canvas.height = this.height;

			var ctx = canvas.getContext("2d");
			ctx.drawImage(this, 0, 0);

			var data = ctx.getImageData(0, 0, this.width, this.height).data;

			//Push pixel data to more usable object
			for (var i = 0; i < data.length; i += 4) {
				var rgba = {
					r: data[i],
					g: data[i + 1],
					b: data[i + 2],
					a: data[i + 3]
				};

				imageRef.data.push(rgba);
			}
			if (_this.oneCompleted) {
				_this.completed = true; //Marcamos como completado
				_this.loader._notifyCompleted(); //Notificamos de que la carga se ha completado
			}
			else {
				_this.oneCompleted = true;
			}
		};
		img1.onload = imageHandler; //Asignamos los handlers
		img1.onerror = imageHandler;
		img1.src = _this.imageUrl; //Asignamos la url al objeto imagen
		_this.loader.game.cache.images[_this.imageName] = newImage; //Guardamos nuesto objeto de imagen en cache para luego recogerlo
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

			if (_this.oneCompleted) {
				_this.completed = true; //Marcamos como completado
				_this.loader._notifyCompleted(); //Notificamos de que la carga se ha completado
			}
			else {
				_this.oneCompleted = true;
			}
		};
		request.onload = handler;
		request.send();
	},
};