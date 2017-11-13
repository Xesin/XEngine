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
	_this.position.setTo(posX, posY); //set de la posición
	_this.shader = XEngine.ShaderLib.CircleColor.shader;
	_this.vertColors = [
		0.0, 1.0, 0.6, 1.0,
		0.0, 1.0, 0.6, 1.0,
		0.0, 1.0, 0.6, 1.0,
		0.0, 1.0, 0.6, 1.0
	  ];

	  _this.uv = [
		0.0, 0.0,
		0.0, 0.0,
		0.0, 0.0,
		0.0, 0.0,
	  ];
};

XEngine.Rect.prototype = Object.create(XEngine.BaseObject.prototype);
XEngine.Rect.constructor = XEngine.Rect;

XEngine.Rect.prototypeExtends = {
	_renderToCanvas: function (context) {
		/*var _this = this;
		canvas.save();
		this.applyRotationAndPos(canvas);
		canvas.fillStyle = _this.color;
		canvas.globalAlpha = _this.alpha;
		
		canvas.fillRect(posX, posY, _this.width, _this.height);
		canvas.restore();*/

		mat4.identity(this.mvMatrix);
		var posX = Math.round(-(this.width * this.anchor.x));
		var posY = Math.round(-(this.height * this.anchor.y));
		mat4.translate(this.mvMatrix, this.mvMatrix, [this.position.x, this.position.y, 0.0]);
		mat4.rotateZ(this.mvMatrix, this.mvMatrix, this.rotation * Math.PI / 180);
		mat4.scale(this.mvMatrix, this.mvMatrix, [this.scale.x, this.scale.y, 1.0]);
		mat4.translate(this.mvMatrix, this.mvMatrix, [posX, posY, 0.0]);
		this.shader.uniforms.mvMatrix.value = this.mvMatrix;
		this.shader.uniforms.pMatrix.value = this.game.camera.pMatrix;
		this.shader.updateUniforms(context);

		context.bindBuffer(context.ARRAY_BUFFER, this.vertexBuffer);
		context.vertexAttribPointer(this.shader.vertPostAtt, this.vertexBuffer.itemSize, context.FLOAT, false, 0, 0);
		

		context.bindBuffer(context.ARRAY_BUFFER, this.verColorBuffer);
		
		context.vertexAttribPointer(this.shader.vertColAtt, this.verColorBuffer.itemSize, context.FLOAT, false, 0, 0);

		context.vertexAttribPointer(this.vertUvAtt, this.uvBuffer.itemSize, context.FLOAT, false, 0, 0);

		context.drawArrays(context.TRIANGLE_STRIP, 0, this.vertexBuffer.numItems);
	},

	_onInitialize: function(){
		if(!this.shader.compiled){
			this.shader.initializeShader(this.game.context);
		}

		this.vertUvAtt = this.game.context.getAttribLocation(this.shader.shaderProgram, "vUv");
		this.game.context.enableVertexAttribArray(this.vertUvAtt);

		var vertices = [
			0, this.height, -1.0,
			-0, -0, -1.0,
			this.width, this.height, -1.0,
			this.width, -0, -1.0,
		]

		this.game.context.bindBuffer(this.game.context.ARRAY_BUFFER, this.vertexBuffer);
		this.game.context.bufferData(this.game.context.ARRAY_BUFFER, new Float32Array(vertices), this.game.context.STATIC_DRAW);
		this.vertexBuffer.itemSize = 3;
		this.vertexBuffer.numItems = 4;


		this.game.context.bindBuffer(this.game.context.ARRAY_BUFFER, this.verColorBuffer)
		this.game.context.bufferData(this.game.context.ARRAY_BUFFER, new Float32Array(this.vertColors), this.game.context.STATIC_DRAW);
		this.verColorBuffer.itemSize = 4;
		this.verColorBuffer.numItems = 4;

		this.game.context.bindBuffer(this.game.context.ARRAY_BUFFER, this.uvBuffer);
		this.game.context.bufferData(this.game.context.ARRAY_BUFFER, new Float32Array(this.uv), this.game.context.STATIC_DRAW);
		this.uvBuffer.itemSize = 2;
		this.uvBuffer.numItems = 4;

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

	setColor:function(r, g, b, a = 1.0){
		this.vertColors = [
			r, g, b, a,
			r, g, b, a,
			r, g, b, a,
			r, g, b, a
		  ];
		this.game.context.bindBuffer(this.game.context.ARRAY_BUFFER, this.verColorBuffer)
		this.game.context.bufferData(this.game.context.ARRAY_BUFFER, new Float32Array(this.vertColors), this.game.context.STATIC_DRAW);
	}
};

Object.assign(XEngine.Rect.prototype, XEngine.Rect.prototypeExtends);