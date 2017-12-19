/**
 * Objeto que pinta una imagen y que puede tener un physic body
 * 
 * @class XEngine.Sprite
 * @extends XEngine.BaseObject
 * @constructor
 * 
 * @param {XEngine.Game} game - referencia el objeto del juego
 * @param {Number} posX - posición en x
 * @param {Number} posY - posición en y
 * @param {String} sprite - nombre del sprite guardado en cache
 */
XEngine.Sprite = function (game, posX, posY, sprite, frame) {
	XEngine.BaseObject.call(this, game);
	var _this = this;
	_this.sprite = sprite;
	_this.game = game; //guardamos una referencia al juego
	_this.frame = frame || 0;
	var cache_image = _this.game.cache.image(sprite);
	//if (cache_image.type == "sprite") {
	_this.width = cache_image.frameWidth || 10; //Si la imagen no se ha cargado bien, ponemos valor por defecto
	_this.height = cache_image.frameHeight || 10;

	_this._columns = Math.floor(cache_image.image.width / _this.width);
	_this._rows = Math.floor(cache_image.image.height / _this.height);
	_this.tilled = false;
	
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

	if(_this._columns > 1 || _this._rows > 1 || _this.json != undefined){
		_this.tilled = true;
	}

	_this.position.setTo(posX, posY);
	_this.shader = XEngine.ShaderLib.Sprite.shader;
	_this.animation = new XEngine.AnimationManager(game, this);
};

XEngine.Sprite.prototype = Object.create(XEngine.BaseObject.prototype);

XEngine.Sprite.prototypeExtends = {

	_beginRender:function(context){
		
	},

	_renderToCanvas: function (context) { //Como cada objeto se renderiza distinto, en cada uno se implementa este m�todo seg�n la necesidad
		this.game.renderer.spriteBatch.addSprite(this, this.shader);
	},

	reset: function (x, y) { //Reseteamos el sprite
		this.position.x = x;
		this.position.y = y;
		this.alive = true;
		if (this.start != undefined) {
			this.start();
		}
		if (this.body) {
			this.body.velocity = new XEngine.Vector(0, 0);
		}
	},

	_updateAnims: function (deltaMillis) {
		this.animation._update(deltaMillis);
	}
};

Object.assign(XEngine.Sprite.prototype, XEngine.Sprite.prototypeExtends);