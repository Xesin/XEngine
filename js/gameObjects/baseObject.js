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

	_this._vertices = [];

	_this._vertColors = [
		1.0, 1.0, 1.0, 1.0,
		1.0, 1.0, 1.0, 1.0,
		1.0, 1.0, 1.0, 1.0,
		1.0, 1.0, 1.0, 1.0
	  ];

	_this._uv = [
		0.0, 0.0,
		0.0, 1.0,
		1.0, 0.0,
		1.0, 1.0,
	];

	_this.vertexBuffer = game.context.createBuffer();
	_this.verColorBuffer = game.context.createBuffer();
	_this.uvBuffer = game.context.createBuffer();

	this.mvMatrix = mat4.create();
	
	mat4.identity(this.mvMatrix);
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
		if(!this.shader.compiled){
			this.shader.initializeShader(this.game.context);
		}
		this.game.context.useProgram(this.shader.shaderProgram);
		this._setVertices(this.width, this.height);
		this._setBuffers();
	},

	_setBuffers: function(){
		this.game.context.useProgram(this.shader.shaderProgram);
		this.game.context.bindBuffer(this.game.context.ARRAY_BUFFER, this.vertexBuffer);
		this.game.context.bufferData(this.game.context.ARRAY_BUFFER, new Float32Array(this._vertices), this.game.context.STATIC_DRAW);
		this.vertexBuffer.itemSize = 3;
		this.vertexBuffer.numItems = 4;


		this.game.context.bindBuffer(this.game.context.ARRAY_BUFFER, this.verColorBuffer)
		this.game.context.bufferData(this.game.context.ARRAY_BUFFER, new Float32Array(this._vertColors), this.game.context.STATIC_DRAW);
		this.verColorBuffer.itemSize = 4;
		this.verColorBuffer.numItems = 4;

		this.game.context.bindBuffer(this.game.context.ARRAY_BUFFER, this.uvBuffer);
		this.game.context.bufferData(this.game.context.ARRAY_BUFFER, new Float32Array(this._uv), this.game.context.STATIC_DRAW);
		this.uvBuffer.itemSize = 2;
		this.uvBuffer.numItems = 4;
	},

	_setVertices: function(width, height){
		this._vertices = [
			0, 0, -1.0,
			-0, this.height, -1.0,
			this.width, -0, -1.0,
			this.width, this.height, -1.0,
		]
		this.game.context.bindBuffer(this.game.context.ARRAY_BUFFER, this.vertexBuffer);
		this.game.context.bufferData(this.game.context.ARRAY_BUFFER, new Float32Array(this._vertices), this.game.context.STATIC_DRAW);
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

	/**
	 * Devuelve la rotación total del objeto (tiene en cuenta la rotación de los padres)
	 * @method XEngine.BaseObject#getWorldPos
	 * 
	 * @return {Number}
	 * @public
	 */
	getTotalRotation: function () { //Obtiene la rotación teniendo en cuenta la rotación de los padres
		var parentRot = this.parent.getTotalRotation();
		return parentRot + this.rotation;
	},

	/**
	 * Renderiza el objeto en el canvas
	 * @method XEngine.BaseObject#_renderToCanvas
	 * 
	 * @param {CanvasRenderingContext2D} canvas - contexto 2D de canvas en el que pintar
	 * @private
	 */
	_renderToCanvas: function (context) { //Como cada objeto se renderiza distinto, en cada uno se implementa este método según la necesidad
		if(this.shader == null) return;
		this.shader._beginRender(context);
		mat4.identity(this.mvMatrix);
		var posX = Math.round(-(this.width * this.anchor.x));
		var posY = Math.round(-(this.height * this.anchor.y));
		mat4.translate(this.mvMatrix, this.mvMatrix, [this.position.x, this.position.y, 0.0]);
		mat4.rotateZ(this.mvMatrix, this.mvMatrix, this.rotation * Math.PI / 180);
		mat4.scale(this.mvMatrix, this.mvMatrix, [this.scale.x, this.scale.y, 1.0]);
		mat4.translate(this.mvMatrix, this.mvMatrix, [posX, posY, 0.0]);
		this.shader.baseUniforms.mvMatrix.value = this.mvMatrix;
		this.shader.baseUniforms.pMatrix.value = this.game.camera.pMatrix;
		this.shader.updateUniforms(context);

		if(this.width !== this._prevWidth || this.height !== this._prevHeight){
			this._prevWidth = this.width;
			this._prevHeight = this.height;
			this._setVertices(this.width, this.height);
		}

		context.bindBuffer(context.ARRAY_BUFFER, this.vertexBuffer);

		context.vertexAttribPointer(this.shader.vertPostAtt, this.vertexBuffer.itemSize, context.FLOAT, false, 0, 0);

		context.bindBuffer(context.ARRAY_BUFFER, this.verColorBuffer);
		
		context.vertexAttribPointer(this.shader.vertColAtt, this.verColorBuffer.itemSize, context.FLOAT, false, 0, 0);

		context.bindBuffer(context.ARRAY_BUFFER, this.uvBuffer);

		context.vertexAttribPointer(this.shader.vertUvAtt, this.uvBuffer.itemSize, context.FLOAT, false, 0, 0);

		context.drawArrays(context.TRIANGLE_STRIP, 0, this.vertexBuffer.numItems);
	},

	setColor:function(r, g, b, a = 1.0){
		context.useProgram(this.shader.shaderProgram);
		this._vertColors = [
			r, g, b, a,
			r, g, b, a,
			r, g, b, a,
			r, g, b, a
		  ];
		this.game.context.bindBuffer(this.game.context.ARRAY_BUFFER, this.verColorBuffer)
		this.game.context.bufferData(this.game.context.ARRAY_BUFFER, new Float32Array(this._vertColors), this.game.context.STATIC_DRAW);
	}
};