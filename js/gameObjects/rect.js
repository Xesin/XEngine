/**
 * Objeto que define un rectangulo en el juego
 * 
 * @class XEngine.Rect
 * @extends XEngine.BaseObject
 * @constructor
 * 
 * @param {XEngine.Game} game - referencia el objeto del juego
 * @param {Number} posX - posición X del objeto
 * @param {Number} posY - posición Y del objeto
 * @param {Number} width - ancho del rectángulo
 * @param {Number} height - alto del rectángulo
 * @param {String} color - string con el valor del color en hexadecimal o en rgb
 * 
 */
XEngine.Rect = function (game, posX, posY, width, height) {
	XEngine.BaseObject.call(this, game);
	var _this = this;
	_this.game = game; //guardamos una referencia al juego
	_this.width = width;
	_this.height = height;
	_this._prevWidth = width;
	_this._prevHeight = height;
	_this.position.setTo(posX, posY); //set de la posición
	_this.shader = XEngine.ShaderLib.SimpleColor.shader;
};

XEngine.Rect.prototype = Object.create(XEngine.BaseObject.prototype);
XEngine.Rect.constructor = XEngine.Rect;

XEngine.Rect.prototypeExtends = {
	/*_renderToCanvas: function (context) {
		/*var _this = this;
		canvas.save();
		this.applyRotationAndPos(canvas);
		canvas.fillStyle = _this.color;
		canvas.globalAlpha = _this.alpha;
		
		canvas.fillRect(posX, posY, _this.width, _this.height);
		canvas.restore();
},*/

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

Object.assign(XEngine.Rect.prototype, XEngine.Rect.prototypeExtends);