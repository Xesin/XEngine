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
XEngine.Rect = function (game, posX, posY, width, height, color) {
	XEngine.BaseObject.call(this, game);
	var _this = this;
	_this.game = game; //guardamos una referencia al juego
	_this.width = width;
	_this.height = height;
	_this.color = color;
	_this.position.setTo(posX, posY); //set de la posición
};

XEngine.Rect.prototype = Object.create(XEngine.BaseObject.prototype);
XEngine.Rect.constructor = XEngine.Rect;

function getShader(gl, id) {
	var shaderScript = document.getElementById(id);
	if (!shaderScript) {
		return null;
	}

	var str = "";
	var k = shaderScript.firstChild;
	while (k) {
		if (k.nodeType == 3)
			str += k.textContent;
		k = k.nextSibling;
	}

	var shader;
	if (shaderScript.type == "x-shader/x-fragment") {
		shader = gl.createShader(gl.FRAGMENT_SHADER);
	} else if (shaderScript.type == "x-shader/x-vertex") {
		shader = gl.createShader(gl.VERTEX_SHADER);
	} else {
		return null;
	}

	gl.shaderSource(shader, str);
	gl.compileShader(shader);

	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		alert(gl.getShaderInfoLog(shader));
		return null;
	}

	return shader;
}

var shaderProgram;
function initShaders(gl) {
  var fragmentShader = getShader(gl, "shader-fs");
  var vertexShader = getShader(gl, "shader-vs");

  shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
	alert("Could not initialise shaders");
  }

  gl.useProgram(shaderProgram);

  shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");

  gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

  shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
  shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
  shaderProgram.color = gl.getUniformLocation(shaderProgram, "color");
}

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

		context.bindBuffer(context.ARRAY_BUFFER, this.vertexBuffer);
		context.vertexAttribPointer(shaderProgram.vertexPositionAttribute, this.vertexBuffer.itemSize, context.FLOAT, false, 0, 0);

		context.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, this.game.camera.pMatrix);
		context.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, this.mvMatrix);
		context.uniform4fv(shaderProgram.color, [0.0, 1.0, 0.6, 1.0]);
		shaderProgram.color
		context.drawArrays(context.TRIANGLE_STRIP, 0, this.vertexBuffer.numItems);
	},

	_onInitialize: function(){
		this.game.context.bindBuffer(this.game.context.ARRAY_BUFFER, this.vertexBuffer);

		var vertices = [
			this.width, this.height, -1.0,
			0, this.height, -1.0,
			this.width, -0, -1.0,
			-0, -0, -1.0
		]

		this.game.context.bufferData(this.game.context.ARRAY_BUFFER, new Float32Array(vertices), this.game.context.STATIC_DRAW);
		this.vertexBuffer.itemSize = 3;
		this.vertexBuffer.numItems = 4;
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

Object.assign(XEngine.Rect.prototype, XEngine.Rect.prototypeExtends);