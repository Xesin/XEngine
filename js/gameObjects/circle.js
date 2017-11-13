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
XEngine.Circle = function (game, posX, posY, radius, color, stroke, strokeColor, fill, startAngle, endAngle) {
	XEngine.BaseObject.call(this, game);
	var _this = this;
	_this.game = game; //guardamos una referencia al juego
	_this.radius = radius;
	_this.color = color;
	_this.position.setTo(posX, posY); //set de la posición
	_this.stroke = stroke || 0;
	_this.fill = fill;
	if (fill == undefined) {
		_this.fill = true;
	}
	_this.strokeColor = strokeColor || 'white';
	_this.startAngle = startAngle || 0;
	_this.endAngle = endAngle || 360;
};

XEngine.Circle.prototype = Object.create(XEngine.BaseObject.prototype);
XEngine.Circle.constructor = XEngine.Circle;

XEngine.Circle.prototypeExtends = {
	_renderToCanvas: function (canvas) {
		var _this = this;
		canvas.save();
		this.applyRotationAndPos(canvas);
		canvas.globalAlpha = _this.alpha;
		var posX = Math.round(-(_this.radius * 2) * _this.anchor.x);
		var posY = Math.round(-(_this.radius * 2) * _this.anchor.y);
		canvas.beginPath();
		var startAntle = _this.startAngle * (Math.PI / 180);
		var endAngle = _this.endAngle * (Math.PI / 180);
		canvas.arc(posX, posY, _this.radius, startAntle, endAngle);
		if (_this.fill) {
			canvas.fillStyle = _this.color;
			canvas.fill();
		}
		if (_this.stroke > 0) {
			canvas.lineWidth = 5;
			canvas.strokeStyle = _this.strokeColor;
			canvas.stroke();
		}
		canvas.restore();
	},

	getBounds: function () {
		var _this = this;
		var width = (_this.radius * 2) * _this.scale.x;
		var height = (_this.radius * 2) * _this.scale.y;
		return {
			width: width,
			height: height
		};
	},
};

Object.assign(XEngine.Circle.prototype, XEngine.Circle.prototypeExtends);