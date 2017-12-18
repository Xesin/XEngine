/**
 * @author Francisco Ferrer <xisco@xiscoferrer.com>
 * @license
 * Copyright © 2017 Francisco Ferrer Fernandez <http://www.xiscoferrer.com>
 * https://opensource.org/licenses/MIT
 */

Array.prototype.removePending = function() {
    var i = this.length;
    while (i--) {
        if (this[i].isPendingDestroy) //Si es un objeto destruido lo eliminamos del array
		{
			if (this[i].body != undefined) { //Si tiene un body, también lo destruimos
				this[i].body.destroy();
			}
			delete this[i]; //Liberamos memoria
			this.splice(i, 1);
		}
    }
};

var XEngine = {
	version: '2.0'
};


// ----------------------------------------- GAME ENGINE ------------------------------------------//

/**
 * Clase principal del juego, ésta inicia el juego y maneja su funcionamiento
 * 
 * @class XEngine.Game
 * @constructor
 * @param {Number} width - El ancho del juego
 * @param {Number} height - El alto del juego
 * @param {String} idContainer - En id del elemento canvas que está en el body del documento
 */
XEngine.Game = function (width, height, idContainer) {

	/**
	 * @property {HTMLElement} reference - Referencia al elemento canvas
	 * @readonly
	 */
	this.canvas = document.getElementById(idContainer);

	if(!this.canvas){
		this.canvas = document.body.appendChild(document.createElement("canvas"));
		this.canvas.width = width;
		this.canvas.height = height;
		this.canvas.id = idContainer;
	}

	/**
	 * @property {XEngine.Vector} position - Posición por defecto del juego
	 * @readonly
	 * @private
	 */
	this.position = new XEngine.Vector(0.0, 0.0);
	/**
	 * @property {Number} width - Ancho del juego
	 * @public
	 */
	this.width = width;
	/**
	 * @property {Number} height - Alto del juego
	 * @public
	 */
	this.height = height;
	/**
	 * @property {Number} worldWidth - Ancho del mundo (al iniciar es igual que el del juego)
	 * @public
	 */
	this.worldWidth = width;
	/**
	 * @property {Number} height - Alto del mundo (al iniciar es igual que el del juego)
	 * @public
	 */
	this.worldHeight = height;

	this.canvas.setAttribute('width', width + 'px'); //asignamos el ancho del canvas
	this.canvas.setAttribute('height', height + 'px'); //asignamos el alto del canvas

	/**
	 * @property {CanvasRenderingContext2D} canvas - Contexto 2D del canvas
	 * @readonly
	 */
	this.context;

	window.AudioContext = window.AudioContext || window.webkitAudioContext;

	/**
	 * @property {AudioContext} audioContext - Contexto del audio
	 * @readonly
	 */
	this.audioContext = new AudioContext();
	/**
	 * @property {Number} frameLimit - Limite de frames por segundo
	 * @default
	 */
	this.frameLimit = 30;
	/**
	 * @property {Number} _startTime - Tiempo tiempo en el que se arrancó el juego
	 * @readonly
	 */
	this._startTime = 0;
	/**
	 * @property {Number} _elapsedTime - Tiempo desde que se arrancó el juego
	 * @private
	 */
	this._elapsedTime = 0;
	/**
	 * @property {Number} frameTime - Tiempo en el que transcurre el frame
	 * @readonly
	 */
	this.frameTime = 0;
	/**
	 * @property {Number} previousFrameTime - Tiempo en el que transcurrió el último frame
	 * @readonly
	 */
	this.previousFrameTime = 0;
	/**
	 * @property {Number} deltaTime - Tiempo entre frames en segundos
	 * @readonly
	 */
	this.deltaTime = 0;
	/**
	 * @property {Number} deltaMillis - Tiempo entre frames en milisegundos
	 * @readonly
	 */
	this.deltaMillis = 0;

	/**
	 * @property {Bool} pause - Determina si el juego está pausado o no
	 * @public
	 */
	this.pause = false;

	/**
	 * @property {Array.<XEngine.BaseObject>} updateQueue - Array con las referencias de todos los objetos añadidos directamente al juego
	 * @readonly
	 */
	this.updateQueue = null;
	/**
	 * @property {XEngine.StateManager} state - Acceso al StateManager
	 * @readonly
	 */
	this.state = null;
	/**
	 * @property {XEngine.ObjectFactory} add - Fábrica de objetos. Esto ofrece acceso al creador de objetos
	 * @readonly
	 */
	this.add = null;
	/**
	 * @property {XEngine.Physics} physics - Motor de físicas
	 * @readonly
	 */
	this.physics = null;
	/**
	 * @property {XEngine.TweenManager} tween - Tween Manager. Da acceso a la creación de tweens.
	 * @readonly
	 */
	this.tween = null;
	/**
	 * @property {XEngine.Cache} cache - Caché del juego. Aquí se almacenan todos los assets que se cargan
	 * @readonly
	 */
	this.cache = null;
	/**
	 * @property {XEngine.Loader} load - Loader. Da acceso a la carga de assets
	 * @readonly
	 */
	this.load = null;
	/**
	 * @property {XEngine.Camera} camera - Camara del juego
	 * @readonly
	 */
	this.camera = null;
	/**
	 * @property {XEngine.Cache} renderer - Renderer del juego.
	 * @readonly
	 * @private
	 */
	this.renderer = null;
	/**
	 * @property {XEngine.ScaleManager} scale - Scale manager
	 * @readonly
	 */
	this.scale = null;
	/**
	 * @property {Bool} isMobile - Define si se está ejecutando en móvil o no
	 * @readonly
	 */
	this.isMobile = false;
	/**
	 * @property {XEngine.InputManager} input - Input manager. Da acceso al inputManager
	 * @readonly
	 */
	this.input = null;

	/**
	 * @property {Number} ISO_TILE_WIDTH - Define el ancho de los tiles (para perspectiva isometrica)
	 * @public
	 */
	this.ISO_TILE_WIDTH = 32;

	/**
	 * @property {Number} ISO_TILE_HEIGHT - Define el alto de los tiles (para perspectiva isometrica)
	 * @public
	 */
	this.ISO_TILE_HEIGHT = 32;

	this.autoCulling = false;

	this.init(); //iniciamos el juego

	XEngine.Game._ref = this;
};

XEngine.Game.prototype.constructor = XEngine.Game;

XEngine.Game.prototype = {
	/**
	 * Llamado automaticamente al crear el juego. Inicia todas las propiedades del juego y ejecuta el primer loop
	 * 
	 * @method XEngine.Game#init
	 * @private
	 */
	init: function () {
		var _this = this;
		_this._startTime = Date.now();
		_this._elapsedTime = 0;
		_this.frameTime = 0;
		_this.previousFrameTime = 0;
		_this.deltaTime = 0;
		_this.deltaMillis = 0;
		_this.updateQueue = new Array();
		_this.renderQueue = new Array();
		_this.pause = false;
		_this.state = new XEngine.StateManager(_this);
		_this.add = new XEngine.ObjectFactory(_this);
		_this.physics = new XEngine.Physics(_this);
		_this.tween = new XEngine.TweenManager(_this);
		_this.cache = new XEngine.Cache(_this);
		_this.load = new XEngine.Loader(_this);
		_this.camera = new XEngine.Camera(_this, _this.width, _this.height);
		_this.renderer = new XEngine.Renderer(_this, _this.canvas);
		_this.context = _this.renderer.context;
		_this.scale = new XEngine.ScaleManager(_this);
		_this.scale.init();
		_this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent); //Obtiene si se está ejecutando en un dispositivo móvil
		_this.input = new XEngine.InputManager(_this);
		console.log('Game engine ' + XEngine.version + ' arrancado con webgl!!!');
		this.update(); //Iniciamos el loop
	},

	/**
	 * Asigna el color de background del canvas
	 * 
	 * @method XEngine.Game#setBackgroundColor
	 * @param {String} color - El color a poner de fondo
	 */
	setBackgroundColor: function (r, g, b, a) {
		//this.canvas.style.backgroundColor = color;
		this.renderer.setClearColor(r/255, g/255, b/255, a/255);
	},

	/**
	 * Llamado automaticamente en cada frame
	 * 
	 * @method XEngine.Game#update
	 * @private
	 */
	update: function () {
		var _this = this;
		if (window.requestAnimationFrame) {
			window.requestAnimationFrame(function(){_this.update()});
		}
		else {
			clearTimeout(_this.timer); //limpiamos el timer para que no se quede en memoria
			_this.timer = setTimeout(XEngine.Game._updateCaller, _this.frameLimit / 1);
		}

		_this.elapsedTime = Date.now() - _this._startTime; //tiempo transcurrido desde que se creó el juego
		_this.frameTime = _this.elapsedTime; //tiempo en el que transcurre este frame
		_this.deltaMillis = Math.min(400, (_this.frameTime - _this.previousFrameTime)); //tiempo entre frames (en milisegundos)
		_this.deltaTime = _this.deltaMillis / 1000; //tiempo entre frames (en segundos)
		if (1 / _this.frameLimit > _this.deltaTime) return;
		_this.previousFrameTime = _this.frameTime; //guardamos el tiempo de este frame para después calcular el delta time
		if (_this.pause) return;
		if (_this.state.currentState == null) return; //Si no hay arrancado ningún estado, saltamos el update
		if (!this.load.preloading) { //Si no estamos precargando los assets, ejecutamos el update
			_this.updateQueue.removePending();
			_this.tween._update(_this.deltaMillis); //Actualizamos el tween manager
			for (var i = _this.updateQueue.length - 1; i >= 0; i--) //Recorremos los objetos del juego para hacer su update
			{
				var gameObject = _this.updateQueue[i];
				if (gameObject.alive) //En caso contrario miramos si contiene el método update y está vivo, lo ejecutamos
				{
					gameObject.update(_this.deltaTime);
					if (XEngine.Sprite.prototype.isPrototypeOf(gameObject)) {
						gameObject._updateAnims(_this.deltaMillis);
					}
				}
			}
			_this.state.currentState.update(_this.deltaTime); //Llamamos al update del estado actual
			_this.camera.update(_this.deltaTime); //Actualizamos la cámara

			if (_this.physics.systemEnabled) {
				_this.physics.update(_this.deltaTime); //Actualizamos el motor de físicas
				_this.state.currentState.physicsUpdate();
			} //Llamamos al handler de condición de fin;
			_this.renderQueue.removePending();
			_this.renderer.render(); //Renderizamos la escena
		}
		
	},

	/**
	 * Se llama cuando se inicia un nuevo estado
	 * 
	 * @method XEngine.Game#destroy
	 * @private
	 */
	destroy: function () { //Este paso se llama cuando se cambia de un estado a otro
		for (var i = this.updateQueue.length - 1; i >= 0; i--) //Destruimos todos los objetos del juego
		{
			var gameObject = this.updateQueue[i];
			if (!gameObject.persist) {
				gameObject.destroy();
				if (gameObject.body != undefined) { //Si tienen un body, lo destruimos también
					gameObject.body.destroy();
				}
				this.updateQueue.splice(i, 1);
			}
			var renderIndex = this.renderQueue.indexOf(gameObject);
			if(renderIndex != -1){
				this.renderQueue.splice(renderIndex, 1);
			}
		}
		for (var i = this.renderQueue.length - 1; i >= 0; i--) //Destruimos todos los objetos del juego
		{
			var gameObject = this.renderQueue[i];
			if (!gameObject.persist) {
				gameObject.destroy();
				if (gameObject.body != undefined) { //Si tienen un body, lo destruimos también
					gameObject.body.destroy();
				}
				this.renderQueue.splice(i, 1);
			}
			
		}
		this.physics._destroy(); //Llamamos a los destroy de los distintos componentes
		this.tween._destroy();
		delete this.camera; //Liberamos la memoria de la camara para crear una nueva								
		this.camera = new XEngine.Camera(this);
	},

	/**
	 * Unicamente para que los hijos directos del estado no tengan una referencia nula a este método
	 * 
	 * @method XEngine.Game#getWorldPos
	 * @private
	 * @returns {XEngine.Vector}
	 */
	getWorldPos: function () {
		return this.position;
	},

	/**
	 * Unicamente para que los hijos directos del estado no tengan una referencia nula a este método
	 * 
	 * @method XEngine.Game#getWorldMatrix
	 * @private
	 * @returns {XEngine.Vector}
	 */
	getWorldMatrix: function (childMatrix) {
		mat4.identity(childMatrix);
	},


	/**
	 * Unicamente para que los hijos directos del estado no tengan una referencia nula a este método
	 * 
	 * @method XEngine.Game#getTotalRotation
	 * @private
	 * @returns {Number}
	 */
	getTotalRotation: function () {
		return 0;
	}
};
