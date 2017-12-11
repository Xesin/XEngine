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
	_this.shader = null;

	_this._vertDataBuffer = new XEngine.DataBuffer(24 * 4);

	_this._uv = [
		0.0, 0.0,
		0.0, 1.0,
		1.0, 0.0,
		1.0, 1.0,
	];

	_this._uvDataBuffer = new XEngine.DataBuffer(8 * 4);

	_this.vertexBuffer = game.context.createBuffer();
	_this.uvBuffer = game.context.createBuffer();

	_this.mask = null;

	this.mvMatrix = mat4.create();
	
	mat4.identity(this.mvMatrix);

	_this.pickeable = false;
	_this.downPos = new XEngine.Vector(0,0);
	_this.posWhenDown = new XEngine.Vector(0,0);
	_this.color = [1.0,1.0,1.0,1.0];
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
		this.game.context.useProgram(this.shader.shaderProgram);
		this.vertexBuffer.itemSize = 3 + 4;
		this.vertexBuffer.numItems = 4;
		this._setVertices(this.width, this.height, this.color);
		this._setUVs(this._uv);
		this.uvBuffer.itemSize = 2;
		this.uvBuffer.numItems = 4;
	},

	setColor: function(r,g,b,a = 1.0){
		this.color[0] = r;
		this.color[1] = g;
		this.color[2] = b;
		this.color[3] = a;
		this._setVertices(this.width, this.height, this.color);
	},

	_setVertices: function(width, height, color){
		var floatBuffer = this._vertDataBuffer.floatView;
		var index = 0;
		floatBuffer[index++] = 0.0;
		floatBuffer[index++] = 0.0;
		floatBuffer[index++] = color[0];
		floatBuffer[index++] = color[1];
		floatBuffer[index++] = color[2];
		floatBuffer[index++] = color[3];

		floatBuffer[index++] = 0.0;
		floatBuffer[index++] = height;
		floatBuffer[index++] = color[0];
		floatBuffer[index++] = color[1];
		floatBuffer[index++] = color[2];
		floatBuffer[index++] = color[3];

		floatBuffer[index++] = width;
		floatBuffer[index++] = 0.0;
		floatBuffer[index++] = color[0];
		floatBuffer[index++] = color[1];
		floatBuffer[index++] = color[2];
		floatBuffer[index++] = color[3];

		floatBuffer[index++] =width;
		floatBuffer[index++] = height;
		floatBuffer[index++] = color[0];
		floatBuffer[index++] = color[1];
		floatBuffer[index++] = color[2];
		floatBuffer[index++] = color[3];

		this.game.context.bindBuffer(this.game.context.ARRAY_BUFFER, this.vertexBuffer);
		this.game.context.bufferData(this.game.context.ARRAY_BUFFER, floatBuffer, this.game.context.STATIC_DRAW);
	},

	_setUVs: function(uvs){
		this._uv = uvs;
		var floatBuffer = this._uvDataBuffer.floatView;
		floatBuffer[0] = uvs[0];
		floatBuffer[1] = uvs[1];
		floatBuffer[2] = uvs[2];
		floatBuffer[3] = uvs[3];
		floatBuffer[4] = uvs[4];
		floatBuffer[5] = uvs[5];
		floatBuffer[6] = uvs[6];
		floatBuffer[7] = uvs[7];
		this.game.context.bindBuffer(this.game.context.ARRAY_BUFFER, this.uvBuffer);
		this.game.context.bufferData(this.game.context.ARRAY_BUFFER, floatBuffer, this.game.context.STATIC_DRAW);
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
		//mat4.translate(childMatrix, childMatrix, [posX, posY, 0.0]);
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
		return {
			x: x,
			y: y
		};
	},

	_beginRender:function(context){
		if(this.shader)
			this.shader._beginRender(context);
		if(this.mask != null){
			// disable color (u can also disable here the depth buffers)
			context.colorMask(false, false, false, false);
		
			// Replacing the values at the stencil buffer to 1 on every pixel we draw
			context.stencilFunc(context.ALWAYS, 1, 1);
			context.stencilOp(context.REPLACE, context.REPLACE, context.REPLACE);
		
			context.enable(context.STENCIL_TEST);
		
			this.mask._renderToCanvas(context);
		
			// Telling the stencil now to draw/keep only pixels that equals 1 - which we set earlier
			context.stencilFunc(context.EQUAL, 1, 1);
			context.stencilOp(context.ZERO, context.ZERO, context.ZERO);
			// enabling back the color buffer
			context.colorMask(true, true, true, true);
		}
	},

	/**
	 * Renderiza el objeto en el canvas
	 * @method XEngine.BaseObject#_renderToCanvas
	 * 
	 * @param {CanvasRenderingContext2D} canvas - contexto 2D de canvas en el que pintar
	 * @private
	 */
	_renderToCanvas: function (context) { //Como cada objeto se renderiza distinto, en cada uno se implementa este método según la necesidad
		this.getWorldMatrix(this.mvMatrix);
		this.shader.baseUniforms.mvMatrix.value = this.mvMatrix;
		this.shader.baseUniforms.pMatrix.value = this.game.camera.pMatrix;
		this.shader.updateUniforms(context);

		if(this.width !== this._prevWidth || this.height !== this._prevHeight){
			this._prevWidth = this.width;
			this._prevHeight = this.height;
			this._setVertices(this.width, this.height, this.color);
		}

		context.bindBuffer(context.ARRAY_BUFFER, this.vertexBuffer);

		context.vertexAttribPointer(this.shader.vertPostAtt, 3, context.FLOAT, false, 24, 0);		
		context.vertexAttribPointer(this.shader.vertColAtt, 4, context.FLOAT, false, 24, 8);

		context.bindBuffer(context.ARRAY_BUFFER, this.uvBuffer);

		context.vertexAttribPointer(this.shader.vertUvAtt, this.uvBuffer.itemSize, context.FLOAT, false, 0, 0);

		context.drawArrays(context.TRIANGLE_STRIP, 0, this.vertexBuffer.numItems);
	},

	_endRender(context){
		if(this.mask != null){
			context.disable(context.STENCIL_TEST);
			context.clear(context.STENCIL_BUFFER_BIT);
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