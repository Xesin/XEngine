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
	_this.textColor = textStyle.font_color || 'white';
	_this.style = '';
	_this.strokeWidth = textStyle.stroke_width || 0;
	_this.strokeColor = textStyle.stroke_color || 'black';
	_this.canvas = document.createElement("canvas"); //Ponemos los valores al canvas para objeter el width del texto
	_this.context = _this.canvas.getContext("2d");
	_this.context.save();
	_this.context.font = _this.size + 'px ' + _this.font;
	var textSize = _this.context.measureText(_this.text);
	_this.context.restore(); //Restauramos los valores previos
	_this.width = textSize.width;
	_this.height = _this.size;
	_this.position.setTo(posX, posY);
	_this.shader = XEngine.ShaderLib.Sprite.shader;
	_this._updateText();
};

//TODO pendiente de comentar a partir de aquí

XEngine.Text.prototype = Object.create(XEngine.BaseObject.prototype);

XEngine.Text.prototypeExtends = {
	_beginRender:function(context){
		XEngine.BaseObject.prototype._beginRender.call(this, context);
		this.shader._setTexture(this.texture);
		this.shader._beginRender(context);
	},

	_renderToCanvas: function (context) {
		if(this.shader == null) return;
		var _this = this;
		XEngine.BaseObject.prototype._renderToCanvas.call(this, context);
	},

	_updateText: function(){
		var _this = this;
		_this.context.globalAlpha = _this.alpha;
		var font = font = _this.style + ' ' + _this.size + 'px ' + _this.font;
		_this.context.font = font.trim();
		var textSize = _this.context.measureText(_this.text);
		_this.width = textSize.width;
		_this.height = _this.size * 0.8;
		_this.canvas.width = textSize.width;
		_this.canvas.height = _this.height;
		_this.context.font = font.trim();
		if (_this.strokeWidth > 0) {
			_this.context.strokeStyle = _this.strokeColor;
			_this.context.lineWidth = _this.strokeWidth;
			_this.context.strokeText(_this.text, 0, _this.height);
		}
		_this.context.fillStyle = _this.textColor;
		_this.context.fillText(_this.text, 0, _this.height);
		var texture = new XEngine.Texture2D('textTexture', _this.width, _this.height, XEngine.Texture2D.WRAP_MODES.CLAMP);
		texture.image = _this.context.canvas;
		texture.createTexture(_this.game.context);
		_this.texture = texture._texture;
		_this._setVertices(_this.width, _this.height, _this.color, _this._uv);
	},

	setText:function(text){
		this.text = text;
		this._updateText();
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