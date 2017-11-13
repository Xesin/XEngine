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
};

XEngine.TilledImage.prototype = Object.create(XEngine.BaseObject.prototype);

XEngine.TilledImage.prototypeExtends = {
	_renderToCanvas: function (canvas) {
		var _this = this;
		canvas.save();
		var pos = _this.getWorldPos();

		if (_this.offSet.x > _this.imageWidht) { //Evitamos que el offset llegue a ser un número demasiado grande
			_this.offSet.x = _this.offSet.x - _this.imageWidht;
		}
		else if (_this.offSet.x < -_this.imageWidth) {
			_this.offSet.x = _this.offSet.x + _this.imageWidht;
		}

		if (_this.offSet.y > _this.imageHeigh) {
			_this.offSet.y = _this.offSet.y - _this.imageHeigh;
		}
		else if (_this.offSet.y < -_this.imageHeigh) {
			_this.offSet.y = _this.offSet.y + _this.imageHeigh;
		}

		var image = _this.game.cache.image(_this.sprite).image
		var pattern = canvas.createPattern(image, "repeat"); //Creamos el patron en modo repetición

		var rectX = Math.round(-(pos.x + _this.offSet.x));
		var rectY = Math.round(-(pos.y + _this.offSet.y));

		this.applyRotationAndPos(canvas, {
			x: rectX,
			y: rectY
		});

		var rectWidht = Math.round(_this.width * _this.scale.x);
		var rectHeigth = Math.round(_this.height * _this.scale.y);

		canvas.beginPath();
		canvas.rect(rectX, rectY, rectWidht, rectHeigth); //Creamos el rect donde se va pintar nuestra imagen
		canvas.fillStyle = pattern; //Asignamos el patrón que hemos creado antes
		canvas.globalAlpha = _this.alpha;
		canvas.fill();
		canvas.restore();
	},
};

Object.assign(XEngine.TilledImage.prototype, XEngine.TilledImage.prototypeExtends);
