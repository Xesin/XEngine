/**
 * Manager que se encarga de escalar el manager según el tipo de escala que se especifique
 * 
 * @class XEngine.ScaleManager
 * @constructor
 * @param {XEngine.Game} game - referencia al objeto del juego
 */
XEngine.ScaleManager = function (game) {
	this.game = game;
	this.scaleType = XEngine.Scale.NO_SCALE;
	this.orientation = 'landScape';
	this.sourceAspectRatio = 0;
};

XEngine.Scale = {
	FIT: 0,
	SHOW_ALL: 1,
	NO_SCALE: 2,
};

XEngine.ScaleManager.prototype = {
	/**
	 * Inicializa el ScaleManager. Se llama al iniciar el juego
	 * @method XEngine.ScaleManager#init
	 * @private
	 */
	init: function () {
		var _this = this;
		var onWindowsResize = function (event) {
			_this.onWindowsResize(event);
		};
		window.addEventListener('resize', onWindowsResize, true);
	},

	/**
	 * Callback que se llama al redimensionar la ventana
	 * @method XEngine.ScaleManager#onWindowsResize
	 * @param {Object} event - Evento que lanza el listener
	 * @private
	 */
	onWindowsResize: function (event) {
		this.updateScale();
	},

	/**
	 * Actualiza el tamaño del canvas y la escala que tiene. Es llamada por el callback onWindowsResize
	 * @method XEngine.ScaleManager#updateScale
	 */
	updateScale: function () {
		if (this.scaleType !== XEngine.Scale.NO_SCALE) {
			var newWidth = 0;
			var newHeight = 0;
			if (this.scaleType === XEngine.Scale.FIT) {
				newWidth = window.innerWidth;
				newHeight = window.innerHeight;
			}
			else {
				this.sourceAspectRatio = this.game.width / this.game.height;
				newHeight = window.innerHeight;
				newWidth = newHeight * this.sourceAspectRatio;
				if (newWidth > window.innerWidth) {
					newWidth = window.innerWidth;
					newHeight = newWidth / this.sourceAspectRatio;
				}
			}
			newWidth = Math.round(newWidth);
			newHeight = Math.round(newHeight);
			this.resizeCanvas(newWidth, newHeight);
		}
	},

	/**
	 * Cambia el tamaño del canvas
	 * @method XEngine.ScaleManager#resizeCanvas
	 * @param {Number} newWidth - nuevo ancho del canvas
	 * @param {Number} newHeight - nuevo alto del canvas
	 */
	resizeCanvas: function (newWidth, newHeight) {
		this.game.canvas.setAttribute('width', newWidth);
		this.game.canvas.setAttribute('height', newHeight);
		this.game.renderer.setScale(newWidth / this.game.width, newHeight / this.game.height);
		this.game.context.viewport(0, 0, this.game.canvas.width, this.game.canvas.height);
	},
};