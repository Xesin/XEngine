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
XEngine.Button = function (game, posX, posY, sprite, frameIdle, spriteDown, spriteOver, spriteUp) {
	XEngine.Sprite.call(this, game, posX, posY, sprite, frameIdle);
	var _this = this;
	_this.spriteNormal = frameIdle || sprite;
	_this.spriteDown = spriteDown || _this.spriteNormal;
	_this.spriteOver = spriteOver || _this.spriteNormal;
	_this.spriteUp = spriteUp || _this.spriteNormal;
	_this.game = game; //guardamos una referencia al juego
	_this._swapSprite(frameIdle);
	_this.position.setTo(posX, posY);
	_this.inputEnabled = true;
	_this.shader = XEngine.ShaderLib.Sprite.shader;

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

XEngine.Button.prototype = Object.create(XEngine.Sprite.prototype);

XEngine.Button.prototypeExtends = {

	_swapSprite: function (sprite) {
		var _this = this;
		if(!_this.tilled){
			_this.sprite = sprite;
			var new_image = _this.game.cache.image(_this.sprite).image;
			_this.width = new_image.width || 10; //Si la imagen no se ha cargado bien, ponemos valor por defecto
			_this.height = new_image.height || 10;
		}else{
			_this.frame = sprite;
			if(_this.game.cache.getJson(sprite) != undefined) {
				_this.json = _this.game.cache.getJson(sprite);
				var frameInfo = {};
				if (typeof _this.frame === 'string') {
					frameInfo = _this.json[_this.frame];
				}
				else {
					frameInfo = _this.json.frames[_this.frame];
				}
				_this.width = frameInfo.frame.w;
				_this.height = frameInfo.frame.h;
			}
		}
	},
};


Object.assign(XEngine.Button.prototype, XEngine.Button.prototypeExtends);