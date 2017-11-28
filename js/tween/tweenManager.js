/**
 * Manager que se encarga de la creación y el manejo de Tweens
 * 
 * @class XEngine.TweenManager
 * @constructor
 * @param {XEngine.Game} game - referencia al objeto del juego
 */
XEngine.TweenManager = function (game) {
	this.game = game;
	this.tweens = new Array();
};

XEngine.TweenManager.prototype = {

	/**
	 * Añade un tween que controla el target que se le pasa por parametro
	 * @method XEngine.TweenManager#add
	 * @param {Object} target - objeto al que se le va a aplicar el tween en una de sus propiedades
	 * @return {XEngine.Tween}
	 */
	add: function (target) { //Añade un tween para el objeto que se le pasa por parametro
		var tween = new XEngine.Tween(target);
		this.tweens.push(tween);
		return tween;
	},

	_update: function (deltaTimeMillis) {
		var _this = this;
		for (var i = 0; i < _this.tweens.length; i++) //Recorremos todos los tweens que han sido creados
		{
			var tween = _this.tweens[i];
			if (tween.isPendingDestroy) { //Si el tween está marcado para destruir, liberamos memoria y lo quitamos del array
				delete _this.tweens[i];
				_this.tweens.splice(i, 1);
				i--;
			}
			else if (tween.isRunning) { //Si está en marcha, lo actualizamos
				tween._update(deltaTimeMillis);
			}
			else if (tween.autoStart && !tween.started) { //Si no está en marcha pero tiene autoStart, lo arrancamos
				tween.play();
			}
		}
	},

	/**
	 * Destruye todos los tweens
	 * @method XEngine.TweenManager#_destroy
	 * @private
	 */
	_destroy: function () {
		for (var i = this.tweens.length - 1; i >= 0; i--) //Liberamos la memoria de todos los tweens que teníamos creados
		{
			this.tweens[i].destroy();
			delete this.tweens[i];
		}
		delete this.tweens;
		this.tweens = new Array();
	}
};