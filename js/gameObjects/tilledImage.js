/**
 * Objeto que define una imagen que se repite
 * 
 * @class XEngine.TilledImage
 * @extends XEngine.BaseObject
 * @constructor
 * 
 * @param {XEngine.Game} game - referencia el objeto del juego
 * @param {Number} posX - posición en x
 * @param {Number} posY - posición en y
 * @param {String} sprite - nombre del sprite guardado en cache
 * @param {Number} widht - ancho de la imagen
 * @param {Number} height - alto de la imagen
 * 
 */
XEngine.TilledImage = function (game, posX, posY, sprite, widht, height) {
	XEngine.BaseObject.call(this, game);
	var _this = this;
	_this.sprite = sprite;
	_this.game = game; //guardamos una referencia al juego
	var image = _this.game.cache.image(sprite).image;
	_this.imageWidht = image.widht || 10;
	_this.imageHeigh = image.height || 10;
	_this.width = widht;
	_this.height = height;
	_this.position.setTo(posX, posY);
	_this.offSet = new XEngine.Vector(0, 0); //Offset para poder mover la posición del tilling
	_this.shader = XEngine.ShaderLib.Sprite.shader;
};

XEngine.TilledImage.prototype = Object.create(XEngine.BaseObject.prototype);

XEngine.TilledImage.prototypeExtends = {
	_renderToCanvas: function (context) {
		if(this.shader == null) return;
		var _this = this;
		var cache_image = _this.game.cache.image(_this.sprite); //Obtenemos la imagen a renderizar
		_this.shader._setTexture(cache_image._texture);
		_this.shader._beginRender(context);

		var startX = 0;
		var startY = 0;
		var endX = 0;
		var endY = 0;

		var row = Math.floor(_this.frame / _this._columns);

		if(_this.offSet.x > cache_image.image.widht) _this.offSet.x = _this.offSet.x - cache_image.image.widht;
		if(_this.offSet.y > cache_image.image.height) _this.offSet.y = _this.offSet.y - cache_image.image.height;

		var startUvX = (_this.offSet.x) / cache_image.image.width;
		var startUvY = (_this.offSet.y) / cache_image.image.height;

		var endUvX = (_this.width + _this.offSet.x) / cache_image.image.width;
		var endUvY = (_this.height + _this.offSet.y) / cache_image.image.height;

		var uv = [
			startUvX, startUvY,
			startUvX, endUvY,
			endUvX, startUvY,
			endUvX, endUvY,
		];

		this._setUVs(uv);

		XEngine.BaseObject.prototype._renderToCanvas.call(this, context);
	},
};

Object.assign(XEngine.TilledImage.prototype, XEngine.TilledImage.prototypeExtends);
