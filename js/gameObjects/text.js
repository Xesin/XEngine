/**
 * Objeto que define un texto
 * 
 * @class XEngine.Text
 * @extends XEngine.BaseObject
 * @constructor
 * 
 * @param {XEngine.Game} game - referencia el objeto del juego
 * @param {Number} posX - posición en x
 * @param {Number} posY - posición en y
 * @param {String} [text=""] - texto a mostrar
 * @param {object} [textStyle] - objeto que contiene los valores de estilo
 * 
 */
XEngine.Text = function (game, posX, posY, text, textStyle) {
	XEngine.BaseObject.call(this, game);
	var _this = this;
	_this.game = game; //guardamos una referencia al juego
	_this.text = text || ""; //Set de los atributos del texto
	textStyle = textStyle || {};
	_this.font = textStyle.font || 'Arial';
	_this.size = textStyle.font_size || 12;
	_this.color = textStyle.font_color || 'white';
	_this.style = '';
	_this.strokeWidth = textStyle.stroke_width || 0;
	_this.strokeColor = textStyle.stroke_color || 'black';
	var canvas = game.context; //Ponemos los valores al canvas para objeter el width del texto
	canvas.save();
	canvas.font = _this.size + 'px ' + _this.font;
	var textSize = canvas.measureText(_this.text);
	canvas.restore(); //Restauramos los valores previos
	_this.width = textSize.width;
	_this.height = _this.size;
	_this.position.setTo(posX, posY);
};

//TODO pendiente de comentar a partir de aquí

XEngine.Text.prototype = Object.create(XEngine.BaseObject.prototype);

XEngine.Text.prototypeExtends = {
	_renderToCanvas: function (canvas) {
		var _this = this;
		canvas.save();
		_this.applyRotationAndPos(canvas, _this.offSet);
		canvas.globalAlpha = _this.alpha;
		var font = font = _this.style + ' ' + _this.size + 'px ' + _this.font;
		canvas.font = font.trim();
		var textSize = canvas.measureText(_this.text);
		_this.width = textSize.width;
		_this.height = _this.size * 1.5;
		var posX = Math.round(-(_this.width * _this.anchor.x));
		var posY = Math.round(-(_this.height * _this.anchor.y));
		var pos = {
			x: posX,
			y: posY + _this.size
		};
		if (_this.strokeWidth > 0) {
			canvas.strokeStyle = _this.strokeColor;
			canvas.lineWidth = _this.strokeWidth;
			canvas.strokeText(_this.text, pos.x, pos.y);
		}
		canvas.fillStyle = _this.color;
		canvas.fillText(_this.text, pos.x, pos.y);
		canvas.restore();
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
};

Object.assign(XEngine.Text.prototype, XEngine.Text.prototypeExtends);