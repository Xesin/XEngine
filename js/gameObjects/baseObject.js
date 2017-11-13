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

	_this.vertexBuffer = game.context.createBuffer();

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
	_renderToCanvas: function (canvas) { //Como cada objeto se renderiza distinto, en cada uno se implementa este método según la necesidad

	},

	/**
	 * Aplica la rotación del objeto al canvas
	 * @method XEngine.BaseObject#applyRotationAndPos
	 * 
	 * @param {CanvasRenderingContext2D} canvas - contexto 2D de canvas al que se le aplica la rotación
	 * @private
	 */
	applyRotationAndPos: function (canvas) { //Aplica, al canvas, la rotación y posición del objeto para que se renderice como toca
		var _this = this;
		var pos = new XEngine.Vector(0, 0);
		if (_this.isometric) {
			pos = XEngine.Vector.cartToIsoCoord(_this.getWorldPos());
		}
		else {
			pos = _this.getWorldPos();
		}
		if (_this.fixedToCamera) {
			canvas.translate(pos.x, pos.y);
		}
		else {
			canvas.translate(pos.x - this.game.camera.position.x, pos.y - this.game.camera.position.y);
		}
		canvas.rotate(this.getTotalRotation() * Math.PI / 180);
		canvas.scale(this.scale.x, this.scale.y);
	}
};