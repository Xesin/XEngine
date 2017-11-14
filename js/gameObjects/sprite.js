/**
 * Objeto que pinta una imagen y que puede tener un physic body
 * 
 * @class XEngine.Sprite
 * @extends XEngine.BaseObject
 * @constructor
 * 
 * @param {XEngine.Game} game - referencia el objeto del juego
 * @param {Number} posX - posiciÃ³n en x
 * @param {Number} posY - posiciÃ³n en y
 * @param {String} sprite - nombre del sprite guardado en cache
 */
XEngine.Sprite = function (game, posX, posY, sprite) {
	XEngine.BaseObject.call(this, game);
	var _this = this;
	_this.sprite = sprite;
	_this.game = game; //guardamos una referencia al juego
	_this.frame = 0;
	var cache_image = _this.game.cache.image(sprite);
	//if (cache_image.type == "sprite") {
		_this.width = cache_image.frameWidth || 10; //Si la imagen no se ha cargado bien, ponemos valor por defecto
		_this.height = cache_image.frameHeight || 10;
		_this._columns = Math.floor(cache_image.image.width / _this.width);
		_this._rows = Math.floor(cache_image.image.height / _this.height);
	/*}
	else {
		_this.json = _this.game.cache.getJson(sprite);
		var frameInfo = _this.json.frames[_this.frame];
		_this.width = frameInfo.frame.w;
		_this.height = frameInfo.frame.h;
	}*/
	_this.position.setTo(posX, posY);
	_this.shader = XEngine.ShaderLib.Sprite.shader;
	_this.animation = new XEngine.AnimationManager(game, this);
};

XEngine.Sprite.prototype = Object.create(XEngine.BaseObject.prototype);

XEngine.Sprite.prototypeExtends = {
	_renderToCanvas: function (context) { //Como cada objeto se renderiza distinto, en cada uno se implementa este método según la necesidad
		if(this.shader == null) return;
		var _this = this;
		var cache_image = _this.game.cache.image(_this.sprite); //Obtenemos la imagen a renderizar
		_this.shader._setTexture(cache_image._texture);
		_this.shader._beginRender(context);
		
		mat4.identity(_this.mvMatrix);
		var posX = Math.round(-(_this.width * _this.anchor.x));
		var posY = Math.round(-(_this.height * _this.anchor.y));
		mat4.translate(_this.mvMatrix, _this.mvMatrix, [_this.position.x, _this.position.y, 0.0]);
		mat4.rotateZ(_this.mvMatrix, _this.mvMatrix, _this.rotation * Math.PI / 180);
		mat4.scale(_this.mvMatrix, _this.mvMatrix, [_this.scale.x, _this.scale.y, 1.0]);
		mat4.translate(_this.mvMatrix, _this.mvMatrix, [posX, posY, 0.0]);
		_this.shader.baseUniforms.mvMatrix.value = _this.mvMatrix;
		_this.shader.baseUniforms.pMatrix.value = _this.game.camera.pMatrix;
		_this.shader.updateUniforms(context);

		if(_this.width !== _this._prevWidth || _this.height !== _this._prevHeight){
			_this._prevWidth = _this.width;
			_this._prevHeight = _this.height;
			_this._setVertices(_this.width, _this.height);
		}

		context.bindBuffer(context.ARRAY_BUFFER, _this.vertexBuffer);

		context.vertexAttribPointer(_this.shader.vertPostAtt, _this.vertexBuffer.itemSize, context.FLOAT, false, 0, 0);

		context.bindBuffer(context.ARRAY_BUFFER, _this.verColorBuffer);
		
		context.vertexAttribPointer(_this.shader.vertColAtt, _this.verColorBuffer.itemSize, context.FLOAT, false, 0, 0);

		context.bindBuffer(context.ARRAY_BUFFER, _this.uvBuffer);

		context.vertexAttribPointer(_this.shader.vertUvAtt, _this.uvBuffer.itemSize, context.FLOAT, false, 0, 0);

		context.drawArrays(context.TRIANGLE_STRIP, 0, _this.vertexBuffer.numItems);
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

	reset: function (x, y) { //Reseteamos el sprite
		this.position.x = x;
		this.position.y = y;
		this.alive = true;
		if (this.start != undefined) {
			this.start();
		}
		if (this.body) {
			this.body.velocity = new XEngine.Vector(0, 0);
		}
	},

	_updateAnims: function (deltaMillis) {
		this.animation._update(deltaMillis);
	}
};

Object.assign(XEngine.Sprite.prototype, XEngine.Sprite.prototypeExtends);