/**
 * Objeto que define un circulo
 * 
 * @class XEngine.Circle
 * @extends XEngine.BaseObject
 * @constructor
 * 
 * @param {XEngine.Game} game - referencia el objeto del juego
 * @param {Number} posX - posición X del objeto
 * @param {Number} posY - posición Y del objeto
 * @param {Number} radius - radio del circulo
 * @param {String} color - string con el valor del color en hexadecimal o en rgb
 * @param {Number} stroke - ancho del borde
 * @param {String} strokeColor - string con el valor del color del borde en hexadecimal o en rgb
 * @param {Boolean} fill - determina si se rellena o se deja solo el borde
 * @param {Number} startAngle - angulo en el que empieza a pintar
 * @param {Number} endAngle - angulo en el que termina a pintar
 * 
 */
XEngine.Circle = function (game, posX, posY, width, height) {
	XEngine.BaseObject.call(this, game);
	var _this = this;
	_this.game = game; //guardamos una referencia al juego
	_this.height = height;
	_this.width = width;
	_this.position.setTo(posX, posY); //set de la posición
	_this.shader = XEngine.ShaderLib.CircleColor.shader;
};

XEngine.Circle.prototype = Object.create(XEngine.BaseObject.prototype);
XEngine.Circle.constructor = XEngine.Circle;

XEngine.Circle.prototypeExtends = {
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

Object.assign(XEngine.Circle.prototype, XEngine.Circle.prototypeExtends);