/**
 * Objeto que controla las animaciones de un Sprite
 * 
 * @class XEngine.AnimationManager
 * @constructor
 * 
 * @param {XEngine.Game} game - referencia el objeto del juego
 * @param {XEngine.Sprite} sprite - objeto sprite que controla
 */
XEngine.AnimationManager = function (game, sprite) { //Manager para manejar el uso de las animaciones de los sprites
	var _this = this;
	_this.sprite = sprite;
	_this.game = game; //guardamos una referencia al juego
	_this.animations = new Array();
	_this.currentAnim = null;
};

XEngine.AnimationManager.prototype = {
	_update: function (deltaMillis) {
		var _this = this;
		if (_this.currentAnim && _this.currentAnim.playing) {
			_this.currentAnim._update(deltaMillis);
		}
	},

	play: function (animName) { //Ejecuta una animación
		if (this.currentAnim && this.animations[animName] != this.currentAnim) { //Si ya hay una en marcha, la paramos
			this.currentAnim._stop();
		}
		var anim = this.animations[animName];
		if (!anim) {
			return;
		}
		this.currentAnim = anim;
		anim._start();
		return this.currentAnim;
	},

	_stop: function (animName) {
		var anim = this.animations[animName];
		if (!anim) {
			return;
		}
		this.currentAnim = null;
		anim._stop();
	},

	add: function (animName, frames, rate, loop) {
		var anim = new XEngine.Animation(this.game, this.sprite, frames, rate);
		anim.loop = loop || false;
		this.animations[animName] = anim;
	}
};