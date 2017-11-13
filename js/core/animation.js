/**
 * Objeto que almacena los datos de una animación
 * 
 * @class XEngine.Animation
 * @constructor
 * 
 * @param {XEngine.Game} game - referencia el objeto del juego
 * @param {XEngine.Sprite} sprite - objeto sprite que controla
 * @param {Array.<Number>|Array.<String>} frames - array con los frames que muestra la animación
 * @param {Number} rate - tiempo de refresco en milisegundos
 */
XEngine.Animation = function (game, sprite, frames, rate) { //Objeto que almacena la información de una animación y la ejecuta
	var _this = this;
	_this.sprite = sprite;
	_this.game = game; //guardamos una referencia al juego
	_this.currentFrame = 0;
	_this.maxFrames = frames.length - 1;
	_this.frames = frames;
	_this.rate = rate;
	_this.frameTime = 0;
	_this.loop = false;
	_this.playing = false;
};

XEngine.Animation.prototype = {
	_update: function (deltaMillis) {
		var _this = this;
		_this.frameTime += deltaMillis;
		if (_this.frameTime >= _this.rate) {
			_this.currentFrame++;
			_this.frameTime = 0;
			if (_this.currentFrame > _this.maxFrames) {
				if (_this.loop) {
					_this.currentFrame = 0;
				}
				else {
					_this._stop();
					return;
				}
			}
		}
		_this.sprite.frame = _this.frames[_this.currentFrame];
	},

	_start: function () {
		this.playing = true;
	},

	_stop: function () {
		this.playing = false;
		this.frameTime = 0;
		this.currentFrame = 0;
	},
};