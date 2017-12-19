/**
 * Objeto Básico del juego, todos los demás objetos que están en el juego heredan de este (Excepto el Audio)
 * 
 * @class XEngine.BaseObject
 * @constructor
 * 
 * @param {XEngine.Game} game - referencia el objeto del juego
 */
XEngine.BaseObject = function (game) { //De este objeto parten todos los objetos que se pueden poner en el juego
	var _this = this;
	_this.game = game; //Referencia al juego
	_this.parent = game;
	/**
	 * @property {Boolean} isPendingDestroy - determina si el objeto va a ser destruido en el siguiente frame
	 * @readonly
	 */
	_this.isPendingDestroy = false;
	/**
	 * @property {Boolean} alive - determina si el está vivo. En caso de que no lo esté, no se renderiza
	 * @readonly
	 */
	_this.alive = true;
	/**
	 * @property {Number} alpha - Ajusta el alpha con el que se pinta el objeto. 1 es opaco y 0 es transparente
	 * @public
	 */
	_this.alpha = 1.0;
	/**
	 * @property {XEngine.Vector} scale - Scala del objeto. 1 quiere decir que no se escala
	 * @public
	 */
	_this.scale = new XEngine.Vector(1, 1);
	/**
	 * @property {XEngine.Vector} anchor - Punto de anclaje. (0,0) = Arriba a la izquierda, (0,1) = Arriba a la derecha
	 * @public
	 */
	_this.anchor = new XEngine.Vector(0, 0); //Ancla del objeto (0,0) = Arriba a la izquierda
	/**
	 * @property {Number} rotation - Rotación (en grados) que tiene el objeto.
	 * @public
	 */
	_this.rotation = 0;
	/**
	 * @property {XEngine.Vector} position - Posición local del objeto
	 * @public
	 */
	_this.position = new XEngine.Vector(0, 0);
	/**
	 * @property {XEngine.Signal} onClick - Evento de click que se llama al hacer click sobre el objeto
	 * @reandonly
	 */
	_this.onClick = new XEngine.Signal();
	/**
	 * @property {XEngine.Signal} onClick - Evento de input down
	 * @reandonly
	 */
	_this.onInputDown = new XEngine.Signal();
	/**
	 * @property {XEngine.Signal} onClick - Evento de input up
	 * @reandonly
	 */
	_this.onInputUp = new XEngine.Signal();
	/**
	 * @property {XEngine.Signal} onClick - Evento de input over
	 * @reandonly
	 */
	_this.onInputOver = new XEngine.Signal();
	/**
	 * @property {XEngine.Signal} onClick - Evento de input left
	 * @reandonly
	 */
	_this.onInputLeft = new XEngine.Signal();
	/**
	 * @property {Boolean} inputEnabled - determina si el objeto tiene que recibir input
	 * @public
	 */
	_this.inputEnabled = false;
	/**
	 * @property {Boolean} render - determina si el objeto se tiene que renderizar
	 * @public
	 */
	_this.render = true;
	/**
	 * @property {Boolean} render - determina si el objeto está fijo en la cámara
	 * @public
	 */
	_this.fixedToCamera = false;
	/**
	 * @property {Boolean} render - determina si el objeto tiene que estár dentro de coordenadas isometricas
	 * @public
	 */
	_this.isometric = false;
	/**
	 * @property {Boolean} isInputDown - determina si el objeto está siendo apretado
	 * @private
	 */
	_this.isInputDown = false;

	_this.width = 0;
	_this.height = 0;
	_this._prevWidth = 0;
	_this._prevHeight = 0;
	_this._prevPos = {x: 0, y: 0}
	_this.shader = null;

	_this._vertDataBuffer = new XEngine.DataBuffer(24 * 4);

	_this._uv = [
		0.0, 0.0,
		0.0, 1.0,
		1.0, 0.0,
		1.0, 1.0,
	];

	var gl = this.game.context;

	var indexDataBuffer = new XEngine.DataBuffer16(2 * 6);
	_this.vertexBuffer = this.game.renderer.resourceManager.createBuffer(gl.ARRAY_BUFFER, _this._vertDataBuffer.getByteCapacity(), gl.STREAM_DRAW);
	_this.indexBuffer = this.game.renderer.resourceManager.createBuffer(gl.ELEMENT_ARRAY_BUFFER, _this._vertDataBuffer.getByteCapacity(), gl.STATIC_DRAW);
	var indexBuffer = indexDataBuffer.uintView;
	for (var indexA = 0, indexB = 0; indexA < 6; indexA += 6, indexB += 4)
	{
		indexBuffer[indexA + 0] = indexB + 0;
		indexBuffer[indexA + 1] = indexB + 1;
		indexBuffer[indexA + 2] = indexB + 2;
		indexBuffer[indexA + 3] = indexB + 1;
		indexBuffer[indexA + 4] = indexB + 3;
		indexBuffer[indexA + 5] = indexB + 2;
	}

	_this.indexBuffer.updateResource(indexBuffer, 0);

	_this.uvBuffer =new XEngine.VertexBuffer(game.context, game.context.createBuffer());

	_this.mask = null;

	this.mvMatrix = mat4.create();
	
	mat4.identity(this.mvMatrix);

	_this.pickeable = false;
	_this.downPos = new XEngine.Vector(0,0);
	_this.posWhenDown = new XEngine.Vector(0,0);
	_this.color = [(0xffffff >> 16) + (0xffffff & 0xff00) + ((0xffffff & 0xff) << 16)];
};

XEngine.BaseObject.prototype = {
	
	/**
	 * Destruye el objeto
	 * @method XEngine.BaseObject#destroy
	 * 
	 * @public
	 */
	destroy: function () {
		this.kill();
		this.isPendingDestroy = true;
		if (this.onDestroy != undefined) {
			this.onDestroy();
		}
	},

	_onInitialize: function(){
		if(this.shader){
			if(!this.shader.compiled){
				this.shader.initializeShader(this.game.context);
			}
			this._setBuffers();
		}
	},

	_setBuffers: function(){
		var context = this.game.context;
		context.useProgram(this.shader.shaderProgram);
		this.vertexBuffer.addAttribute(this.shader.vertPostAtt, 2, context.FLOAT, false, 24, 0);
		this.vertexBuffer.addAttribute(this.shader.vertUvAtt, 2, context.FLOAT, false, 24, 8);
		this.vertexBuffer.addAttribute(this.shader.vertColAtt, 3, context.UNSIGNED_BYTE, true, 24, 16);
		this.vertexBuffer.addAttribute(this.shader.vertAlphaAtt, 1, context.FLOAT, false, 24, 20);
	},

	setColor: function(value, a = 1.0){
		this.color = value;
		this.alpha = a;
		this._setVertices(this.width, this.height, this.color, this._uv);
	},

	_setVertices: function(width, height, color, uv){
		var floatBuffer = this._vertDataBuffer.floatView;
		var uintBuffer = this._vertDataBuffer.uintView;
		var index = 0;
		var pos = new XEngine.Vector(0, 0);
		this.getWorldMatrix(this.mvMatrix);
		pos = pos.multiplyMatrix(this.mvMatrix);		
		
		floatBuffer[index++] = pos.x;
		floatBuffer[index++] = pos.y;
		floatBuffer[index++] = uv[0];
		floatBuffer[index++] = uv[1];
		uintBuffer[index++] = color;
		floatBuffer[index++] = this.alpha;

		pos.setTo(0, this.height);
		pos = pos.multiplyMatrix(this.mvMatrix);

		floatBuffer[index++] = pos.x;
		floatBuffer[index++] = pos.y;
		floatBuffer[index++] = uv[2];
		floatBuffer[index++] = uv[3];
		uintBuffer[index++] = color;
		floatBuffer[index++] = this.alpha;

		pos.setTo(this.width, 0);
		pos = pos.multiplyMatrix(this.mvMatrix);

		floatBuffer[index++] = pos.x;
		floatBuffer[index++] = pos.y;
		floatBuffer[index++] = uv[4];
		floatBuffer[index++] = uv[5];
		uintBuffer[index++] = color;
		floatBuffer[index++] = this.alpha;

		pos.setTo(this.width, this.height);
		pos = pos.multiplyMatrix(this.mvMatrix);

		floatBuffer[index++] = pos.x;
		floatBuffer[index++] = pos.y;
		floatBuffer[index++] = uv[6];
		floatBuffer[index++] = uv[7];
		uintBuffer[index++] = color;
		floatBuffer[index++] = this.alpha;

		this.vertexBuffer.updateResource(floatBuffer, 0);
	},

	/**
	 * Mata el objeto pero no deja de existir en el juego (se puede "revivir")
	 * @method XEngine.BaseObject#kill
	 * 
	 * @public
	 */
	kill: function () {
		this.alive = false;
	},

	/**
	 * Devuelve este objeto al juego.
	 * @method XEngine.BaseObject#restore
	 * 
	 * @param {Number} posX - nueva posición en la coordenada X
	 * @param {Number} posY - nueva posición en la coordenada Y
	 * @public
	 */
	restore: function (posX, posY) {
		this.position.x = posX;
		this.position.x = posY;
		this.alive = true;
	},

	/**
	 * Devuelve el matrix de transormacion del objeto en coordenadas del mundo (tiene en cuenta la posición de los padres)
	 * @method XEngine.BaseObject#getWorldMatrix
	 * 
	 * @return {Number}
	 * @public
	 */
	getWorldMatrix: function (childMatrix) { //Obtiene la posición del objeto en el mundo teniendo en cuenta la posición local y la posición del mundo del padre
		var _this = this;
		_this.parent.getWorldMatrix(childMatrix);
		var translation = [this.position.x, this.position.y, 0.0];
		var posX = Math.round(-(this.width * this.anchor.x));
		var posY = Math.round(-(this.height * this.anchor.y));
		if(this.fixedToCamera){
			translation[0] += this.game.camera.position.x;
			translation[1] += this.game.camera.position.y;
		}
		mat4.translate(childMatrix, childMatrix, translation);
		mat4.rotateZ(childMatrix, childMatrix, this.rotation * XEngine.Mathf.TO_RADIANS);
		mat4.scale(childMatrix, childMatrix, [this.scale.x, this.scale.y, 1.0]);
		mat4.translate(childMatrix, childMatrix, [posX, posY, 0.0]);
		return childMatrix;
	},

	/**
	 * Devuelve la posición del objeto en coordenadas del mundo (tiene en cuenta la posición de los padres)
	 * @method XEngine.BaseObject#getWorldPos
	 * 
	 * @return {Number}
	 * @public
	 */
	getWorldPos: function () { //Obtiene la posición del objeto en el mundo teniendo en cuenta la posición local y la posición del mundo del padre
		var _this = this;
		var parentPos = _this.parent.getWorldPos();
		var x = _this.position.x + parentPos.x;
		var y = _this.position.y + parentPos.y;
		return new XEngine.Vector(x, y);
	},

	_beginRender:function(context){
		if(this.shader)
			this.shader._beginRender(context);
	},

	/**
	 * Renderiza el objeto en el canvas
	 * @method XEngine.BaseObject#_renderToCanvas
	 * 
	 * @param {CanvasRenderingContext2D} canvas - contexto 2D de canvas en el que pintar
	 * @private
	 */
	_renderToCanvas: function (context) { //Como cada objeto se renderiza distinto, en cada uno se implementa este método según la necesidad
		this.shader.baseUniforms.pMatrix.value = this.game.camera.pMatrix;
		this.shader.updateUniforms(context);

		if(this._prevHeight != this.height || this._prevWidth != this.width || this._prevPos.x != this.position.x || this._prevPos.y != this.position.y){
			this._setVertices(this.width, this.height, this.color, this._uv);
			this._prevHeight = this.height;
			this._prevWidth = this.width;
			this._prevPos.x = this.position.x;
			this._prevPos.y = this.position.y;
		}
		
		
		this.vertexBuffer.bind();
		this.indexBuffer.bind();

		context.drawElements(context.TRIANGLES, 6, context.UNSIGNED_SHORT, 0);
	},

	rendermask:function(gl){
		// disable color (u can also disable here the depth buffers)
		gl.colorMask(false, false, false, false);
		
		// Replacing the values at the stencil buffer to 1 on every pixel we draw
		gl.stencilFunc(gl.ALWAYS, 1, 1);
		gl.stencilOp(gl.REPLACE, gl.REPLACE, gl.REPLACE);
	
		gl.enable(gl.STENCIL_TEST);
		if(this.sprite){
			var cache_image = this.game.cache.image(this.sprite); //Obtenemos la imagen a renderizar
			this.shader._setTexture(cache_image._texture);
		}		
		this.shader._beginRender(gl);
		
		this.shader.baseUniforms.pMatrix.value = this.game.camera.pMatrix;
		this.shader.updateUniforms(gl);
		
		this._setVertices(this.width, this.height, this.color, this._uv);		
		
		this.vertexBuffer.bind();
		this.indexBuffer.bind();
		
		gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
		// enabling back the color buffer
		// Telling the stencil now to draw/keep only pixels that equals 1 - which we set earlier
		gl.stencilFunc(gl.EQUAL, 1, 1);
		gl.stencilOp(gl.ZERO, gl.ZERO, gl.ZERO);
		gl.colorMask(true, true, true, true);
		
	},

	endRendermask:function(gl){
		gl.disable(gl.STENCIL_TEST);
		gl.clear(gl.STENCIL_BUFFER_BIT);
	},

	_endRender:function(context){
		if(this.mask != null){
			
		}
	},

	getBounds: function () {
		var _this = this;
		var width = _this.width * _this.scale.x;
		var height = _this.height * _this.scale.y;
		var worldPos = this.getWorldPos();
		var widthAnchor = width * _this.anchor.x;
		var heightAnchor = height * _this.anchor.y;
		var minX = worldPos.x - widthAnchor;
		var maxX = worldPos.x + width - widthAnchor;
		var minY = worldPos.y - heightAnchor;
		var maxY = worldPos.y + height - heightAnchor;
		return {
			width: width,
			height: height,
			minX: minX,
			maxX: maxX,
			minY: minY,
			maxY: maxY,
		};
	},

	isInsideCamera: function(){
		var bounds = this.getBounds();
		var worldPos = this.getWorldPos();
		var cameraPos = this.game.camera.position;
		var viewRect = {width: this.game.width, height: this.game.height};
		if(bounds.maxX < cameraPos.x) return false;
		if(bounds.maxY < cameraPos.y) return false;
		if(bounds.minX > cameraPos.x + viewRect.width) return false;
		if(bounds.minY > cameraPos.y + viewRect.height) return false;

		return true;
	},

	update:function(deltaTime){}
};