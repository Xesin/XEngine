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
XEngine.Sprite = function (game, posX, posY, sprite) {
	XEngine.BaseObject.call(this, game);
	var _this = this;
	_this.sprite = sprite;
	_this.game = game; //guardamos una referencia al juego
	_this.frame = 0;
	var cache_image = _this.game.cache.image(sprite);
	if (cache_image.type == "sprite") {
		_this.width = cache_image.frameWidth || 10; //Si la imagen no se ha cargado bien, ponemos valor por defecto
		_this.height = cache_image.frameHeight || 10;
		_this._columns = Math.floor(cache_image.image.width / _this.width);
		_this._rows = Math.floor(cache_image.image.height / _this.height);
	}
	else {
		_this.json = _this.game.cache.getJson(sprite);
		var frameInfo = _this.json.frames[_this.frame];
		_this.width = frameInfo.frame.w;
		_this.height = frameInfo.frame.h;
	}
	_this.position.setTo(posX, posY);

	_this.animation = new XEngine.AnimationManager(game, this);
};

XEngine.Sprite.prototype = Object.create(XEngine.BaseObject.prototype);

XEngine.Sprite.prototypeExtends = {
	_renderToCanvas: function (canvas) { //Sobreescribimos el método render	
		var _this = this;
		canvas.save(); //Guardamos el estado actual del canvas
		var cache_image = _this.game.cache.image(_this.sprite); //Obtenemos la imagen a renderizar
		this.applyRotationAndPos(canvas);
		canvas.globalAlpha = _this.alpha;

		//Aplicamos el alpha del objeto
		//Renderizamos la imagen teniendo en cuenta el punto de anclaje
		if (cache_image.type == "sprite") {
			var width = Math.round(_this.width);
			var height = Math.round(_this.height);
			var posX = Math.round(-(width * _this.anchor.x));
			var posY = Math.round(-(height * _this.anchor.y));
			var column = _this.frame;

			if (column > _this._columns - 1) {
				column = _this.frame % _this._columns;
			}

			var row = Math.floor(_this.frame / _this._columns);
			if (_this.frame > 0) {
				console.log('Hola');
			}
			canvas.drawImage(cache_image.image, column * cache_image.frameWidth, row * cache_image.frameHeight, cache_image.frameWidth, cache_image.frameHeight, posX, posY, width, height);
		}
		else {
			var frameInfo = {};
			if (typeof _this.frame === 'string') {
				frameInfo = _this.json[_this.frame];
			}
			else {
				frameInfo = _this.json.frames[_this.frame];
			}
			var width = frameInfo.frame.w;
			var height = frameInfo.frame.h;
			var posX = Math.round(-(width * _this.anchor.x));
			var posY = Math.round(-(height * _this.anchor.y));
			canvas.drawImage(cache_image.image, frameInfo.frame.x, frameInfo.frame.y, frameInfo.frame.w, frameInfo.frame.h, posX, posY, width, height);
		}
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