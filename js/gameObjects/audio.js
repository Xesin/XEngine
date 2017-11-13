/**
 * Objeto que define un sonido
 * 
 * @class XEngine.Audio
 * @constructor
 * 
 * @param {XEngine.Game} game - referencia el objeto del juego
 * @param {String} audioName - nombre del sonido guardado en cache
 * @param {Boolean} [autoStart=false] - define si el sonido debe empezar al crearse
 * @param {Number} [volume=1] - define el volumen del audio
 * 
 */
XEngine.Audio = function (game, audioName, autoStart, volume) {
	var _this = this;
	_this.game = game;
	_this.isLoop = false;
	_this.audio = _this.game.cache.audio(audioName).audio;
	_this.persist = false;
	_this.volume = volume || 1;
	_this.onComplete = new XEngine.Signal();

	_this.completed = false;
	_this.pendingDestroy = false;
	_this.alive = true;
	if (autoStart) {
		this.play();
	}
};

XEngine.Audio.prototype = {
	update: function () {
		if (this.gainNode != null) {
			this.gainNode.gain.value = this.volume;
		}
	},

	play: function (time) {
		var _this = this;
		_this.source = _this.game.audioContext.createBufferSource();
		_this.source.buffer = _this.audio;
		_this.source.connect(_this.game.audioContext.destination);
		_this.source.onended = function () {
			_this._complete();
		};
		_this.gainNode = _this.game.audioContext.createGain();
		_this.source.connect(_this.gainNode);
		_this.gainNode.connect(_this.game.audioContext.destination);
		_this.gainNode.gain.value = _this.volume;
		this.source.loop = this.isLoop;
		_this.source.start(time || 0);
	},

	stop: function (time) {
		if (this.source)
			this.source.stop(time || 0);
	},

	loop: function (value) {
		this.isLoop = value;
	},

	destroy: function () {
		this.kill();
		this.pendingDestroy = true;
		if (this.onComplete) {
			this.onComplete._destroy();
			delete this.onComplete;
		}
	},

	kill: function () {
		this.alive = false;
		this.stop();
	},

	_complete: function () {
		var _this = this;
		this.stop();
		if (_this.onComplete) {
			_this.onComplete.dispatch();
		}
	}
};