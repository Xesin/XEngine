/**
 * Objeto que define un boton
 * 
 * @class XEngine.Button
 * @extends XEngine.BaseObject
 * @constructor
 * 
 * @param {XEngine.Game} game - referencia el objeto del juego
 * @param {Number} posX - posición en x
 * @param {Number} posY - posición en y
 * @param {String} sprite - nombre del sprite guardado en cache
 * @param {String} [spriteDown] - nombre del sprite guardado en cache para cuando se aprieta
 * @param {String} [spriteOver] - nombre del sprite guardado en cache ara cuando se pasa el ratón por encima
 * @param {String} [spriteUp] - nombre del sprite guardado en cache para cuando se suelta
 * 
 */
XEngine.Button = function (game, posX, posY, sprite, spriteDown, spriteOver, spriteUp) {
	XEngine.BaseObject.call(this, game);
	var _this = this;
	_this.spriteNormal = sprite;
	_this.spriteDown = spriteDown || sprite;
	_this.spriteOver = spriteOver || sprite;
	_this.spriteUp = spriteUp || sprite;
	_this.game = game; //guardamos una referencia al juego
	_this._swapSprite(sprite);
	_this.position.setTo(posX, posY);
	_this.inputEnabled = true;

	_this.onClick = new XEngine.Signal();

	_this.onInputDown.add(function () {
		_this._swapSprite(_this.spriteDown);
	}, this);

	_this.onInputOver.add(function () {
		if (!_this.isInputDown)
			_this._swapSprite(_this.spriteOver);
	}, this);

	_this.onInputLeft.add(function () {
		if (!_this.isInputDown)
			_this._swapSprite(_this.spriteNormal);
	}, this);

	_this.onInputUp.add(function () {
		_this.onClick.dispatch();
		if (!_this.isInputOver) {
			_this._swapSprite(_this.spriteUp);
		}
		else {
			_this._swapSprite(_this.spriteOver);
		}
	}, this);
};

XEngine.Button.prototype = Object.create(XEngine.BaseObject.prototype);

XEngine.Button.prototypeExtends = {

	_swapSprite: function (sprite) {
		var _this = this;
		_this.sprite = sprite;
		var new_image = _this.game.cache.image(_this.sprite).image;
		_this.width = new_image.width || 10; //Si la imagen no se ha cargado bien, ponemos valor por defecto
		_this.height = new_image.height || 10;
	},

	_renderToCanvas: function (canvas) { //Sobreescribimos el método render	
		var _this = this;
		canvas.save(); //Guardamos el estado actual del canvas
		var image = _this.game.cache.image(_this.sprite).image; //Obtenemos la imagen a renderizar
		this.applyRotationAndPos(canvas);
		canvas.globalAlpha = _this.alpha; //Aplicamos el alpha del objeto
		var posX = Math.round(-(_this.width * _this.anchor.x));
		var posY = Math.round(-(_this.height * _this.anchor.y));
		//Renderizamos la imagen teniendo en cuenta el punto de anclaje
		canvas.drawImage(image, posX, posY, _this.width, _this.height);
		canvas.restore(); //Restauramos el estado del canvas
	},

	getBounds: function () {
		var _this = this;
		var width = _this.width * _this.scale.x;
		var height = _this.height * _this.scale.y;
		return {
			width: width,
			height: height
		};
	},
};


Object.assign(XEngine.Button.prototype, XEngine.Button.prototypeExtends);