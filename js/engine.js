/**
 * @author Francisco Ferrer <xisco@xiscoferrer.com>
 * @license
 * Copyright © 2017 Francisco Ferrer Fernandez <http://www.xiscoferrer.com>
 * https://opensource.org/licenses/MIT
 */


var XEngine = {
	version: '1.0'
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
	/**
	 * @property {XEngine.Vector} position - Posición por defecto del juego
	 * @readonly
	 * @private
	 */
	this.position = new XEngine.Vector(0, 0);
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
	 * @property {Array.<XEngine.BaseObject>} gameObjects - Array con las referencias de todos los objetos añadidos directamente al juego
	 * @readonly
	 */
	this.gameObjects = null;
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

	this.init(); //iniciamos el juego

	XEngine.Game._ref = this;
};

XEngine.Game.prototype.constructor = XEngine.Game;

XEngine.Game._updateCaller = function () {
	XEngine.Game._ref.update();
};

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
		_this.gameObjects = new Array();
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
		initShaders(_this.context);
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
	setBackgroundColor: function (color) {
		//this.canvas.style.backgroundColor = color;
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
			window.requestAnimationFrame(XEngine.Game._updateCaller);
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
			for (var i = _this.gameObjects.length - 1; i >= 0; i--) //Recorremos los objetos del juego para hacer su update
			{
				var gameObject = _this.gameObjects[i];
				if (gameObject.isPendingDestroy) //Si es un objeto destruido lo eliminamos del array
				{
					if (gameObject.body != undefined) { //Si tiene un body, también lo destruimos
						gameObject.body.destroy();
						delete _this.gameObjects[i].body; //Liberamos memoria
					}
					delete _this.gameObjects[i]; //Liberamos memoria
					_this.gameObjects.splice(i, 1);
				}
				else if (gameObject.alive) //En caso contrario miramos si contiene el método update y está vivo, lo ejecutamos
				{
					if (gameObject.update != undefined) {
						gameObject.update(_this.deltaTime);
					}
					if (XEngine.Sprite.prototype.isPrototypeOf(gameObject)) {
						gameObject._updateAnims(_this.deltaMillis);
					}
				}
			}

			if (_this.state.currentState.update != undefined) {
				_this.state.currentState.update(_this.deltaTime); //Llamamos al update del estado actual
			}

			_this.camera.update(_this.deltaTime); //Actualizamos la cámara
			_this.tween._update(_this.deltaMillis); //Actualizamos el tween manager

			if (_this.physics.systemEnabled) {
				_this.physics.update(_this.deltaTime); //Actualizamos el motor de físicas
				if (_this.state.currentState.physicsUpdate != undefined) {
					_this.state.currentState.physicsUpdate();
				}
			} //Llamamos al handler de condición de fin;
		}
		_this.renderer.render(); //Renderizamos la escena
	},

	/**
	 * Se llama cuando se inicia un nuevo estado
	 * 
	 * @method XEngine.Game#destroy
	 * @private
	 */
	destroy: function () { //Este paso se llama cuando se cambia de un estado a otro
		for (var i = this.gameObjects.length - 1; i >= 0; i--) //Destruimos todos los objetos del juego
		{
			var gameObject = this.gameObjects[i];
			if (gameObject.destroy != undefined) {
				if (!gameObject.persist) {
					gameObject.destroy();
					if (gameObject.body != undefined) { //Si tienen un body, lo destruimos también
						gameObject.body.destroy();
						delete this.gameObjects[i].body; //Liberamos memoria
					}
					delete this.gameObjects[i]; //Liberamos memoria
					this.gameObjects.splice(i, 1);
				}
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
	 * @method XEngine.Game#getTotalRotation
	 * @private
	 * @returns {Number}
	 */
	getTotalRotation: function () {
		return 0;
	}
};

// ----------------------------------------- CAMERA ------------------------------------------//

/**
* Definicion de Ejes para la camara
*
* @class XEngine.AXIS
*/
XEngine.AXIS = {
	/** @static */
	NONE: "none",
	/** @static */
	HORIZONTAL: "horizontal",
	/** @static */
	VERTICAL: "vertical",
	/** @static */
	BOTH: "both"
};
/**
 * Objeto de cámara. Se usa para saber qué se debe renderizar y dónde se ubica en pantalla
 * 
 * @class XEngine.Camera
 * @constructor
 * @param {XEngine.Game} game - Referencia al juego
 */
XEngine.Camera = function (game) {
	/**
	 * @property {XEngine.Game} game - Referencia al juego
	 * @readonly
	 */
	this.game = game;
	/**
	 * @property {XEngine.Vector} position - Posición actual de la camara
	 */
	this.position = new XEngine.Vector(0, 0);
	/**
	 * 
	 * @property {XEngine.BaseObject} followedObject - Objeto que tiene que seguir la camara. Si es nulo no sigue a nada (Se cambia con {@link XEngine.Camera#followObject})
	 * 
	 * @readonly
	 */
	this.followedObject = null;
	/**
	 * 
	 * 
	 * @property {XEngine.AXIS} axis - Ejes en los que se puede mover la cámara
	 */
	this.axis = XEngine.AXIS.BOTH;

	this.pMatrix = mat4.create();
	mat4.ortho(this.pMatrix, 0, game.width , game.height, 0, 0.1, 100);
};

XEngine.Camera.prototype = {
	/**
	 * Asigna el objeto que tiene que seguir la cámara
	 * @method XEngine.Camera#followObject
	 * @param {XEngine.BaseObject} gameObject - Objeto a seguir
	 * @param {Number} offsetLeft - Offset que tendrá por la izquierda
	 * @param {Number} offsetUp - Offset que tendrá por arriba
	 * @public
	 */
	followObject: function (gameObject, offsetLeft, offsetUp) { //Asigna el objeto a seguir
		this.follow = true;
		this.offsetLeft = offsetLeft || 0;
		this.offsetUp = offsetUp || 0;
		this.followedObject = gameObject;
	},

	/**
	 * Actualiza la cámara. Se llama automáticamente.
	 * @method XEngine.Camera#update
	 * @private
	 */
	update: function () { //Si tiene objeto a seguir, intenta alcanzarlo si el movimiento de los ejes se lo permite y si no se sale del mundo
		var _this = this;
		if (_this.followedObject != null) {
			if (_this.axis == XEngine.AXIS.BOTH || _this.axis == XEngine.AXIS.HORIZONTAL) {
				if ((_this.followedObject.position.x - _this.offsetLeft) - _this.game.width / 2 > 0 && (_this.followedObject.position.x + _this.offsetLeft) + _this.game.width / 2 < _this.game.worldWidth) {
					_this.position.x = _this.followedObject.position.x - _this.game.width / 2 - _this.offsetLeft;
				}
			}
			if (_this.axis == XEngine.AXIS.BOTH || _this.axis == XEngine.AXIS.VERTICAL) {
				if ((_this.followedObject.position.y - _this.offsetUp) - _this.game.height / 2 > 0 && (_this.followedObject.position.y + _this.offsetUp) + _this.game.height / 2 < _this.game.worldHeight) {
					_this.position.y = _this.followedObject.position.y - _this.game.height / 2 - _this.offsetUp;
				}
			}
		}
	},
};
// ----------------------------------------- STATE MANAGER ------------------------------------------//

/**
 * Manager que controla los distintos estados que se añadan
 * 
 * @class XEngine.StateManager
 * @constructor
 * @param {XEngine.Game} game - Referencia al objeto game
 */
XEngine.StateManager = function (game) {
	/**
	 * @property {XEngine.Game} game - Referencia al juego
	 * @readonly
	 */
	this.game = game;
	/**
	 * @property {Array.<*>} states - Array de estados que se han añadido al juego
	 * @public
	 */
	this.states = new Array();
	/**
	 * @property {*} currentState - Estado en el que se encuentra actualmente el juego
	 * @readonly
	 */
	this.currentState = null;
	/**
	 * @property {String} currentStateName - Nombre del estado actual
	 * @readonly
	 */
	this.currentStateName = null;
};

XEngine.StateManager.prototype = {
	/**
	 * Añade un estado al array de estados
	 * @method XEngine.StateManager#add
	 * @param {String} stateName - KeyName del estado
	 * @param {Object} stateClass - Objeto de la clase del estado
	 */
	add: function (stateName, stateClass) { //Añade un estado al array de estados
		this.states[stateName] = stateClass;
	},

	/**
	 * Arranca un estado
	 * @method XEngine.StateManager#start
	 * @param {String} stateName - KeyName del estado
	 */
	start: function (stateName) { //Iniciamos un nuevo estado
		var _this = this;
		if (_this.currentState != null) {
			_this.game.destroy(); //Llamamos al destroy del game si venimos de otro estado
			if (_this.currentState.destroy != undefined) {
				_this.currentState.destroy(); //Llamammos al destroy del estado si este lo tiene implementado
			}
			delete _this.currentState; //Liberamos la memoria del objeto almacenado
			_this.currentState = null; //asignamos a null el estado
		}
		var state = _this.states[stateName]; //Obtener el estado al que queremos ir

		if (state == null) { //Si no existe mostramos un error y paramos la ejecución;
			console.error("no state for name " + stateName);
			return;
		}

		_this.currentState = new state(_this.game); //Creamos el nuevo estado y lo ponemos como actual
		_this.currentState.game = _this.game; //Asignamos la referencia de game al estado
		_this.currentState.stateName = stateName; //Asignamos el propio nombre del estado
		if (_this.currentState.preload != undefined) { //Si el estado tiene preload, lo llamamos
			_this.currentState.preload();
		}
		_this.game.scale.updateScale();
		_this.game.load._startPreload(); //Una vez se ha llamado al preload del estado, podemos proceder a cargar los assets

	},

	/**
	 * Reinicia el estado actual
	 * @method XEngine.StateManager#restart
	 */
	restart: function () {
		this.start(this.currentState.stateName); //Reiniciamos el estado actual
	}
};


// ----------------------------------------- PRELOADER AND CACHE ------------------------------------------//

/**
 * Manager que controla la carga de assets
 * 
 * @class XEngine.Loader
 * @constructor
 * @param {XEngine.Game} game - Referencia al objeto game
 */
XEngine.Loader = function (game) {
	this.game = game;
	this.pendingLoads = new Array(); //Objetos a cargar
	this.progress = 0; //Progreso (de 0 a 1 == de 0% a 100%)
	this.preloading = false; //En progreso de precarga, por defecto a false
	this.onCompleteFile = new XEngine.Signal(); //Evento que se dispara cada vez que se completa una descarga. Envía el progreso actual
};

XEngine.Loader.prototype = {
	/**
	 * Añade una imagen a la cola de carga
	 * @method XEngine.Loader#image
	 * @param {String} imageName - KeyName de la imagen
	 * @param {String} imageUrl - fuente de la imagen
	 */
	image: function (imageName, imageUrl) {
		this.pendingLoads.push(new XEngine.ImageLoader(imageName, imageUrl, this));
	},

	/**
	 * Añade hoja de sprites a la cola de carga
	 * @method XEngine.Loader#spriteSheet
	 * @param {String} imageName - KeyName de la imagen
	 * @param {String} imageUrl - fuente de la imagen
	 * @param {Number} frameWidth - ancho de cada frame
	 * @param {Number} frameHeight - alto de cada frame
	 */
	spriteSheet: function (imageName, imageUrl, frameWidth, frameHeight) {
		this.pendingLoads.push(new XEngine.ImageLoader(imageName, imageUrl, this, frameWidth, frameHeight));
	},

	/**
	 * Añade hoja de sprites a la cola de carga
	 * @method XEngine.Loader#spriteSheet
	 * @param {String} imageName - KeyName de la imagen
	 * @param {String} imageUrl - fuente de la imagen
	 * @param {String} jsonUrl - ruta donde se encuentra el json con la información del spritesheet
	 */
	jsonSpriteSheet: function (imageName, imageUrl, jsonUrl) {
		this.pendingLoads.push(new XEngine.JsonImageLoader(imageName, imageUrl, jsonUrl, this));
	},

	/**
	 * Añade un audio a la cola de carga
	 * @method XEngine.Loader#audio
	 * @param {String} audioName - KeyName del audio
	 * @param {String} audioUrl - fuente del audio
	 */
	audio: function (audioName, audioUrl) {
		this.pendingLoads.push(new XEngine.AudioLoader(audioName, audioUrl, this));
	},

	/**
	 * Arranca la carga de archivos
	 * @method XEngine.Loader#startPreload
	 * @private
	 */
	_startPreload: function () {
		this.preloading = true;
		if (this.pendingLoads.length == 0) { //Si no hay cargas pendientes, llama directamente al start
			this._callStart();
		}
		else { //En caso contrario llama al load de cada objeto a cargar
			for (var i = 0; i < this.pendingLoads.length; i++) {
				this.pendingLoads[i].load();
			}
		}
	},

	/**
	 * Actualiza las tareas completadas y las notifica cada vez que una termina
	 * @method XEngine.Loader#notifyCompleted
	 * @private
	 */
	_notifyCompleted: function () {
		var completedTasks = 0;

		for (var i = 0; i < this.pendingLoads.length; i++) { //Recorremos las cargas pendientes para ver cuales se han completado
			if (this.pendingLoads[i].completed) {
				completedTasks++;
			}
		}

		this.progress = completedTasks / this.pendingLoads.length; //Calculamos el progreso
		this.onCompleteFile.dispatch(this.progress); //Disparamos el evento

		if (this.progress == 1) { //Si el progreso llega al 100% terminamos, liberamos memoria y llamamos al start
			delete this.pendingLoads;
			this.onCompleteFile._destroy();
			this.pendingLoads = new Array();
			this._callStart();
		}
	},

	/**
	 * Una vez que finaliza el proceso de carga o no hay datos a cargar, se llama al start del estado
	 * @method XEngine.Loader#callStart
	 * @private
	 */
	_callStart: function () {
		this.preloading = false;
		this.game.state.currentState.start(); //Llama al start del estado actual
	},
};

/**
 * Objeto que maneja la carga de las imagenes
 * 
 * @class XEngine.ImageLoader
 * @constructor
 * @param {String} imageName - KeyName de la imagen a cargar
 * @param {String} imageUrl - uri donde está la imagen
 * @param {XEngine.Loader} loader - referencia al loader
 * @param {Number} [frameWidth] - ancho de la imagen;
 * @param {Number} [frameHeight] - alto de la imagen;
 */
XEngine.ImageLoader = function (imageName, imageUrl, loader, frameWidth, frameHeight) {
	this.imageName = imageName; //Nombre de la imagen a guardar en chache
	this.imageUrl = imageUrl; //Url de la imagen (con extension y todo)
	this.completed = false;
	this.loader = loader; //Referencia al loader
	this.frameWidth = frameWidth || 0;
	this.frameHeight = frameHeight || 0;
};

XEngine.ImageLoader.prototype = {
	/**
	 * Arranca la carga de la imagen
	 * @method XEngine.ImageLoader#load
	 * @private
	 */
	load: function () {
		var _this = this;
		var newImage = { //Creamos el objeto a guardar en cache
			imageName: _this.imageName, //Nombre de la imagen
			image: null, //Referencia de la imagen
			frameWidth: _this.frameWidth,
			frameHeight: _this.frameHeight,
			data: new Array(),
			type: "sprite"
		};
		var img1 = new Image(); //Creamos el objeto Image
		var handler = function () { //Creamos el handler de cuando se completa o da error
			var imageRef = _this.loader.game.cache.images[_this.imageName]; //Obtenemos la imagen de cache
			imageRef.image = this; //Asignamos la referencia
			_this.completed = true; //Marcamos como completado

			if (_this.frameWidth == 0) {
				imageRef.frameWidth = this.width;
			}
			else {
				imageRef.frameWidth = _this.frameWidth;
			}

			if (_this.frameHeight == 0) {
				imageRef.frameHeight = this.height;
			}
			else {
				imageRef.frameHeight = _this.frameHeight;
			}

			var canvas = document.createElement("canvas");
			canvas.width = this.width;
			canvas.height = this.height;

			var ctx = canvas.getContext("2d");
			ctx.drawImage(this, 0, 0);

			var data = ctx.getImageData(0, 0, this.width, this.height).data;

			//Push pixel data to more usable object
			for (var i = 0; i < data.length; i += 4) {
				var rgba = {
					r: data[i],
					g: data[i + 1],
					b: data[i + 2],
					a: data[i + 3]
				};

				imageRef.data.push(rgba);
			}

			_this.loader._notifyCompleted(); //Notificamos de que la carga se ha completado
		};
		img1.onload = handler; //Asignamos los handlers
		img1.onerror = handler;
		img1.src = _this.imageUrl; //Asignamos la url al objeto imagen
		_this.loader.game.cache.images[_this.imageName] = newImage; //Guardamos nuesto objeto de imagen en cache para luego recogerlo
	}
};

/**
 * Objeto que maneja la carga de atlas con JSON
 * 
 * @class XEngine.JsonImageLoader
 * @constructor
 * @param {String} imageName - KeyName de la imagen a cargar
 * @param {String} imageUrl - uri donde está la imagen
 * @param {String} jsonUrl - uri donde está el json
 * @param {XEngine.Loader} loader - referencia al loader
 */
XEngine.JsonImageLoader = function (imageName, imageUrl, jsonUrl, loader) {
	this.imageName = imageName; //Nombre de la imagen a guardar en chache
	this.imageUrl = imageUrl; //Url de la imagen (con extension y todo)
	this.jsonUrl = jsonUrl;
	this.completed = false;
	this.loader = loader; //Referencia al loader
	this.frameWidth = 0;
	this.frameHeight = 0;
	this.oneCompleted = false;
};

XEngine.JsonImageLoader.prototype = {
	/**
	 * Arranca la carga de la imagen
	 * @method XEngine.ImageLoader#load
	 * @private
	 */
	load: function () {
		var _this = this;
		_this.loadImage();
		_this.loadJson();
	},

	loadImage: function () {
		var _this = this;
		var newImage = { //Creamos el objeto a guardar en cache
			imageName: _this.imageName, //Nombre de la imagen
			image: null, //Referencia de la imagen
			frameWidth: _this.frameWidth,
			frameHeight: _this.frameHeight,
			data: new Array(),
			type: "jsonSprite"
		};
		var img1 = new Image(); //Creamos el objeto Image
		var imageHandler = function () { //Creamos el handler de cuando se completa o da error
			var imageRef = _this.loader.game.cache.images[_this.imageName]; //Obtenemos la imagen de cache
			imageRef.image = this; //Asignamos la referencia

			if (_this.frameWidth == 0) {
				imageRef.frameWidth = this.width;
			}
			else {
				imageRef.frameWidth = _this.frameWidth;
			}

			if (_this.frameHeight == 0) {
				imageRef.frameHeight = this.height;
			}
			else {
				imageRef.frameHeight = _this.frameHeight;
			}

			var canvas = document.createElement("canvas");
			canvas.width = this.width;
			canvas.height = this.height;

			var ctx = canvas.getContext("2d");
			ctx.drawImage(this, 0, 0);

			var data = ctx.getImageData(0, 0, this.width, this.height).data;

			//Push pixel data to more usable object
			for (var i = 0; i < data.length; i += 4) {
				var rgba = {
					r: data[i],
					g: data[i + 1],
					b: data[i + 2],
					a: data[i + 3]
				};

				imageRef.data.push(rgba);
			}
			if (_this.oneCompleted) {
				_this.completed = true; //Marcamos como completado
				_this.loader._notifyCompleted(); //Notificamos de que la carga se ha completado
			}
			else {
				_this.oneCompleted = true;
			}
		};
		img1.onload = imageHandler; //Asignamos los handlers
		img1.onerror = imageHandler;
		img1.src = _this.imageUrl; //Asignamos la url al objeto imagen
		_this.loader.game.cache.images[_this.imageName] = newImage; //Guardamos nuesto objeto de imagen en cache para luego recogerlo
	},

	loadJson: function () {
		var _this = this;
		var request = new XMLHttpRequest();
		request.open('GET', _this.jsonUrl, true);
		var handler = function () { //Creamos el handler de cuando se completa o da error
			if (request.status == 200) {
				var returnedJson = JSON.parse(request.responseText);
				var newJson = returnedJson;
				for (var i = 0; i < newJson.frames.length; i++) {
					var frame = newJson.frames[i];
					newJson[frame.filename] = frame;
				}
				_this.loader.game.cache.json[_this.imageName] = newJson;
			}

			if (_this.oneCompleted) {
				_this.completed = true; //Marcamos como completado
				_this.loader._notifyCompleted(); //Notificamos de que la carga se ha completado
			}
			else {
				_this.oneCompleted = true;
			}
		};
		request.onload = handler;
		request.send();
	},
};

/**
 * Objeto que maneja la carga sonidos
 * 
 * @class XEngine.AudioLoader
 * @constructor
 * @param {String} audioName - KeyName de la imagen a cargar
 * @param {String} audioUrl - uri donde está la imagen
 * @param {XEngine.Loader} loader - referencia al loader
 */
XEngine.AudioLoader = function (audioName, audioUrl, loader) {
	this.audioName = audioName; //Nombre del audio a guardar en chache
	this.audioUrl = audioUrl; //Url del audio (con extension y todo)
	this.completed = false;
	this.loader = loader; //Referencia al loader
};

XEngine.AudioLoader.prototype = {
	/**
	 * Arranca la carga del audio
	 * @method XEngine.AudioLoader#load
	 * @private
	 */
	load: function () {
		var _this = this;
		var newAudio = { //Creamos el objeto a guardar en cache
			audioName: _this.audioName, //Nombre del audio
			audio: null, //Referencia del audio
			decoded: false, //El audio ya está decodificado?
		};
		var request = new XMLHttpRequest();
		request.open('GET', _this.audioUrl, true);
		request.responseType = 'arraybuffer';
		var handler = function () { //Creamos el handler de cuando se completa o da error
			var audioRef = _this.loader.game.cache.audios[_this.audioName]; //Obtenemos el audio de cache
			if (request.status == 200) {
				_this.loader.game.audioContext.decodeAudioData(request.response, function (buffer) {
					audioRef.audio = buffer;
					audioRef.decoded = true;
					_this.completed = true;
					_this.loader._notifyCompleted();
				}, function () {
					_this.completed = true; //Marcamos como completado
					_this.loader._notifyCompleted();
				});
			}
			else {
				_this.completed = true; //Marcamos como completado
				_this.loader._notifyCompleted(); //Notificamos de que la carga se ha completado
			}
		};
		request.onload = handler;
		_this.loader.game.cache.audios[_this.audioName] = newAudio; //Guardamos nuesto objeto de audio en cache para luego recogerlo
		request.send();
	}
};


/**
 * Objeto que almacena los assets cargados
 * 
 * @class XEngine.Cache
 * @constructor
 * @param {XEngine.Game} game - referencia al objeto del juego
 */
XEngine.Cache = function (game) {
	this.game = game;
	this.images = new Array(); //Cache de imagenes
	this.audios = new Array(); //Cache de audios
};

XEngine.Cache.prototype = {
	/**
	 * Devuelve una imagen guardada en cache
	 * @method XEngine.Cache#image
	 * @param {String} imageName - keyName de la imagen
	 * @private
	 */
	image: function (imageName) {
		if (this.images[imageName] == undefined) {
			console.error('No hay imagen para el nombre: ' + imageName);
		}
		else {
			return this.images[imageName];
		}
	},

	/**
	 * Devuelve un audio guardado en cache
	 * @method XEngine.Cache#audio
	 * @param {String} audioName - keyName del audio
	 * @private
	 */
	audio: function (audioName) {
		if (this.audios[audioName] == undefined) {
			console.error('No hay audio para el nombre: ' + audioName);
		}
		else {
			return this.audios[audioName];
		}
	},

	/**
	 * Borra toda la cache
	 * @method XEngine.Cache#clearChache
	 */
	clearCache: function () {
		delete this.images;
		delete this.audios;
		this.images = new Array();
		this.audios = new Array();
	}
};

// -------------------------------------------- RENDERER ---------------------------------------------//

/**
 * Renderer principal del juego (usa el contexto de canvas)
 * 
 * @class XEngine.Renderer
 * @constructor
 * @param {XEngine.Game} game - referencia al objeto del juego
 * @param {HTMLElement} canvas - contexto en el que pinta este renderer
 */
XEngine.Renderer = function (game, canvas) {
	this.game = game;
	this.scale = {
		x: 1,
		y: 1
	};
	try {
		// Tratar de tomar el contexto estandar. Si falla, probar otros.
		this.context = canvas.getContext("webgl") || canvas.getContext("experimental-webgl") || canvas.getContext("moz-webgl") || canvas.getContext("webkit-3d");
	}
	catch(e) {}
	
	// Si no tenemos ningun contexto GL, date por vencido ahora
	if (!this.context) {
		alert("Imposible inicializar WebGL. Tu navegador puede no soportarlo.");
		this.context = null;
	}else{
		//this.context.viewportWidth = this.game.canvas.width;
		//this.context.viewportHeight = this.game.canvas.height;
		this.context.clearColor(0.0, 0.0, 0.0, 1.0);                      // Establecer el color base en negro, totalmente opaco
		this.context.enable(this.context.DEPTH_TEST);                               // Habilitar prueba de profundidad
		this.context.depthFunc(this.context.LEQUAL);                                // Objetos cercanos opacan objetos lejanos
		this.context.clear(this.context.COLOR_BUFFER_BIT|this.context.DEPTH_BUFFER_BIT);      // Limpiar el buffer de color asi como el de profundidad
		this.context.viewport(0, 0, this.game.canvas.width, this.game.canvas.height);
		console.log(this.context);
	}
};

XEngine.Renderer.prototype = {
	/**
	 * Inicia el proceso de render
	 * @method XEngine.Renderer#render
	 * @private
	 */
	render: function () {
		this.context.clear(this.context.COLOR_BUFFER_BIT|this.context.DEPTH_BUFFER_BIT);
		this.context.viewport(0, 0, this.game.canvas.width, this.game.canvas.height);
		//this.context.clearRect(0, 0, this.game.width * this.scale.x, this.game.height * this.scale.y); //Limpiamos el canvas
		//this.context.save();
		//this.context.scale(this.scale.x, this.scale.y);
		this.renderLoop(this.game.gameObjects);
		//this.context.restore();
	},

	/**
	 * Loop que llama al render de todos los objetos. Si es un grupo, se llama a si misma.
	 * @method XEngine.Renderer#renderLoop
	 * @param {Array.<XEngine.BaseObject>} arrayObjects - Array de objetos a renderizar
	 * @private
	 */
	renderLoop: function (arrayObjects) { //Renderizamos el array de objetos que le pasamos por parametro
		var _this = this;
		for (var i = 0; i < arrayObjects.length; i++) {
			var object = arrayObjects[i];
			if (!object.render) continue;
			if (XEngine.Group.prototype.isPrototypeOf(object)) { //Si es un grupo, llamamos al render pasando los objetos que contiene
				_this.renderLoop(object.children);
			}
			else if (!XEngine.Audio.prototype.isPrototypeOf(object)) { //Si no es un audio, renderizamos
				if (!object.alive) continue;
				if (object.sprite == 'player') {
					console.log("cosa");
				}
				object._renderToCanvas(_this.context);
				if (object.body != undefined) {
					object.body._renderBounds(_this.context); //Si tiene un body, llamamos al render de los bounds
				}
			}
		}
	},

	/**
	 * Asigna la escala del renderer (Para cuando el canvas está escalado)
	 * @method XEngine.Renderer#setScale
	 * @param {Number} x - Escala en x
	 * @param {Number} y - Escala en y
	 * @private
	 */
	setScale: function (x, y) {
		this.scale.x = x;
		this.scale.y = y || x;
	},

	/**
	 * Obtiene la información de color del frame acutal
	 * @method XEngine.Renderer#getFrameInfo
	 * @return {Array.<object>}
	 */
	getFrameInfo: function () {
		var data = this.context.getImageData(0, 0, this.game.width, this.game.height).data;
		var returnData = new Array();
		//Push pixel data to more usable object
		for (var i = 0; i < data.length; i += 4) {
			var rgba = {
				r: data[i],
				g: data[i + 1],
				b: data[i + 2],
				a: data[i + 3]
			};

			returnData.push(rgba);
		}

		return returnData;
	},

	/**
	 * Obtiene la información de color de un pixel
	 * @method XEngine.Renderer#getPixelInfo
	 * @param {Number} posX - Posición x del pixel
	 * @param {Number} posY - Posición y del pixel
	 * @return {Array.<object>}
	 */
	getPixelInfo: function (posX, posY) {
		var data = this.context.getImageData(Math.round(posX), Math.round(posY), 1, 1).data;
		var rgba = {
			r: data[0],
			g: data[1],
			b: data[2],
			a: data[3]
		};
		return rgba;
	}
};

// ----------------------------------------- SCALE MANAGER -------------------------------------------//

/**
 * Manager que se encarga de escalar el manager según el tipo de escala que se especifique
 * 
 * @class XEngine.ScaleManager
 * @constructor
 * @param {XEngine.Game} game - referencia al objeto del juego
 */
XEngine.ScaleManager = function (game) {
	this.game = game;
	this.scaleType = XEngine.Scale.NO_SCALE;
	this.orientation = 'landScape';
	this.sourceAspectRatio = 0;
};

XEngine.Scale = {
	FIT: 0,
	SHOW_ALL: 1,
	NO_SCALE: 2,
};

XEngine.ScaleManager.prototype = {
	/**
	 * Inicializa el ScaleManager. Se llama al iniciar el juego
	 * @method XEngine.ScaleManager#init
	 * @private
	 */
	init: function () {
		var _this = this;
		var onWindowsResize = function (event) {
			_this.onWindowsResize(event);
		};
		window.addEventListener('resize', onWindowsResize, true);
	},

	/**
	 * Callback que se llama al redimensionar la ventana
	 * @method XEngine.ScaleManager#onWindowsResize
	 * @param {Object} event - Evento que lanza el listener
	 * @private
	 */
	onWindowsResize: function (event) {
		this.updateScale();
	},

	/**
	 * Actualiza el tamaño del canvas y la escala que tiene. Es llamada por el callback onWindowsResize
	 * @method XEngine.ScaleManager#updateScale
	 */
	updateScale: function () {
		if (this.scaleType !== XEngine.Scale.NO_SCALE) {
			var newWidth = 0;
			var newHeight = 0;
			if (this.scaleType === XEngine.Scale.FIT) {
				newWidth = window.innerWidth;
				newHeight = window.innerHeight;
			}
			else {
				this.sourceAspectRatio = this.game.width / this.game.height;
				newHeight = window.innerHeight;
				newWidth = newHeight * this.sourceAspectRatio;
				if (newWidth > window.innerWidth) {
					newWidth = window.innerWidth;
					newHeight = newWidth / this.sourceAspectRatio;
				}
			}
			newWidth = Math.round(newWidth);
			newHeight = Math.round(newHeight);
			this.resizeCanvas(newWidth, newHeight);
		}
	},

	/**
	 * Cambia el tamaño del canvas
	 * @method XEngine.ScaleManager#resizeCanvas
	 * @param {Number} newWidth - nuevo ancho del canvas
	 * @param {Number} newHeight - nuevo alto del canvas
	 */
	resizeCanvas: function (newWidth, newHeight) {
		this.game.canvas.setAttribute('width', newWidth);
		this.game.canvas.setAttribute('height', newHeight);
		this.game.renderer.setScale(newWidth / this.game.width, newHeight / this.game.height);
		this.game.context.viewport(0, 0, this.game.canvas.width, this.game.canvas.height);
	},
};

// ----------------------------------------- OBJECT FACTORY ------------------------------------------//

/**
 * Se encarga de crear y añadir a la escena los distintos objetos del juego
 * 
 * @class XEngine.ObjectFactory
 * @constructor
 * @param {XEngine.Game} game - referencia al objeto del juego
 */
XEngine.ObjectFactory = function (game) {
	this.game = game;
};

XEngine.ObjectFactory.prototype = {
	/**
	 * Añade un objeto ya existente (creado con new) al juego
	 * @method XEngine.ObjectFacory#existing
	 * @param {XEngine.BaseObject} gameObject - Objeto a añadir
	 * @return {Object}
	 */
	existing: function (gameObject) { //Añade un objeto que ya ha sido creado
		this.game.gameObjects.push(gameObject); //Añadimos el objeto al array de objetos
		gameObject.parent = this.game; //Asignamos el padre del objeto
		gameObject._onInitialize();
		if (gameObject.start != undefined) {
			gameObject.start();
		}
		return gameObject;
	},

	/**
	 * Crea y añade un sprite al juego
	 * @method XEngine.ObjectFacory#sprite
	 * @param {Number} posX - Posición X del objeto
	 * @param {Number} posY - Posición Y del objeto
	 * @param {String} sprite - keyName del sprite
	 * @return {XEngine.Sprite}
	 */
	sprite: function (posX, posY, sprite) { //Creamos y añadimos un sprite a partir de los datos proporcionados
		var gameObject = new XEngine.Sprite(this.game, posX, posY, sprite);
		return this.existing(gameObject);
	},

	/**
	 * Crea y añade una imagen que se repite
	 * @method XEngine.ObjectFacory#tilled
	 * @param {Number} posX - Posición X del objeto
	 * @param {Number} posY - Posición Y del objeto
	 * @param {String} sprite - keyName de la imagen
	 * @param {Number} width - ancho de la imagen
	 * @param {Number} height - alto de la imagen
	 * @return {XEngine.TilledImage}
	 */
	tilled: function (posX, posY, sprite, width, height) { //Creamos y añadimos una imagen que se puede tilear
		var gameObject = new XEngine.TilledImage(this.game, posX, posY, sprite, width, height);
		return this.existing(gameObject);
	},


	/**
	 * Crea y añade una imagen que hace la función de bottón
	 * @method XEngine.ObjectFacory#button
	 * @param {Number} posX - Posición X del objeto
	 * @param {Number} posY - Posición Y del objeto
	 * @param {String} sprite - keyName de la imagen
	 * @param {String} spriteDown - keyName de la imagen cuando se pulsa el botón
	 * @param {String} spriteOver - keyName de la imagen cuando se pasa el ratón por encima
	 * @param {String} spriteUp - keyName de la imagen cuando se levanta el input
	 * @return {XEngine.Button}
	 */
	button: function (posX, posY, sprite, spriteDown, spriteOver, spriteUp) {
		var gameObject = new XEngine.Button(this.game, posX, posY, sprite, spriteDown, spriteOver, spriteUp);
		return this.existing(gameObject);
	},


	/**
	 * Crea y añade un rectangulo de color
	 * @method XEngine.ObjectFacory#rect
	 * @param {Number} posX - Posición X del objeto
	 * @param {Number} posY - Posición Y del objeto
	 * @param {Number} width - ancho de la imagen
	 * @param {Number} height - alto de la imagen
	 * @param {String} color - color en hexadecimal con formato rgb
	 * @return {XEngine.Rect}
	 */
	rect: function (posX, posY, width, height, color) { //Creamos un rectangulo a partir de los datos proporcionados
		var gameObject = new XEngine.Rect(this.game, posX, posY, width, height, color);
		return this.existing(gameObject);
	},


	/**
	 * Crea y añade un circulo de color
	 * @method XEngine.ObjectFacory#circle
	 * @param {Number} posX - Posición X del objeto
	 * @param {Number} posY - Posición Y del objeto
	 * @param {Number} radius - radio del circulo
	 * @param {Number} stroke - ancho del borde
	 * @param {String} color - color de relleno en hexadecimal con formato rgb
	 * @param {String} strokeColor - color del borde en hexadecimal con formato rgb
	 * @param {Boolean} fill - define si se rellena el circulo o se deja transparente
	 * @param {Number} startAngle - angulo de comienzo
	 * @param {Number} endAngle - angulo en el que termina
	 * @return {XEngine.Circe}
	 */
	circle: function (posX, posY, radius, color, stroke, strokeColor, fill, startAngle, endAngle) { //Creamos un rectangulo a partir de los datos proporcionados
		var gameObject = new XEngine.Circle(this.game, posX, posY, radius, color, stroke, strokeColor, fill, startAngle, endAngle);
		return this.existing(gameObject);
	},

	/**
	 * Crea y añade un objeto de texto
	 * @method XEngine.ObjectFacory#text
	 * @param {Number} posX - Posición X del objeto
	 * @param {Number} posY - Posición Y del objeto
	 * @param {String} text - texto a mostrar
	 * @param {Object} textStyle - objeto que contiene los parametros de estilo
	 * @return {XEngine.Text}
	 */
	text: function (posX, posY, text, textStyle) {
		var gameObject = new XEngine.Text(this.game, posX, posY, text, textStyle);
		return this.existing(gameObject);
	},

	/**
	 * Crea y añade un objeto de audio
	 * @method XEngine.ObjectFacory#audio
	 * @param {String} audio - keyName del archivo de audio a reproducir
	 * @param {Boolean} autoStart - indica si empieza al crearse o no
	 * @param {Number} volume - indica el volumen del audio;
	 * @return {XEngine.Audio}
	 */
	audio: function (audio, autoStart, volume) {
		var audioObject = new XEngine.Audio(this.game, audio, autoStart, volume);
		return this.existing(audioObject);
	},

	/**
	 * Crea y añade un contenedor de objetos
	 * @method XEngine.ObjectFacory#group
	 * @param {Number} posX - Posición X del objeto
	 * @param {Number} posY - Posición Y del objeto
	 * @return {XEngine.Group}
	 */
	group: function (posX, posY) { //Creamos y añadimos un grupo
		var x = posX || 0;
		var y = posY || 0;
		var gameObject = new XEngine.Group(this.game, x, y);
		return this.existing(gameObject);
	}
};

// ----------------------------------------- TWEENS ------------------------------------------//

/**
 * Manager que se encarga de la creación y el manejo de Tweens
 * 
 * @class XEngine.TweenManager
 * @constructor
 * @param {XEngine.Game} game - referencia al objeto del juego
 */
XEngine.TweenManager = function (game) {
	this.game = game;
	this.tweens = new Array();
};

XEngine.TweenManager.prototype = {

	/**
	 * Añade un tween que controla el target que se le pasa por parametro
	 * @method XEngine.TweenManager#add
	 * @param {Object} target - objeto al que se le va a aplicar el tween en una de sus propiedades
	 * @return {XEngine.Tween}
	 */
	add: function (target) { //Añade un tween para el objeto que se le pasa por parametro
		var tween = new XEngine.Tween(target);
		this.tweens.push(tween);
		return tween;
	},

	_update: function (deltaTimeMillis) {
		var _this = this;
		for (var i = _this.tweens.length - 1; i >= 0; i--) //Recorremos todos los tweens que han sido creados
		{
			var tween = _this.tweens[i];
			if (tween.isPendingDestroy) { //Si el tween está marcado para destruir, liberamos memoria y lo quitamos del array
				delete _this.tweens[i];
				_this.tweens.splice(i, 1);
			}
			else if (tween.isRunning) { //Si está en marcha, lo actualizamos
				tween._update(deltaTimeMillis);
			}
			else if (tween.autoStart && !tween.started) { //Si no está en marcha pero tiene autoStart, lo arrancamos
				tween.play();
			}
		}
	},

	/**
	 * Destruye todos los tweens
	 * @method XEngine.TweenManager#_destroy
	 * @private
	 */
	_destroy: function () {
		for (var i = this.tweens.length - 1; i >= 0; i--) //Liberamos la memoria de todos los tweens que teníamos creados
		{
			this.tweens[i].destroy();
			delete this.tweens[i];
		}
		delete this.tweens;
		this.tweens = new Array();
	}
};

/**
 * Objeto que controla las propiedades del objeto que se le asigna
 * 
 * @class XEngine.Tween
 * @constructor
 * @param {*} target - objeto a controlar
 */
XEngine.Tween = function (target) {
	/**
	 * @property {Boolean} isPendingDestroy - Determina si el tween va a ser eliminado en el proximo update
	 * @readonly
	 */
	this.isPendingDestroy = false;
	/**
	 * @property {Boolean} started - Determina si el tween ha empezado
	 * @readonly
	 */
	this.started = false;
	/**
	 * @property {*} target - Objeto al que se le modifican los atributos
	 * @private
	 */
	this.target = target;
	/**
	 * @property {Array.<*>} fromProperties - Propiedades iniciales
	 * @private
	 */
	this.fromProperties = new Array();
	/**
	 * @property {Array.<*>} properties - Propiedades a las que se quiere llegar
	 * @private
	 */
	this.properties = new Array(); 
	/**
	 * @property {Number} duration - Duracion en milisegundos
	 * @public
	 */
	this.duration = 0;
	/**
	 * @property {Boolean} autoStart - Determina si el tween tiene el auto start activado (solo es valida su modificación antes de que empiece el tween)
	 * @public
	 */
	this.autoStart = true;
	/**
	 * @property {XEngine.Easing} easing - Funcion de Easing a usar
	 * @public
	 */
	this.easing = undefined;
	/**
	 * @property {Number} delay - Tiempo que tarda el tween en empezar desde que se llama al play
	 * @public
	 */
	this.delay = 0;
	/**
	 * @property {Number} repeat - Cantidad de veces a repetir (si es -1 se repite continuamente)
	 * @public
	 */
	this.repeat = 0;
	/**
	 * @property {Number} runCount - Cantidad de veces que se ha ejecutado el tween desde el principio
	 * @readonly
	 */
	this.runCount = 0;
	/**
	 * @property {Boolean} isRunning - Determina si el tween se está ejecutando
	 * @readonly
	 */
	this.isRunning = false;
	/**
	 * @property {Number} progress - Progreso actual del tween (valor entre 0 y 1)
	 * @public
	 */
	this.progress = 0;
	/**
	 * @property {Number} time - Tiempo en milisegundos que lleva corriendo el tween
	 * @readonly
	 */
	this.time = 0;
	/**
	 * @property {Boolean} yoyo - Determina si el tween solo va a las propiedades asignadas o también vuelve a las originales
	 * @public
	 */
	this.yoyo = false;
	/**
	 * @property {XEngine.Signal} onComplete - Se llama al completarse el tween
	 * @public
	 */
	this.onComplete = new XEngine.Signal(); 
	/**
	 * @property {XEngine.Signal} onCompleteLoop - Se llama al completarse un loop del tween
	 * @public
	 */
	this.onCompleteLoop = new XEngine.Signal();
};

XEngine.Tween.prototype = {

	/**
	 * Arranca el tween con el delay que se haya definido
	 * @method XEngine.Tween#play
	 */
	play: function () {
		var _this = this;
		_this.started = true; //Marcamos que ya se ha llamado al play
		var timer = setTimeout(function () { //Le aplica el delay
			clearTimeout(timer); //Limpiamos el timer una vez que se ejecuta
			_this._startTween();
		}, _this.delay);
	},

	/**
	 * Metodo interno para arrancar el tween
	 * @method XEngine.Tween#_startTween
	 * @param {Object} target - objeto al que se le va a aplicar el tween en una de sus propiedades
	 * @private
	 */
	_startTween: function () {
		this.runCount++; //Aumentamos el contador de ejecuciones
		for (var property in this.properties) {
			this.target[property] = this.fromProperties[property]; //Asignamos las propiedades de inicio al objetivo
		}
		this.isRunning = true; //Marcamos como que se está ejecutando
	},

	/**
	 * completa el tween sin tener en cuenta el tiempo que haya pasado
	 * @method XEngine.Tween#complete
	 */
	complete: function () {
		this.time = this.duration;
		for (var property in this.properties) { //Para cada propiedad, calculamos su valor actual y se lo asignamos al objetivo
			this.target[property] = this.fromProperties[property];
		}
	},

	_update: function (deltaTime) {
		if (this.target == undefined || this.target == null) {
			this._destroy();
			return;
		} //Si el target ha sido destruido, destruimos el tween
		var _this = this;
		if ((_this.progress == 1)) { //Si el tween llega al final, se comprueba si tiene que hacer loop o ha acabado
			if (_this.repeat == -1 || _this.runCount <= _this.repeat) {
				_this.onCompleteLoop.dispatch();
				_this.time = 0;
				_this.progress = 0;
				_this.play();
			}
			else {
				_this.onComplete.dispatch();
				_this.destroy();
			}
			return;
		}
		_this.progress = XEngine.Mathf.clamp(_this.time / _this.duration, 0, 1); //Calculamos el progreso del tween basado en el tiempo que está corriendo y la duración
		for (var property in _this.properties) { //Para cada propiedad, calculamos su valor actual y se lo asignamos al objetivo
			var t = _this.progress;
			if (_this.yoyo) {
				if (t <= 0.5) {
					t *= 2;
				}
				else {
					var t2 = (t - 0.5) * 2;
					t = XEngine.Mathf.lerp(1, 0, t2);
				}
			}
			this.target[property] = XEngine.Mathf.lerp(_this.fromProperties[property], _this.properties[property], _this.easing(t));
		}
		_this.time += deltaTime; //Incrementamos el tiempo de ejecución
	},

	/**
	 * Añade las propiedades a cambiar, la duración, easing, etc del tween
	 * @method XEngine.Tween#to
	 * @param {Object} properties - objeto que contiene las propiedades a cambiar y su valor final
	 * @param {Number} duration - tiempo en milisegundos que va a durar el tween
	 * @param {XEngine.Easing} ease - Funcion de easing que va a tener el tween
	 * @param {Boolean} autoStart - define si el tween empieza al crearse
	 * @param {Number} delay - tiempo en milisegundos que tarda el tween en empezar una vez que se le ha dado al play
	 * @param {Number} repeat - define la cantidad de veces que se repite el tween (-1 indica que siempre se repite)
	 * @param {Boolean} yoyo - define si el tween va y vuelve a sus propiedades iniciales
	 * @return {XEngine.Tween}
	 */
	to: function (properties, duration, ease, autoStart, delay, repeat, yoyo) {
		for (var property in properties) { //Se asignan todas las propiedades de las que se proviene
			this.fromProperties[property] = this.target[property];
		}
		this.properties = properties; //Se asignan las propiedades a las que se quieren llegar
		this.duration = duration; //Se asigna la duración, easing, etc
		this.easing = ease;
		this.autoStart = autoStart || true;
		this.delay = delay || 0;
		this.repeat = repeat || 0;
		this.yoyo = yoyo || false;
		return this;
	},


	/**
	 * Destruye el tween
	 * @method XEngine.Tween#destroy
	 */
	destroy: function () { //Se destruye el tween y se libera memoria 
		this.isRunning = false;
		this.isPendingDestroy = true;
		if (this.onComplete != undefined) {
			this.onComplete._destroy();
		}
		if (this.onCompleteLoop != undefined) {
			this.onCompleteLoop._destroy();
		}
		delete this.onComplete;
		delete this.onCompleteLoop;
		delete this.fromProperties;
		delete this.properties;
	},

	/**
	 * asigna unas propiedades iniciacles definidas por el usuario (se tiene que llamar después del to)
	 * @method XEngine.Tween#from 
	 * @param {Object} properties - objeto que contiene las propiedades a cambiar y su valor final
	 * @return {XEngine.Tween}
	 */
	from: function (properties) {
		for (var property in properties) {
			this.fromProperties[property] = properties[property];
		}
		return this;
	}

};

/**
 * @callback easingFunction
 * @param {Number} t - tiempo en el que se encuentra el tween (valores entre 0 y 1)
 */

/**
 * Enum Para las distintas funciones de Easing
 * @enum {easingFunction}
 * 
 */
XEngine.Easing = { //Todas las funciones de Easing
	Linear: function (t) {
		return t
	},
	QuadIn: function (t) {
		return t * t
	},
	QuadOut: function (t) {
		return t * (2 - t)
	},
	QuadInOut: function (t) {
		return t < .5 ? 2 * t * t : -1 + (4 - 2 * t) * t
	},
	CubicIn: function (t) {
		return t * t * t
	},
	CubicOut: function (t) {
		return (--t) * t * t + 1
	},
	CubicInOut: function (t) {
		return t < .5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1
	},
	QuartIn: function (t) {
		return t * t * t * t
	},
	QuartOut: function (t) {
		return 1 - (--t) * t * t * t
	},
	QuartInOut: function (t) {
		return t < .5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t
	},
	QuintIn: function (t) {
		return t * t * t * t * t
	},
	QuintOut: function (t) {
		return 1 + (--t) * t * t * t * t
	},
	QuintInOut: function (t) {
		return t < .5 ? 16 * t * t * t * t * t : 1 + 16 * (--t) * t * t * t * t
	},
	SinIn: function (t) {
		if (t === 0) return 0;
		if (t === 1) return 1;
		return Math.cos(t * Math.PI / 2);
	},
	SinOut: function (t) {
		if (t === 0) return 0;
		if (t === 1) return 1;
		return Math.sin(t * Math.PI / 2);
	},
	SinInOut: function (t) {
		if (t === 0) return 0;
		if (t === 1) return 1;
		return 0.5 * (1 - Math.cos(Math.PI * t))
	},
	ExpoIn: function (t) {
		return t === 0 ? 0 : Math.pow(1024, t - 1)
	},
	ExpoOut: function (t) {
		return t === 1 ? 1 : 1 - Math.pow(2, -10 * t)
	},
	ExpoInOut: function (t) {

		if (t === 0) return 0;
		if (t === 1) return 1;
		if ((t *= 2) < 1) return 0.5 * Math.pow(1024, t - 1);
		return 0.5 * (-Math.pow(2, -10 * (t - 1)) + 2);

	},
	CircularIn: function (t) {
		return 1 - Math.sqrt(1 - t * t)
	},
	CircularOut: function (t) {
		return Math.sqrt(1 - (--t * t))
	},
	CircularInOut: function (t) {
		if ((t *= 2) < 1) return -0.5 * (Math.sqrt(1 - t * t) - 1);
		return 0.5 * (Math.sqrt(1 - (t -= 2) * t) + 1);
	},
	/*ElasticIn: function (t) {
		var s, a = 0.1,
			p = 0.4;
		if (t === 0) return 0;
		if (t === 1) return 1;
		if (!a || a < 1) {
			a = 1;
			s = p / 4;
		}
		else s = p * Math.asin(1 / a) / (2 * Math.PI);
		return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t - s) * (2 * Math.PI) / p));
	},
	ElasticOut: function (t) {
		var s, a = 0.1,
			p = 0.4;
		if (t === 0) return 0;
		if (t === 1) return 1;
		if (!a || a < 1) {
			a = 1;
			s = p / 4;
		}
		else s = p * Math.asin(1 / a) / (2 * Math.PI);
		return (a * Math.pow(2, -10 * t) * Math.sin((t - s) * (2 * Math.PI) / p) + 1);
	},
	ElasticInOut: function (t) {
		var s, a = 0.1,
			p = 0.4;
		if (t === 0) return 0;
		if (t === 1) return 1;
		if (!a || a < 1) {
			a = 1;
			s = p / 4;
		}
		else s = p * Math.asin(1 / a) / (2 * Math.PI);
		if ((t *= 2) < 1) return -0.5 * (a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t - s) * (2 * Math.PI) / p));
		return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t - s) * (2 * Math.PI) / p) * 0.5 + 1;
	},*/
	BackIn: function (t) {
		var s = 1.70158;
		return t * t * ((s + 1) * t - s);
	},
	BackOut: function (t) {
		var s = 1.70158;
		return --t * t * ((s + 1) * t + s) + 1;
	},
	BackInOut: function (t) {
		var s = 1.70158 * 1.525;
		if ((t *= 2) < 1) return 0.5 * (t * t * ((s + 1) * t - s));
		return 0.5 * ((t -= 2) * t * ((s + 1) * t + s) + 2);
	},
	BounceIn: function (t) {
		return 1 - XEngine.Easing.BounceOut(1 - t);
	},
	BounceOut: function (t) {
		if (t < (1 / 2.75)) {
			return 7.5625 * t * t;
		}
		else if (t < (2 / 2.75)) {
			return 7.5625 * (t -= (1.5 / 2.75)) * t + 0.75;
		}
		else if (t < (2.5 / 2.75)) {
			return 7.5625 * (t -= (2.25 / 2.75)) * t + 0.9375;
		}
		else {
			return 7.5625 * (t -= (2.625 / 2.75)) * t + 0.984375;
		}
	},
	BounceInOut: function (t) {
		if (t < 0.5) return XEngine.Easing.BounceIn(t * 2) * 0.5;
		return XEngine.Easing.BounceOut(t * 2 - 1) * 0.5 + 0.5;
	},
};

// ----------------------------------------- EVENTS ------------------------------------------//


/**
 * Objeto que almacena observadores para lanzar los eventos posteriormente
 * 
 * @class XEngine.Signal
 * @constructor
 */
XEngine.Signal = function () {
	/**
	 * @property {Array.<XEngine.SignalBinding>} bindings - Almacena todos los bindings que tiene el evento
	 * @readonly
	 */
	this.bindings = new Array(); //Listener que tiene la señal
};

XEngine.Signal.prototype = {

	/**
	 * añade un listener a este objeto
	 * @method XEngine.Signal#add
	 * @param {Function} listener - funcion a ejecutar
	 * @param {Object} listenerContext - contexto en el que se ejecuta la funcion
	 * @return {XEngine.Signal}
	 */
	add: function (listener, listenerContext) { //Añade un listener que siempre se ejecuta
		this.bindings.push(new XEngine.SignalBinding(this, listener, listenerContext, false));
	},

	/**
	 * añade un listener a este objeto que solo se ejecuta una vez
	 * @method XEngine.Signal#add
	 * @param {Function} listener - funcion a ejecutar
	 * @param {Object} listenerContext - contexto en el que se ejecuta la funcion
	 * @return {XEngine.Signal}
	 */
	addOnce: function (listener, listenerContext) {
		this.bindings.push(new XEngine.SignalBinding(this, listener, listenerContext, true));
	},

	/**
	 * Elimina un listener de los bindings
	 * @method XEngine.Signal#add
	 * @param {XEngine.SignalBinding} signalBinding - binding a eliminar
	 */
	_unBind: function (signalBinding) {
		var index = this.bindings.indexOf(signalBinding);
		delete this.bindings[index]; //Liberamos memoria
		this.bindings.splice(index, 1);
	},

	_destroy: function () { //Libera memoria
		delete this.bindings;
		this.bindings = new Array();
	},

	/**
	 * Lanza el evento a todos los listeners
	 * @method XEngine.Signal#dispatch
	 * @param {Object} args[] - sequencia de todos los parametros a ser enviados
	 */
	dispatch: function () {
		for (var i = this.bindings.length - 1; i >= 0; i--) {
			if (this.bindings[i] == null || this.bindings[i] == undefined) { //Si el binding ha dejado de existir, lo quitamos del array
				this.bindings.splice(i, 1);
			}
			this.bindings[i].dispatch.apply(this.bindings[i], arguments);
		}
	}
};

/**
  @callback signalCallback
 */

/**
 * Objeto que almacena un observador de una señal
 * 
 * @class XEngine.SignalBinding
 * @constructor
 * 
 * @param {XEngine.Signal} signal - referencia al objeto Signal
 * @param {signalCallback} listener - funcion a ejecutar
 * @param {*} listenerContext - contexto donde se ejecuta la funcion
 * @param {Boolean} [isOnce=false] - define si se debe ejecutar solo una vez
 */
XEngine.SignalBinding = function (signal, listener, listenerContext, isOnce) { //Objeto donde se almacena un listener
	/**
	 * @property {XEngine.Signal} signal - Referencia al objeto Signal
	 * @readonly
	 */
	this.signal = signal;
	/**
	 * @property {signalCallback} listener - funcion a ejecutar
	 * @readonly
	 */
	this.listener = listener;
	/**
	 * @property {*} listenerContext - contexto donde se ejecuta la funcion
	 * @readonly
	 */
	this.listenerContext = listenerContext;
	/**
	 * @property {Boolean} isOnce - define si se debe ejecutar solo una vez
	 * @readonly
	 */
	this.isOnce = isOnce || false;
};

XEngine.SignalBinding.prototype = {

	/**
	 * Lanza el evento al listener que tiene asignado
	 * @method XEngine.SignalBinding#dispatch
	 * @param {Object} args[] - sequencia de todos los parametros a ser enviados
	 */
	dispatch: function () {
		this.listener.apply(this.listenerContext, arguments);
		if (this.isOnce) {
			this.detach();
		}
	},

	/**
	 * Se elimina el listener del signal
	 * @method XEngine.SignalBinding#detach
	 */
	detach: function () {
		this.signal._unBind(this);
	}
};



// ----------------------------------------- PHYSICS ------------------------------------------//


/**
 * Motor de físicas
 * 
 * @class XEngine.Physics
 * @constructor
 * 
 * @param {XEngine.Game} game - referencia al objeto principal del juego
 */
XEngine.Physics = function (game) {
	this.game = game;
	/**
	 * @property {Boolean} systemEnabled - determina si el motor está activo
	 * @public
	 */
	this.systemEnabled = false; //Flag de sistema habilitado
	/**
	 * @property {Array.<XEngine.Physics.PhysicsBody>} physicsObjects - determina si el motor está activo
	 * @private
	 */
	this.physicsObjects = new Array(); //Array de objetos que tienen fisicas activas
	/**
	 * @property {Number} gravity - Cantidad de gravedad que hay en el juego
	 * @public
	 */
	this.gravity = 1; //Gravedad global
};

XEngine.Physics.Shapes = {
		Box: 0,
		Circle: 0
	},

	XEngine.Physics.prototype = {
		/**
		 * Arranca el motor de fisicas
		 * @method XEngine.Physics#startSystem
		 * @public
		 */
		startSystem: function () {
			this.systemEnabled = true; //Arranca el sistema
		},
		/**
		 * Pausa el motor de físicas
		 * @method XEngine.Physics#pauseSystem
		 * @public
		 */
		pauseSystem: function () {
			this.systemEnabled = false; //Pausa el sistema
		},
		/**
		 * Para por completo el motor y elimina los objetos que tenía añadidos
		 * @method XEngine.Physics#stop
		 * @public
		 */
		stop: function () { //Para por comleto el sistema
			this.systemEnabled = false;
			this._destroy();
		},
		/**
		 * Habilita las físicas para un objeto
		 * @method XEngine.Physics#enablePhysics
		 * @param {XEngine.BaseObject} gameObject - objeto al que se le habilitan las físicas
		 * @public
		 */
		enablePhysics: function (gameObject) { //Habilita las fisicas para un objeto
			gameObject.body = new XEngine.Physics.PhysicsBody(this.game, gameObject.position, gameObject); //Se crea el objeto de fisicas
			gameObject.body.physicsEngine = this; //Se le asigna una referencia a este sistema
			this.physicsObjects.push(gameObject.body); //Se añade el objeto de fisicas al array
		},
		/**
		 * Hace los cambios oportunos antes de llamar al update
		 * @method XEngine.Physics#preupdate
		 * @private
		 */
		preupdate: function () {
			for (var i = this.physicsObjects.length - 1; i >= 0; i--) //Recorremos los objetos del motor de fisicas para hacer su update
			{
				var gameObject = this.physicsObjects[i];
				if (gameObject.preupdate != undefined) //En caso contrario miramos si contiene el método update y lo ejecutamos
				{
					gameObject.preupdate();
				}
			}
		},
		/**
		 * Llama al update de todos los objetos que contiene
		 * @method XEngine.Physics#update
		 * @param {Number} deltaTime - Tiempo entre frames en segundos
		 * @private
		 */
		update: function (deltaTime) {
			var _this = this;
			for (var i = _this.physicsObjects.length - 1; i >= 0; i--) //Recorremos los objetos del motor de fisicas para hacer su update
			{
				var gameObject = _this.physicsObjects[i];
				if (!gameObject || gameObject.isPendingDestroy) //Si es un objeto destruido lo eliminamos del array y liberamos memoria
				{
					delete this.physicsObjects[i];
					this.physicsObjects.splice(i, 1);
				}
				else if (gameObject.update != undefined) //En caso contrario miramos si contiene el método update y lo ejecutamos
				{
					gameObject.update(deltaTime);
				}
			}
		},

		/**
		 * Devuelve true si los dos objetos están uno encima del otro
		 * @method XEngine.Physics#_isOverlapping
		 * @param {XEngine.Physics.PhysicsBody} gameObject1 - Primer objeto
		 * @param {XEngine.Physics.PhysicsBody} gameObject2 - Segundo objeto
		 * @returns {Boolean}
		 * @private
		 */
		_isOverlapping: function (gameObject1, gameObject2) {
			if (gameObject1 == undefined || gameObject2 == undefined) { //Si alguno de los objetos no está definido, saltamos el resto de la función
				return false;
			}
			if (gameObject1.max.x <= gameObject2.min.x || gameObject1.min.x >= gameObject2.max.x) {
				return false;

			}
			else if (gameObject1.max.y <= gameObject2.min.y || gameObject1.min.y >= gameObject2.max.y) {
				return false;

			}
			else {
				return true;
			}
		},

		/**
		 * Ejecuta los ovelaps si se da el caso
		 * @method XEngine.Physics#_overlaphandler
		 * @param {XEngine.Physics.PhysicsBody} body1 - Primer objeto
		 * @param {XEngine.Physics.PhysicsBody} body2 - Segundo objeto
		 * @returns {Boolean}
		 * @private
		 */
		_overlapHandler: function (body1, body2) { //Determina si dos objetos de fisicas están uno encima de otro
			if (body1 == undefined || !body1._contObject.alive) {
				return false;
			}
			if (body2 == undefined || !body2._contObject.alive) {
				return false;
			}
			if (this._isOverlapping(body1, body2)) //Miramos si colisionan
			{
				body1.onOverlap(body2); //Llamamos al método onOverlap del body
				body2.onOverlap(body1); //Llamamos al método onOverlap del body
				return true;
			}
			else {
				return false;
			}
		},

		/**
		 * Ejecuta los onCollision y separa los objetos si se da el caso
		 * @method XEngine.Physics#_collisionHandler
		 * @param {XEngine.Physics.PhysicsBody} body1 - Primer objeto
		 * @param {XEngine.Physics.PhysicsBody} body2 - Segundo objeto
		 * @returns {Boolean}
		 * @private
		 */
		_collisionHandler: function (body1, body2) { //Determina si dos objetos de fisicas están uno encima de otro
			if (body1 == undefined || !body1._contObject.alive) {
				return false;
			}
			if (body2 == undefined || !body2._contObject.alive) {
				return false;
			}

			if (this._isOverlapping(body1, body2)) {
				var overlapX = this.getOverlapX(body1, body2);
				var overlapY = this.getOverlapY(body1, body2);
				if (Math.abs(overlapX) > Math.abs(overlapY)) {
					this.separateY(body1, body2, overlapY);
					if (this._isOverlapping(body1, body2)) {
						this.separateX(body1, body2, overlapX);
					}
				}
				else {
					this.separateX(body1, body2, overlapX);
					if (this._isOverlapping(body1, body2)) {
						this.separateY(body1, body2, overlapY);
					}
				}

				body1.onCollision(body2); //Llamamos al método onCollision del body
				body2.onCollision(body1); //Llamamos al método onCollision del body
				return true;
			}
			else {
				return false;
			}
		},
		
		/**
		 * Separa los objetos en el eje X
		 * @method XEngine.Physics#separateX
		 * @param {XEngine.Physics.PhysicsBody} body1 - Primer objeto
		 * @param {XEngine.Physics.PhysicsBody} body2 - Segundo objeto
		 * @param {Number} overlap - Cantidad de overlap que hay
		 * @returns {Boolean}
		 * @private
		 */
		separateX: function (body1, body2, overlap) {

			//  Can't separate two immovable bodies, or a body with its own custom separation logic
			if (body1.immovable && body2.immovable) {
				//  return true if there was some overlap, otherwise false
				return (overlap !== 0);
			}

			if (overlap === 0)
				return false;

			//  Adjust their positions and velocities accordingly (if there was any overlap)
			var v1 = body1.velocity.x;
			var v2 = body2.velocity.x;
			var e = Math.min(body1.restitution, body2.restitution);

			if (!body1.immovable && !body2.immovable) {
				overlap *= 0.5;

				body1.position.x -= overlap;
				body2.position.x += overlap;

				var nv1 = Math.sqrt((v2 * v2 * body2.mass) / body1.mass) * ((v2 > 0) ? 1 : -1);
				var nv2 = Math.sqrt((v1 * v1 * body1.mass) / body2.mass) * ((v1 > 0) ? 1 : -1);
				var avg = (nv1 + nv2) * 0.5;

				nv1 -= avg;
				nv2 -= avg;

				body1.velocity.x = avg + nv1 * e;
				body2.velocity.x = avg + nv2 * e;
				body1.updateBounds();
				body2.updateBounds();
			}
			else if (!body1.immovable) {
				body1.position.x -= overlap;
				body1.velocity.x = v2 - v1 * e;
				body1.updateBounds();
			}
			else {
				body2.position.x += overlap;
				body2.velocity.x = v1 - v2 * e;
				body2.updateBounds();
			}

			//  If we got this far then there WAS overlap, and separation is complete, so return true
			return true;

		},

		/**
		 * Separa los objetos en el eje Y
		 * @method XEngine.Physics#separateY
		 * @param {XEngine.Physics.PhysicsBody} body1 - Primer objeto
		 * @param {XEngine.Physics.PhysicsBody} body2 - Segundo objeto
		 * @param {Number} overlap - Cantidad de overlap que hay
		 * @returns {Boolean}
		 * @private
		 */
		separateY: function (body1, body2, overlap) {

			//  Can't separate two immovable bodies, or a body with its own custom separation logic
			if (body1.immovable && body2.immovable) {
				//  return true if there was some overlap, otherwise false
				return (overlap !== 0);
			}

			if (overlap === 0)
				return false;

			//  Adjust their positions and velocities accordingly (if there was any overlap)
			var v1 = body1.velocity.y;
			var v2 = body2.velocity.y;
			var e = Math.min(body1.restitution, body2.restitution);

			if (!body1.immovable && !body2.immovable) {
				overlap *= 0.5;

				body1.position.y -= overlap;
				body2.position.y += overlap;

				var nv1 = Math.sqrt((v2 * v2 * body2.mass) / body1.mass) * ((v2 > 0) ? 1 : -1);
				var nv2 = Math.sqrt((v1 * v1 * body1.mass) / body2.mass) * ((v1 > 0) ? 1 : -1);
				var avg = (nv1 + nv2) * 0.5;

				nv1 -= avg;
				nv2 -= avg;

				body1.velocity.y = avg + nv1 * e;
				body2.velocity.y = avg + nv2 * e;
				body1.updateBounds();
				body2.updateBounds();
			}
			else if (!body1.immovable) {
				body1.position.y -= overlap;
				body1.velocity.y = v2 - v1 * e;
				body1.updateBounds();
			}
			else {
				body2.position.y += overlap;
				body2.velocity.y = v1 - v2 * e;
				body2.updateBounds();
			}

			//  If we got this far then there WAS overlap, and separation is complete, so return true
			return true;

		},

		/**
		 * Obtiene la cantidad de overlap que hay entre dos objetos en el eje Y
		 * @method XEngine.Physics#getOverlapY
		 * @param {XEngine.Physics.PhysicsBody} body1 - Primer objeto
		 * @param {XEngine.Physics.PhysicsBody} body2 - Segundo objeto
		 * @returns {Boolean}
		 * @public
		 */
		getOverlapY: function (body1, body2) {
			var overlap = 0;

			if (body1.velocity.y > body2.velocity.y) {
				overlap = body1.max.y - body2.min.y;
				body1.inAir = false;
			}
			else if (body1.velocity.y < body2.velocity.y) {
				overlap = body1.min.y - body2.max.y;
				body2.inAir = false;
			}

			return overlap;
		},

		/**
		 * Obtiene la cantidad de overlap que hay entre dos objetos en el eje X
		 * @method XEngine.Physics#getOverlapX
		 * @param {XEngine.Physics.PhysicsBody} body1 - Primer objeto
		 * @param {XEngine.Physics.PhysicsBody} body2 - Segundo objeto
		 * @returns {Boolean}
		 * @public
		 */
		getOverlapX: function (body1, body2) {
			var overlap = 0;

			if (body1.velocity.x > body2.velocity.x) {
				overlap = body1.max.x - body2.min.x;
			}
			else if (body1.velocity.x < body2.velocity.x) {
				overlap = body1.min.x - body2.max.x;
			}

			return overlap;
		},

		/**
		 * Ejecuta todo el calculo de la colisión para hacer overlap
		 * @method XEngine.Physics#overlap
		 * @param {XEngine.BaseObject} collider - Objeto que colisiona
		 * @param {XEngine.BaseObject} collideWith - Objeto con el que colisiona el primer objeto
		 * @public
		 */
		overlap: function (collider, collideWith) { //Metodo que se llama para que se determine el overlapping de dos objetos
			var _this = this;
			if (!_this.systemEnabled) return;
			var _coll1;
			var _coll2;
			if (XEngine.Group.prototype.isPrototypeOf(collider) && XEngine.Group.prototype.isPrototypeOf(collideWith)) {
				for (var i = 0; i < collider.children.length; i++) {
					_coll1 = collider.children[i].body;

					for (var j = 0; j < collideWith.children.length; j++) {
						_coll2 = collideWith.children[j].body;
						_this._overlapHandler(_coll1, _coll2);
					}
				}
			}
			else if (!XEngine.Group.prototype.isPrototypeOf(collider) && XEngine.Group.prototype.isPrototypeOf(collideWith)) {
				_coll1 = collider.body;
				for (var i = 0; i < collideWith.children.length; i++) {
					_coll2 = collideWith.children[i].body;
					_this._overlapHandler(_coll1, _coll2);
				}
			}
			else if (XEngine.Group.prototype.isPrototypeOf(collider) && !XEngine.Group.prototype.isPrototypeOf(collideWith)) {
				_coll2 = collideWith.body;
				for (var i = 0; i < collider.children.length; i++) {
					_coll1 = collider.children[i].body;
					_this._overlapHandler(_coll1, _coll2);
				}
			}
			else {
				_coll1 = collider.body;
				_coll2 = collideWith.body;
				_this._overlapHandler(_coll1, _coll2);
			}
		},

		/**
		 * Ejecuta todo el calculo de la colisión para hacer colisión
		 * @method XEngine.Physics#collide
		 * @param {XEngine.BaseObject} collider - Objeto que colisiona
		 * @param {XEngine.BaseObject} collideWith - Objeto con el que colisiona el primer objeto
		 * @public
		 */
		collide: function (collider, collideWith) { //Metodo que se llama para que se determine el overlapping de dos objetos
			var _this = this;
			if (!_this.systemEnabled) return;
			var _coll1;
			var _coll2;
			if (XEngine.Group.prototype.isPrototypeOf(collider) && XEngine.Group.prototype.isPrototypeOf(collideWith)) {
				for (var i = 0; i < collider.children.length; i++) {
					_coll1 = collider.children[i].body;

					for (var j = 0; j < collideWith.children.length; j++) {
						_coll2 = collideWith.children[j].body;
						_this._collisionHandler(_coll1, _coll2);
					}
				}
			}
			else if (!XEngine.Group.prototype.isPrototypeOf(collider) && XEngine.Group.prototype.isPrototypeOf(collideWith)) {
				_coll1 = collider.body;
				for (var i = 0; i < collideWith.children.length; i++) {
					_coll2 = collideWith.children[i].body;
					_this._collisionHandler(_coll1, _coll2);
				}
			}
			else if (XEngine.Group.prototype.isPrototypeOf(collider) && !XEngine.Group.prototype.isPrototypeOf(collideWith)) {
				_coll2 = collideWith.body;
				for (var i = 0; i < collider.children.length; i++) {
					_coll1 = collider.children[i].body;
					_this._collisionHandler(_coll1, _coll2);
				}
			}
			else {
				_coll1 = collider.body;
				_coll2 = collideWith.body;
				_this._collisionHandler(_coll1, _coll2);
			}
		},

		/**
		 * Destruye todos los objetos de físicas que están registrados en el motor
		 * @method XEngine.Physics#_destroy
		 * @private
		 */
		_destroy: function () {
			this.physicsObjects = new Array();
		}
	};

/**
 * Objeto de físicas. Contiene toda la información sobre el comportamiento que debe tener un objeto dentro del motor de físicas
 * 
 * @class XEngine.Physics.PhysicsBody
 * @constructor
 * 
 * @param {XEngine.Game} game - referencia al objeto principal del juego
 * @param {XEngine.Vector} position - posición inicial del objeto de físicas
 * @param {XEngine.BaseObject} contObject - referencia al objeto que controla
 */
XEngine.Physics.PhysicsBody = function (game, position, contObject) {
	this.game = game;
	/**
	 * @property {XEngine.Vector} position - determina la posición del objeto
	 * @public
	 */
	this.position = position;
	/**
	 * @property {XEngine.Vector} velocity - determina la velocidad actual
	 * @public
	 */
	this.velocity = new XEngine.Vector(0, 0);
	
	/**
	 * @property {Boolean} collideWithWorld - Determina si colisiona con los limites del mundo
	 * @public
	 */
	this.collideWithWorld = false;
	
	/**
	 * @property {Number} restitution - Cantidad de energia que mantiene al collisionar
	 * @public
	 */
	this.restitution = 0.1; 
	
	/**
	 * @property {Number} restitution - Gravedad local (cuanto la afecta la gravedad)
	 * @public
	 */
	this.gravity = 9;
	
	/**
	 * @property {Number} maxVelocity - Velocidad máxima que puede tener el objeto
	 * @public
	 */
	this.maxVelocity = 300;
	/**
	 * @property {Number} staticFriction - Fricción base para la velocidad en x
	 * @public
	 */
	this.staticFriction = 40;
	
	/**
	 * @property {Boolean} pendingDestroy - Si es true, el objeto será eliminado en el siguiente update
	 * @readonly
	 */
	this.pendingDestroy = false;
	
	/**
	 * @property {XEngine.Vector} acceleration - Aceleración del objeto
	 * @public
	 */
	this.acceleration = new XEngine.Vector(0, 0);
	
	/**
	 * @property {XEngine.Vector} min - Bounds en la posición mínima de cada eje
	 * @readonly
	 */
	this.min = new XEngine.Vector(0, 0); //Min y Max son los bounds del objeto
	/**
	 * @property {XEngine.Vector} max - Bounds en la posición máxima de cada eje
	 * @readonly
	 */
	this.max = new XEngine.Vector(0, 0);
	/**
	 * @property {Boolean} debug - Si es true, se pintará una caja verder indicando los bounds del objeto
	 * @public
	 */
	this.debug = false;
	/**
	 * @property {XEngine.BaseObject} _contObject - Objeto que controla este body
	 * @readonly
	 */
	this._contObject = contObject;
	/**
	 * @property {XEngine.BaseObject} bounds - Ancho y alto del objeto que está controlando
	 * @public
	 */
	this.bounds = this._contObject.getBounds();
	this.updateBounds();
};

XEngine.Physics.PhysicsBody.prototype = {
	
	/**
	 * Marca el objeto para que sea destruido
	 * @method XEngine.Physics.PhysicsBody#destroy
	 * @private
	 */
	destroy: function () {
		this.pendingDestroy = true;
	},

	/**
	 * Acualiza velocidades y mueve al objeto
	 * @method XEngine.Physics.PhysicsBody#update
	 * @param {Number} deltaTime - Tiempo entre frames en segundos
	 * @private
	 */
	update: function (deltaTime) {
		if (this.immovable) {
			this.updateBounds();
			return;
		}
		var _this = this;
		_this.velocity.y += _this.physicsEngine.gravity * _this.gravity * deltaTime;

		if (_this.velocity.x != 0 && _this.acceleration.x == 0) { //Si el objeto tiene velocidad y no está acelerando, se le aplica la fricción
			var signX = _this.velocity.x / Math.abs(_this.velocity.x); //Se obtiene el signo (dirección, negativa o positiva)
			var newVelocityX = XEngine.Mathf.clamp(Math.abs(_this.velocity.x) - _this.staticFriction * deltaTime, 0, _this.maxVelocity); //Se obtiene la nueva velocidad en valores positivos
			newVelocityX *= signX; //Se le aplica el signo
			_this.velocity.x = newVelocityX; //Se asigna la nueva velocidad
		}

		if (_this.velocity.y != 0 && _this.acceleration.y == 0 && _this.gravity == 0) { //Si el objeto tiene velocidad y no está acelerando, se le aplica la fricción
			var signY = _this.velocity.y / Math.abs(_this.velocity.y); //Se obtiene el signo (dirección, negativa o positiva)
			var newVelocityY = XEngine.Mathf.clamp(Math.abs(_this.velocity.y), 0, _this.maxVelocity); //Se obtiene la nueva velocidad en valores positivos
			newVelocityY *= signY; //Se le aplica el signo
			_this.velocity.y = newVelocityY; //Se asigna la nueva velocidad
		}

		_this.velocity.x += _this.acceleration.x * deltaTime; //Aplicamos la aceleracion
		_this.velocity.y += _this.acceleration.y * deltaTime;

		_this.velocity.y = XEngine.Mathf.clamp(_this.velocity.y, -_this.maxVelocity, _this.maxVelocity); //Aplicamos la velocidad máxima
		_this.velocity.x = XEngine.Mathf.clamp(_this.velocity.x, -_this.maxVelocity, _this.maxVelocity);

		_this.position.x += _this.velocity.x * deltaTime; //Actualizamos la posición en base a la velocidad
		_this.position.y += _this.velocity.y * deltaTime;

		_this._contObject.position = _this.position; //Actualizamos la posición del objeto controlado
		_this.updateBounds(); //Actualizamos los bounds una vez se ha calculado la nueva posición
		if (_this.collideWithWorld) { //Si tiene que colisionar con el mundo, evitamos que se salga
			if (_this.min.x < 0) { //Izquierda
				_this.position.x = (_this.bounds.widthAnchor);
				_this.velocity.x = (-this.velocity.x * _this.restitution);
			}
			else if (_this.max.x > _this.game.worldWidth) { //Derecha
				_this.position.x = _this.game.worldWidth - (_this.bounds.width * (1 - _this._contObject.anchor.x));
				_this.velocity.x = (-this.velocity.x * _this.restitution);
			}
			if (_this.min.y < 0) { //Arriba
				_this.position.y = (_this.bounds.height * _this._contObject.anchor.y);
				_this.velocity.y = (-this.velocity.y * _this.restitution);
			}
			else if (_this.max.y > _this.game.worldHeight) { //Abajo
				_this.position.y = _this.game.worldHeight - (_this.bounds.height * (1 - _this._contObject.anchor.y));
				_this.velocity.y = (-this.velocity.y * _this.restitution);
			}
		}

	},

	/**
	 * Actualiza los bounds minimos y maximos
	 * @method XEngine.Physics.PhysicsBody#updateBounds
	 * @private
	 */
	updateBounds: function () { //Se obtiene la caja de colisión teniendo en cuenta el achor del sprite
		var _this = this;
		_this.min.x = _this.position.x - (_this.bounds.width * _this._contObject.anchor.x);
		_this.min.y = _this.position.y - (_this.bounds.height * _this._contObject.anchor.y);
		_this.max.x = _this.position.x + (_this.bounds.width * (1 - _this._contObject.anchor.x));
		_this.max.y = _this.position.y + (_this.bounds.height * (1 - _this._contObject.anchor.y));
	},

	/**
	 * Renderiza la caja verde que indica los bounds encima del objeto
	 * @method XEngine.Physics.PhysicsBody#_renderBounds
	 * @param {CanvasRenderingContext2D} canvas - Contexto de canvas en el que pinta la caja
	 * @private
	 */
	_renderBounds: function (canvas) {
		var _this = this;
		if (_this.debug) { //Si el objeto está en debug, pintaremos su bounding box por encima
			canvas.save();
			canvas.fillStyle = 'rgba(200,255,200, 0.7)';
			canvas.fillRect(_this.position.x - (_this.bounds.width * _this._contObject.anchor.x), _this.position.y - (_this.bounds.height * _this._contObject.anchor.y), _this.bounds.width, _this.bounds.height);
			canvas.restore();
		}
	},

	/**
	 * Obtiene la posición del objeto en coordenadas globales
	 * @method XEngine.Physics.PhysicsBody#getWorldPos
	 * @returns {XEngine.Vector}
	 * @public
	 */
	getWorldPos: function () {
		var parentPos = this._contObject.parent.getWorldPos();
		var x = this.position.x + parentPos.x;
		var y = this.position.y + parentPos.y;
		
		return new XEngine.Vector(x, y);
	},
	
	/**
	 * Llama al evento onCollision del objeto al que controla
	 * @method XEngine.Physics.PhysicsBody#onCollision
	 * @private
	 */
	onCollision: function (other) {
		if (this._contObject.onCollision != undefined) { //Si el objeto controlado tiene implementado el metodo, lo llamamos
			this._contObject.onCollision(other._contObject);
		}
	},

	/**
	 * Llama al evento onOverlap del objeto al que controla
	 * @method XEngine.Physics.PhysicsBody#onOverlap
	 * @private
	 */
	onOverlap: function (other) {
		if (this._contObject.onOverlap != undefined) { //Si el objeto controlado tiene implementado el metodo, lo llamamos
			this._contObject.onOverlap(other._contObject);
		}
	},

	/**
	 * Deshabilita y destruye este objeto
	 * @method XEngine.Physics.PhysicsBody#disablePhysics
	 * @private
	 */
	disablePhysics: function () { //Deshabilitamos las fisicas para este objeto
		var index = this.physicsEngine.physicsObjects.indexOf(this);
		this.physicsEngine.physicsObjects.splice(index, 1);
		this.destroy();
		this._contObject.body = undefined;
		delete this;
	}
};



// ----------------------------------------- MATHS ------------------------------------------//

/**
 * Funciones mátematicas que no están en la clase Math de JS
 * 
 * @class XEngine.Mathf
 * @static
 */
XEngine.Mathf = {};

/**
 * Devuelve un float aleatorio entre el rango especificado
 * @param {Number} min - Número mínimo que puede devolver (inclusivo)
 * @param {Number} max - Número máximo que puede devolver (exclusivo)
 * 
 * @example
 * // returns 8.93
 * XEngine.Mathf.randomRange(1, 9)
 * @returns {Number}
 */
XEngine.Mathf.randomRange = function (min, max) {
	return min + (Math.random() * (max - min)); //Obtiene un float random con el rango que se le asigna, min (inclusive) y max (exclusive)
};

/**
 * Devuelve un entero aleatorio entre el rango especificado
 * @param {Number} min - Número mínimo que puede devolver (inclusivo)
 * @param {Number} max - Número máximo que puede devolver (inclusivo)
 * 
 * @example
 * // returns 3
 * XEngine.Mathf.randomIntRange(1, 9)
 * @returns {Number}
 */
XEngine.Mathf.randomIntRange = function (min, max) { //Obtiene un float random con el rango que se le asigna, min (inclusive) y max (inclusive)
	return Math.round(min + Math.random() * (max - min));
};


/**
 * Devuelve el número indicado entre el máximo y el mínimo, si number < min devuelve min, si number > max devuelve max, en cualquier otro caso devuelve number
 * @param {Number} number - Número al que se le aplica el clamp
 * @param {Number} min - Número mínimo que puede devolver
 * @param {Number} max - Número máximo que puede devolver
 * 
 * @example
 * // returns 10
 * XEngine.Mathf.clamp(70, 4, 10)
 * 
 * // returns 5
 * XEngine.Mathf.clamp(5, 4, 10)
 * @returns {Number}
 */
XEngine.Mathf.clamp = function (number, min, max) { //Devuelve el número si está dentro de min o max, en caso contrario devuelve min o max
	return Math.max(Math.min(number, max), min);
};

/**
 * Interpolacion lineal entre dos numeros
 * @param {Number} a - color 1
 * @param {Number} b - color 2
 * @param {Number} amount - 0 devuelve a, 1 devuelve b, cualquier valor entre esos devuelve un número entre a y b
 * @example
 * // returns 5
 * XEngine.Mathf.lerpColor(0, 10, 0.5)
 * @returns {Number}
 */
XEngine.Mathf.lerp = function (a, b, t) { //Interpolación lineal
	t = XEngine.Mathf.clamp(t, 0, 1);
	return (1 - t) * a + t * b;
};

/**
 * Interpolacion lineal entre dos colores
 * @param {String} a - color 1
 * @param {String} b - color 2
 * @param {Number} amount - 0 devuelve a, 1 devuelve b, cualquier valor entre esos devuelve un color entre a y b
 * @example
 * // returns #7F7F7F
 * XEngine.Mathf.lerpColor('#000000', '#ffffff', 0.5)
 * @returns {String}
 */
XEngine.Mathf.lerpColor = function (a, b, amount) {

	var ah = parseInt(a.replace(/#/g, ''), 16),
		ar = ah >> 16,
		ag = ah >> 8 & 0xff,
		ab = ah & 0xff,
		bh = parseInt(b.replace(/#/g, ''), 16),
		br = bh >> 16,
		bg = bh >> 8 & 0xff,
		bb = bh & 0xff,
		rr = ar + amount * (br - ar),
		rg = ag + amount * (bg - ag),
		rb = ab + amount * (bb - ab);

	return '#' + ((1 << 24) + (rr << 16) + (rg << 8) + rb | 0).toString(16).slice(1);
};

/**
 * Devuelve el angulo en radianes entre dos posiciones
 * @param {Number} originX - origen en X
 * @param {Number} originY - origen en Y
 * @param {Number} targetX - objetivo en X
 * @param {Number} targetY - objetivo en Y
 * @returns {Number}
 */
XEngine.Mathf.angleBetween = function (originX, originY, targetX, targetY) {
	var x = targetX - originX;
	var y = targetY - originY;
	var angle = (Math.atan2(y, x));


	return angle;
};


/**
 * Objeto vector que almacena coordenadas
 * 
 * @class XEngine.Vector
 * @constructor
 * 
 * @param {Number} x - posición en el eje x
 * @param {Number} y - posición en el eje y
 */
XEngine.Vector = function (x, y) { //Vector de 2 dimensiones
	/**
	 * @property {Number} x - coordenada en X
	 * @public
	 */
	this.x = x;
	/**
	 * @property {Number} y - coordenada en Y
	 * @public
	 */
	this.y = y;
	/**
	 * @property {Number} z - coordenada en Z (dentro del motor solo se usa para los sprites en isométrica)
	 * @public
	 */
	this.z = 0; //Sólo se usa en caso de isometrica
	/**
	 * @property {Number} zOffset - Añade un offset al eje Z
	 * @public
	 */
	this.zOffset = 0;
};

/**
 * Devuelve un vector que es la resta de dos vectores
 * @param {XEngine.Vector} vector1
 * @param {XEngine.Vector} vector2
 * @returns {XEngine.Vector}
 */
XEngine.Vector.sub = function (vector1, vector2) {
	var newVector = new XEngine.Vector(vector1.x, vector1.y);
	newVector.x -= vector2.x;
	newVector.y -= vector2.y;
	return newVector;
};

/**
 * Devuelve un vector que es la suma de dos vectores
 * @param {XEngine.Vector} vector1
 * @param {XEngine.Vector} vector2
 * @returns {XEngine.Vector}
 */
XEngine.Vector.add = function (vector1, vector2) {
	var newVector = new XEngine.Vector(vector1.x, vector1.y);
	newVector.x += vector2.x;
	newVector.y += vector2.y;
	return newVector;
};

/**
 * Devuelve la distancia entre dos vectores
 * @param {XEngine.Vector} vector1
 * @param {XEngine.Vector} vector2
 * @returns {Number}
 */
XEngine.Vector.distance = function (vector1, vector2) {
	var difference = XEngine.Vector.sub(vector1, vector2);
	return difference.length();
};

/**
 * Devuelve un vector que es la transformación a coordenadas isommétricas de un vector en coordenadas cartesianas
 * @param {XEngine.Vector} coordinates
 * @returns {XEngine.Vector}
 */
XEngine.Vector.cartToIsoCoord = function (coordinates) {
	var outCoordinates = new XEngine.Vector(0, 0);
	outCoordinates.x = coordinates.x - coordinates.y;
	outCoordinates.y = (coordinates.x + coordinates.y) / 2;
	outCoordinates.z = (coordinates.x + coordinates.y) + coordinates.zOffset;
	return outCoordinates;
};

/**
 * Devuelve un vector que es la transformación a coordenadas cartesianas de un vector en coordenadas isommétricas
 * @param {XEngine.Vector} coordinates
 * @returns {XEngine.Vector}
 */
XEngine.Vector.isoToCarCoord = function (isoCoord) {
	var outCoordinates = new XEngine.Vector(0, 0);
	outCoordinates.x = (isoCoord.x / 2) + isoCoord.y;
	outCoordinates.y = isoCoord.y - (isoCoord.x / 2);
	return outCoordinates;
};


XEngine.Vector.prototype = {

	/**
	 * Asigna valores al vector
	 * @method XEngine.Vector#setTo
	 * 
	 * @param {Number} x - Valor en la coordenada X
	 * @param {Number} [y=x] - Valor en la coordenada Y
	 * @public
	 */
	setTo: function (x, y) { //Asigna los valores (solo por comodidad)
		this.x = x;
		if (y === undefined) y = x;
		this.y = y;
	},

	/**
	 * Suma a este vector los valores de otro
	 * @method XEngine.Vector#add
	 * 
	 * @param {XEngine.Vector} other - Vector a sumar
	 * @public
	 */
	add: function (other) { //Suma de vectores
		this.x += other.x;
		this.y += other.y;
	},

	/**
	 * Resta a este vector los valores de otro
	 * @method XEngine.Vector#sub
	 * 
	 * @param {XEngine.Vector} other - Vector a restar
	 * @public
	 */
	sub: function (other) { //Resta de vectores
		this.x -= other.x;
		this.y -= other.y;
		return this;
	},

	/**
	 * Multiplica a este vector los valores de otro
	 * @method XEngine.Vector#multiply
	 * 
	 * @param {XEngine.Vector} other - Vector a multiplicar
	 * @public
	 */
	multiply: function (other) { //Multiplicación de vectores
		this.x *= other.x;
		this.y *= other.y;
		return this;
	},

	/**
	 * Rota el vector tantos angulos como se le indique (angulos en radianes)
	 * @method XEngine.Vector#rotate
	 * 
	 * @param {Number} angle - Angulos a rotar
	 * @public
	 */
	rotate: function (angle) { //Rotar el vector
		var x = this.x;
		var y = this.y;
		this.x = x * Math.cos(angle) - y * Math.sin(angle);
		this.y = x * Math.sin(angle) + y * Math.cos(angle);
		return this;
	},

	/**
	 * Normaliza el Vector (Ajusta las coordenadas para que la longitud del vector sea 1)
	 * @method XEngine.Vector#normalize
	 * @public
	 */
	normalize: function () { //Normalizar el vector
		var d = this.len();
		if (d > 0) {
			this.x = this.x / d;
			this.y = this.y / d;
		}
		return this;
	},

	/**
	 * Proyecta este vector en otro
	 * @method XEngine.Vector#project
	 * 
	 * @param {XEngine.Vector} other - Vector en el que proyectar
	 * @return {XEngine.Vector}
	 * @public
	 */
	project: function (other) { //Projectar el vector en otro
		var amt = this.dot(other) / other.len2();
		this.x = amt * other.x;
		this.y = amt * other.y;
		return this;
	},

	/**
	 * Retorna el producto escalar del vector con otro vector
	 * @method XEngine.Vector#dot
	 * 
	 * @param {XEngine.Vector} other - Vector con el que hacer la operación
	 * @return {Number}
	 * @public
	 */
	dot: function (other) { //Producto escalar
		return this.x * other.x + this.y * other.y;
	},

	/**
	 * Escala el vector
	 * @method XEngine.Vector#scale
	 * 
	 * @param {Number} x - Valor en la coordenada X
	 * @param {Number} [y=x] - Valor en la coordenada Y
	 * @public
	 */
	scale: function (x, y) { //Escala del vector
		this.x *= x;
		this.y *= y || x;
		return this;
	},

	/**
	 * Refleja el vector dado un eje
	 * @method XEngine.Vector#reflect
	 * 
	 * @param {XEngine.Vector} axis - Eje en el que refleja el vector
	 * @returns {XEngine.Vector}
	 * @public
	 */
	reflect: function (axis) { //Reflejar el vector en un eje (Vector)
		var x = this.x;
		var y = this.y;
		this.project(axis).scale(2);
		this.x -= x;
		this.y -= y;
		return this;
	},

	/**
	 * Longitud del vector
	 * @method XEngine.Vector#length
	 * 
	 * @returns {Number}
	 * @public
	 */
	length: function () { //Longitud de un vector
		return Math.sqrt(this.len2());
	},

	/**
	 * Devuelve el cuadrado de la longitud
	 * @method XEngine.Vector#len2
	 * 
	 * @returns {Number}
	 * @public
	 */
	len2: function () { //Cuadrado de la longitud de un vector
		return this.dot(this);
	}
};

XEngine.Vector.prototype.constructor = XEngine.Vector;

// -------------------------------------------- INPUT--------------------------------------------//

/**
 * Manager que se encarga de manejar el input
 * 
 * @class XEngine.InputManager
 * @constructor
 * 
 * @param {XEngine.Game} game - referencia el objeto del juego
 */
XEngine.InputManager = function (game) { //Esto se explica solo
	this.game = game;
	/**
	 * @property {Array.<Boolean>} keysPressed - array en el que se almacenan si las teclas están pulsadas o no
	 * @readonly
	 */
	this.keysPressed = new Array();
	/**
	 * @property {XEngine.Signal} onKeyDown - evento que se llama cuando se aprieta una tecla. Se envía el objeto de evento de JS por defecto
	 * @readonly
	 */
	this.onKeyDown = new XEngine.Signal();
	/**
	 * @property {XEngine.Signal} onKeyUp - evento que se llama cuando se levanta una tecla. Se envía el objeto de evento de JS por defecto
	 * @readonly
	 */
	this.onKeyUp = new XEngine.Signal();
	/**
	 * @property {XEngine.Signal} onClick - evento que se llama cuando se hace click. Se envía un objeto con una propiedad 'position' que contiene x e y
	 * @readonly
	 */
	this.onClick = new XEngine.Signal();
	/**
	 * @property {XEngine.Signal} onInputDown - evento que se llama cuando se aprieta se baja el input (botón izquierdo de ratón). Se envía un objeto con una propiedad 'position' que contiene x e y
	 * @readonly
	 */
	this.onInputDown = new XEngine.Signal();
	/**
	 * @property {XEngine.Signal} onInputUp - evento que se llama cuando se suelta se baja el input (botón izquierdo de ratón). Se envía un objeto con una propiedad 'position' que contiene x e y
	 * @readonly
	 */
	this.onInputUp = new XEngine.Signal();
	/**
	 * @property {XEngine.Signal} onInputMove - evento que se llama cuando se mueve el input. Se envía un objeto con una propiedad 'position' que contiene x e y
	 * @readonly
	 */
	this.onInputMove = new XEngine.Signal();
	/**
	 * @property {Boolean} isDown - Determina si el input está apretado o no
	 * @readonly
	 */
	this.isDown = false;
	/**
	 * @property {XEngine.Vector} pointer - posición en la que se encuentra el input
	 * @readonly
	 */
	this.pointer = new XEngine.Vector(0, 0);
	var _this = this;
	document.addEventListener('keydown', function (event) {
		_this.keyDownHandler.call(_this, event);
	});
	document.addEventListener('keyup', function (event) {
		_this.keyUpHandler.call(_this, event);
	});

	if (this.game.isMobile) {
		this.game.canvas.addEventListener('touchstart', function (event) {
			_this.inputDownHandler.call(_this, event);
		});
		this.game.canvas.addEventListener('touchend', function (event) {
			_this.inputUpHandler.call(_this, event);
		});
		this.game.canvas.addEventListener('touchmove', function (event) {
			_this.inputMoveHandler.call(_this, event);
		});
	}
	else {
		this.game.canvas.addEventListener('mousedown', function (event) {
			_this.inputDownHandler.call(_this, event);
		});
		this.game.canvas.addEventListener('mouseup', function (event) {
			_this.inputUpHandler.call(_this, event);
		});
		this.game.canvas.addEventListener('mousemove', function (event) {
			_this.inputMoveHandler.call(_this, event);
		});
		this.game.canvas.addEventListener('click', function (event) {
			_this.clickHandler.call(_this, event);
		});
	}
};

XEngine.InputManager.prototype = {
	
	/**
	 * Inicializa el array de teclas apretadas
	 * @method XEngine.InputManager#_initializeKeys
	 * @private
	 */
	_initializeKeys: function () {
		for (var i = 0; i <= 222; i++) {
			this.keysPressed.push(false);
		}
	},
	/**
	 * Devuelve si una tecla está apretada
	 * @method XEngine.InputManager#isPressed
	 * 
	 * @param {Number} keyCode - Valor númerico de la tecla
	 * @returns {Boolean}
	 * @public
	 */
	isPressed: function (keyCode) {
		return this.keysPressed[keyCode];
	},

	/**
	 * callback interno que captura el evento de keydown
	 * @method XEngine.InputManager#keyDownHandler
	 * 
	 * @param {JSInputEvent} event - evento de JS para el input
	 * @private
	 */
	keyDownHandler: function (event) {
		if(!this.keysPressed[event.keyCode]){
			this.keysPressed[event.keyCode] = true;
			this.onKeyDown.dispatch(event);
		}
	},

	/**
	 * callback interno que captura el evento de keyup
	 * @method XEngine.InputManager#keyUpHandler
	 * 
	 * @param {JSInputEvent} event - evento de JS para el input
	 * @private
	 */
	keyUpHandler: function (event) {
		this.keysPressed[event.keyCode] = false;
		this.onKeyUp.dispatch(event);
	},

	/**
	 * callback interno que captura el evento de click
	 * @method XEngine.InputManager#clickHandler
	 * 
	 * @param {JSInputEvent} event - evento de JS para el input
	 * @private
	 */
	clickHandler: function (event) {
		var inputPos = this.getInputPosition(event);
		this.clickDispatcher(inputPos);
	},

	/**
	 * callback interno que captura el evento de inputDown
	 * @method XEngine.InputManager#inputDownHandler
	 * 
	 * @param {JSInputEvent} event - evento de JS para el input
	 * @private
	 */
	inputDownHandler: function (event) {
		this.isDown = true;
		var inputPos = this.getInputPosition(event);
		this.pointer.x = inputPos.position.x;
		this.pointer.y = inputPos.position.y;
		this.onInputDown.dispatch(inputPos);
		var _this = this;
		var loop = function (array) { //Bucle que inspecciona todos los elementos de un Array
			for (var i = array.length - 1; i >= 0; i--) {
				var gameObject = array[i];
				if (XEngine.Group.prototype.isPrototypeOf(gameObject)) {
					return loop(gameObject.children); //Si éste loop ha encontrado un objeto que hacer el input down, terminamos 
				}
				else {
					if (!gameObject.inputEnabled) continue;
					if (_this._pointerInsideBounds(gameObject)) {
						if (gameObject.onInputDown == undefined) {
							gameObject.onInputDown = new XEngine.Signal();
						}
						gameObject.onInputDown.dispatch(event);
						gameObject.isInputDown = true;
						return true;
					}
				}

			}
		};

		loop(this.game.gameObjects);
	},

	/**
	 * callback interno que captura el evento de inputMove
	 * @method XEngine.InputManager#inputMoveHandler
	 * 
	 * @param {JSInputEvent} event - evento de JS para el input
	 * @private
	 */
	inputMoveHandler: function (event) {

		var inputPos = this.getInputPosition(event);
		this.pointer.x = inputPos.position.x;
		this.pointer.y = inputPos.position.y;
		var _this = this;
		var loop = function (array) { //Bucle que inspecciona todos los elementos de un Array
			for (var i = array.length - 1; i >= 0; i--) {
				var gameObject = array[i];
				if (XEngine.Group.prototype.isPrototypeOf(gameObject)) {
					loop(gameObject.children);
				}
				else {
					if (!gameObject.inputEnabled) continue;
					if (_this._pointerInsideBounds(gameObject)) {
						if (!gameObject.isInputOver) {
							if (gameObject.onInputOver == undefined) {
								gameObject.onInputOver = new XEngine.Signal();
							}
							gameObject.onInputOver.dispatch(event);
							gameObject.isInputOver = true;
						}
					}
					else if (gameObject.isInputOver) {
						if (gameObject.onInputLeft == undefined) {
							gameObject.onInputLeft = new XEngine.Signal();
						}
						gameObject.onInputLeft.dispatch(event);
						gameObject.isInputOver = false;
					}
				}

			}
		};

		this.onInputMove.dispatch(inputPos);
		loop(this.game.gameObjects);
	},

	/**
	 * Dado un evento optiene la posición del puntero dentro del objeto canvas
	 * @method XEngine.InputManager#getInputPosition
	 * 
	 * @param {JSInputEvent} event - evento de JS para el input
	 * @private
	 */
	getInputPosition: function (event) {
		var rect = this.game.canvas.getBoundingClientRect();
		var newEvent = {
			position: {
				x: event.pageX - (document.documentElement.scrollLeft || document.body.scrollLeft) - rect.left,
				y: event.pageY - (document.documentElement.scrollTop || document.body.scrollTop) - rect.top
			},
		};

		if (this.game.isMobile) {
			newEvent = {
				position: {
					x: event.touches[0].pageX - (document.documentElement.scrollLeft || document.body.scrollLeft) - rect.left,
					y: event.touches[0].pageY - (document.documentElement.scrollTop || document.body.scrollTop) - rect.top
				}
			};
		}
		newEvent.position.x /= this.game.renderer.scale.x;
		newEvent.position.y /= this.game.renderer.scale.y;
		return newEvent;
	},

	/**
	 * callback interno que captura el evento de inputUp
	 * @method XEngine.InputManager#inputUpHandler
	 * 
	 * @param {JSInputEvent} event - evento de JS para el input
	 * @private
	 */
	inputUpHandler: function (event) {
		this.isDown = false;
		var newEvent = {
			position: {
				x: this.pointer.x,
				y: this.pointer.y,
			},
		};
		if (this.game.isMobile) {
			this.clickDispatcher(newEvent);
		}
		this.onInputUp.dispatch(newEvent);

		var _this = this;
		var loop = function (array) { //Bucle que inspecciona todos los elementos de un Array
			for (var i = array.length - 1; i >= 0; i--) {
				var gameObject = array[i];
				if (XEngine.Group.prototype.isPrototypeOf(gameObject)) {
					loop(gameObject.children);
				}
				else {
					if (!gameObject.inputEnabled) continue;
					if (gameObject.isInputDown) {

						if (gameObject.onInputUp == undefined) {
							gameObject.onInputUp = new XEngine.Signal();
						}
						gameObject.onInputUp.dispatch(event);
						gameObject.isInputDown = false;
						return true;
					}
				}

			}
		};

		loop(this.game.gameObjects);
	},

	/**
	 * Dispatcher para lanzar el evento onClick tanto con pc como en Movil
	 * @method XEngine.InputManager#clickDispatcher
	 * 
	 * @param {JSInputEvent} event - evento de JS para el input
	 * @private
	 */
	clickDispatcher: function (event) {
		this.onClick.dispatch(event);
		var _this = this;
		var loop = function (array) { //Bucle que inspecciona todos los elementos de un Array
			for (var i = array.length - 1; i >= 0; i--) {
				var gameObject = array[i];
				if (XEngine.Group.prototype.isPrototypeOf(gameObject)) {
					if (loop(gameObject.children)) return true; //Si éste loop ha encontrado un objeto que hacer click, terminamos 
				}
				else {
					if (gameObject || gameObject.inputEnabled) {
						if (_this._pointerInsideBounds(gameObject)) { //Si el area el objeto está dentro del puntero, lanzamos el click y acabamos
							if (gameObject.onClick == undefined) {
								gameObject.onClick = new XEngine.Signal();
							}
							gameObject.onClick.dispatch(event);
							return true;
						}
					}
				}
			}
			return false;
		};
		loop(this.game.gameObjects);
	},

	/**
	 * Comprueba si el puntero está dentro del objeto que se le pasa por parámetro
	 * @method XEngine.InputManager#_pointerInsideBounds
	 * 
	 * @param {XEngine.BaseObject} gameObject - objeto a comprobar
	 * @private
	 */
	_pointerInsideBounds: function (gameObject) { //Obtenemos si el puntero está dentro del area de un objeto
		if (gameObject.getBounds != undefined) {
			var bounds = gameObject.getBounds();
			var worldPos = gameObject.getWorldPos();
			if (this.pointer.x < (worldPos.x - bounds.width * gameObject.anchor.x) || this.pointer.x > (worldPos.x + bounds.width * (1 - gameObject.anchor.x))) {
				return false;

			}
			else if (this.pointer.y < (worldPos.y - bounds.height * gameObject.anchor.y) || this.pointer.y > (worldPos.y + bounds.height * (1 - gameObject.anchor.y))) {
				return false;

			}
			else {
				return true;
			}
		}
		else {
			return false;
		}
	},

	/**
	 * Hace un resset de los eventos
	 * @method XEngine.InputManager#reset
	 * 
	 * @public
	 */
	reset: function () {
		this.onKeyUp._destroy();
		this.onKeyDown._destroy();
		this.onClick._destroy();
		this.onInputDown._destroy();
		this.onInputUp._destroy();
		this.onInputMove._destroy();
		this._initializeKeys();
	},
};

// ----------------------------------------- GAME OBJECTS ------------------------------------------//

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
};

/**
 * Grupo de objetos. Es un contenedor donde poder controlar varios objetos a la vez
 * 
 * @class XEngine.Group
 * @extends XEngine.BaseObject
 * @constructor
 * 
 * @param {XEngine.Game} game - referencia el objeto del juego
 * @param {Number} x - posición en x
 * @param {Number} y - posición en y
 */
XEngine.Group = function (game, x, y) {
	XEngine.BaseObject.call(this, game);
	var _this = this;
	_this.game = game;
	_this.children = new Array(); //Array de objetos contenidos
	_this.position.setTo(x, y);
	_this.position.z = 0;
};

XEngine.Group.prototypeExtends = {
	update: function (deltaTime) {
		for (var i = this.children.length - 1; i >= 0; i--) //Recorremos los objetos del grupo para hacer su update
		{
			var gameObject = this.children[i];
			if (gameObject.isPendingDestroy) //Si es un objeto destruido lo eliminamos del array y liberamos memoria
			{
				if (gameObject.body != undefined) {
					gameObject.body.destroy();
				}
				delete this.children[i];
				this.children.splice(i, 1);
			}
			else if (gameObject.update != undefined && gameObject.alive) //En caso contrario miramos si contiene el método update y lo ejecutamos
			{
				gameObject.update(deltaTime);
			}
		}
	},

	getFirstDead: function () {
		for (var i = this.children.length - 1; i >= 0; i--) //Recorremos los objetos del grupo para encontrar alguno que esté "muerto"
		{
			var gameObject = this.children[i];
			if (!gameObject.alive) {
				return gameObject;
			}
		}
		return null;
	},

	getChildAtIndex: function (index) {
		return this.children[index];
	},

	childCount: function () {
		return this.children.length;
	},

	destroy: function () {
		this.kill();
		this.isPendingDestroy = true;
		for (var i = this.children.length - 1; i >= 0; i--) //Destruimos todos los hijos y liberamos memoria	
		{
			var gameObject = this.children[i];
			if (gameObject.destroy != undefined) {
				gameObject.destroy(gameObject);
				delete this.children[i];
			}
		}
		if (this.onDestroy != undefined) {
			this.onDestroy();
		}
	},

	add: function (gameObject) {
		if (this.game.gameObjects.indexOf(gameObject) >= 0) {
			var index = this.game.gameObjects.indexOf(gameObject);
			this.game.gameObjects.splice(index, 1);
		}
		this.children.push(gameObject);
		if (gameObject.start != undefined) {
			gameObject.start();
		}
		gameObject.parent = this;
		return gameObject;
	},
};
XEngine.Group.prototype = Object.create(XEngine.BaseObject.prototype);
Object.assign(XEngine.Group.prototype, XEngine.Group.prototypeExtends); //Se le añade el prototypeExtends al prototype original

/**
 * Objeto que pinta una imagen y que puede tener un physic body
 * 
 * @class XEngine.Sprite
 * @extends XEngine.BaseObject
 * @constructor
 * 
 * @param {XEngine.Game} game - referencia el objeto del juego
 * @param {Number} posX - posición en x
 * @param {Number} posY - posición en y
 * @param {String} sprite - nombre del sprite guardado en cache
 */
XEngine.Sprite = function (game, posX, posY, sprite) {
	XEngine.BaseObject.call(this, game);
	var _this = this;
	_this.sprite = sprite;
	_this.game = game; //guardamos una referencia al juego
	_this.frame = 0;
	var cache_image = _this.game.cache.image(sprite);
	if (cache_image.type == "sprite") {
		_this.width = cache_image.frameWidth || 10; //Si la imagen no se ha cargado bien, ponemos valor por defecto
		_this.height = cache_image.frameHeight || 10;
		_this._columns = Math.floor(cache_image.image.width / _this.width);
		_this._rows = Math.floor(cache_image.image.height / _this.height);
	}
	else {
		_this.json = _this.game.cache.getJson(sprite);
		var frameInfo = _this.json.frames[_this.frame];
		_this.width = frameInfo.frame.w;
		_this.height = frameInfo.frame.h;
	}
	_this.position.setTo(posX, posY);

	_this.animation = new XEngine.AnimationManager(game, this);
};

XEngine.Sprite.prototype = Object.create(XEngine.BaseObject.prototype);

XEngine.Sprite.prototypeExtends = {
	_renderToCanvas: function (canvas) { //Sobreescribimos el método render	
		var _this = this;
		canvas.save(); //Guardamos el estado actual del canvas
		var cache_image = _this.game.cache.image(_this.sprite); //Obtenemos la imagen a renderizar
		this.applyRotationAndPos(canvas);
		canvas.globalAlpha = _this.alpha;

		//Aplicamos el alpha del objeto
		//Renderizamos la imagen teniendo en cuenta el punto de anclaje
		if (cache_image.type == "sprite") {
			var width = Math.round(_this.width);
			var height = Math.round(_this.height);
			var posX = Math.round(-(width * _this.anchor.x));
			var posY = Math.round(-(height * _this.anchor.y));
			var column = _this.frame;

			if (column > _this._columns - 1) {
				column = _this.frame % _this._columns;
			}

			var row = Math.floor(_this.frame / _this._columns);
			if (_this.frame > 0) {
				console.log('Hola');
			}
			canvas.drawImage(cache_image.image, column * cache_image.frameWidth, row * cache_image.frameHeight, cache_image.frameWidth, cache_image.frameHeight, posX, posY, width, height);
		}
		else {
			var frameInfo = {};
			if (typeof _this.frame === 'string') {
				frameInfo = _this.json[_this.frame];
			}
			else {
				frameInfo = _this.json.frames[_this.frame];
			}
			var width = frameInfo.frame.w;
			var height = frameInfo.frame.h;
			var posX = Math.round(-(width * _this.anchor.x));
			var posY = Math.round(-(height * _this.anchor.y));
			canvas.drawImage(cache_image.image, frameInfo.frame.x, frameInfo.frame.y, frameInfo.frame.w, frameInfo.frame.h, posX, posY, width, height);
		}
		canvas.restore(); //Restauramos el estado del canvas
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

/**
 * Objeto que almacena los datos de una animación
 * 
 * @class XEngine.Animation
 * @constructor
 * 
 * @param {XEngine.Game} game - referencia el objeto del juego
 * @param {XEngine.Sprite} sprite - objeto sprite que controla
 * @param {Array.<Number>|Array.<String>} frames - array con los frames que muestra la animación
 * @param {Number} rate - tiempo de refresco en milisegundos
 */
XEngine.Animation = function (game, sprite, frames, rate) { //Objeto que almacena la información de una animación y la ejecuta
	var _this = this;
	_this.sprite = sprite;
	_this.game = game; //guardamos una referencia al juego
	_this.currentFrame = 0;
	_this.maxFrames = frames.length - 1;
	_this.frames = frames;
	_this.rate = rate;
	_this.frameTime = 0;
	_this.loop = false;
	_this.playing = false;
};

XEngine.Animation.prototype = {
	_update: function (deltaMillis) {
		var _this = this;
		_this.frameTime += deltaMillis;
		if (_this.frameTime >= _this.rate) {
			_this.currentFrame++;
			_this.frameTime = 0;
			if (_this.currentFrame > _this.maxFrames) {
				if (_this.loop) {
					_this.currentFrame = 0;
				}
				else {
					_this._stop();
					return;
				}
			}
		}
		_this.sprite.frame = _this.frames[_this.currentFrame];
	},

	_start: function () {
		this.playing = true;
	},

	_stop: function () {
		this.playing = false;
		this.frameTime = 0;
		this.currentFrame = 0;
	},
};

/**
 * Objeto que controla las animaciones de un Sprite
 * 
 * @class XEngine.AnimationManager
 * @constructor
 * 
 * @param {XEngine.Game} game - referencia el objeto del juego
 * @param {XEngine.Sprite} sprite - objeto sprite que controla
 */
XEngine.AnimationManager = function (game, sprite) { //Manager para manejar el uso de las animaciones de los sprites
	var _this = this;
	_this.sprite = sprite;
	_this.game = game; //guardamos una referencia al juego
	_this.animations = new Array();
	_this.currentAnim = null;
};

XEngine.AnimationManager.prototype = {
	_update: function (deltaMillis) {
		var _this = this;
		if (_this.currentAnim && _this.currentAnim.playing) {
			_this.currentAnim._update(deltaMillis);
		}
	},

	play: function (animName) { //Ejecuta una animación
		if (this.currentAnim) { //Si ya hay una en marcha, la paramos
			this.currentAnim._stop();
		}
		var anim = this.animations[animName];
		if (!anim) {
			return;
		}
		this.currentAnim = anim;
		anim._start();
	},

	_stop: function (animName) {
		var anim = this.animations[animName];
		if (!anim) {
			return;
		}
		this.currentAnim = null;
		anim._stop();
	},

	add: function (animName, frames, rate, loop) {
		var anim = new XEngine.Animation(this.game, this.sprite, frames, rate);
		anim.loop = loop || false;
		this.animations[animName] = anim;
	}
};

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

/**
 * Objeto que define un circulo
 * 
 * @class XEngine.Circle
 * @extends XEngine.BaseObject
 * @constructor
 * 
 * @param {XEngine.Game} game - referencia el objeto del juego
 * @param {Number} posX - posición X del objeto
 * @param {Number} posY - posición Y del objeto
 * @param {Number} radius - radio del circulo
 * @param {String} color - string con el valor del color en hexadecimal o en rgb
 * @param {Number} stroke - ancho del borde
 * @param {String} strokeColor - string con el valor del color del borde en hexadecimal o en rgb
 * @param {Boolean} fill - determina si se rellena o se deja solo el borde
 * @param {Number} startAngle - angulo en el que empieza a pintar
 * @param {Number} endAngle - angulo en el que termina a pintar
 * 
 */
XEngine.Circle = function (game, posX, posY, radius, color, stroke, strokeColor, fill, startAngle, endAngle) {
	XEngine.BaseObject.call(this, game);
	var _this = this;
	_this.game = game; //guardamos una referencia al juego
	_this.radius = radius;
	_this.color = color;
	_this.position.setTo(posX, posY); //set de la posición
	_this.stroke = stroke || 0;
	_this.fill = fill;
	if (fill == undefined) {
		_this.fill = true;
	}
	_this.strokeColor = strokeColor || 'white';
	_this.startAngle = startAngle || 0;
	_this.endAngle = endAngle || 360;
};

XEngine.Circle.prototype = Object.create(XEngine.BaseObject.prototype);
XEngine.Circle.constructor = XEngine.Circle;

XEngine.Circle.prototypeExtends = {
	_renderToCanvas: function (canvas) {
		var _this = this;
		canvas.save();
		this.applyRotationAndPos(canvas);
		canvas.globalAlpha = _this.alpha;
		var posX = Math.round(-(_this.radius * 2) * _this.anchor.x);
		var posY = Math.round(-(_this.radius * 2) * _this.anchor.y);
		canvas.beginPath();
		var startAntle = _this.startAngle * (Math.PI / 180);
		var endAngle = _this.endAngle * (Math.PI / 180);
		canvas.arc(posX, posY, _this.radius, startAntle, endAngle);
		if (_this.fill) {
			canvas.fillStyle = _this.color;
			canvas.fill();
		}
		if (_this.stroke > 0) {
			canvas.lineWidth = 5;
			canvas.strokeStyle = _this.strokeColor;
			canvas.stroke();
		}
		canvas.restore();
	},

	getBounds: function () {
		var _this = this;
		var width = (_this.radius * 2) * _this.scale.x;
		var height = (_this.radius * 2) * _this.scale.y;
		return {
			width: width,
			height: height
		};
	},
};

Object.assign(XEngine.Circle.prototype, XEngine.Circle.prototypeExtends);

/**
 * Objeto que define una imagen que se repite
 * 
 * @class XEngine.TilledImage
 * @extends XEngine.BaseObject
 * @constructor
 * 
 * @param {XEngine.Game} game - referencia el objeto del juego
 * @param {Number} posX - posición en x
 * @param {Number} posY - posición en y
 * @param {String} sprite - nombre del sprite guardado en cache
 * @param {Number} widht - ancho de la imagen
 * @param {Number} height - alto de la imagen
 * 
 */
XEngine.TilledImage = function (game, posX, posY, sprite, widht, height) {
	XEngine.BaseObject.call(this, game);
	var _this = this;
	_this.sprite = sprite;
	_this.game = game; //guardamos una referencia al juego
	var image = _this.game.cache.image(sprite).image;
	_this.imageWidht = image.widht || 10;
	_this.imageHeigh = image.height || 10;
	_this.width = widht;
	_this.height = height;
	_this.position.setTo(posX, posY);
	_this.offSet = new XEngine.Vector(0, 0); //Offset para poder mover la posición del tilling
};

XEngine.TilledImage.prototype = Object.create(XEngine.BaseObject.prototype);

XEngine.TilledImage.prototypeExtends = {
	_renderToCanvas: function (canvas) {
		var _this = this;
		canvas.save();
		var pos = _this.getWorldPos();

		if (_this.offSet.x > _this.imageWidht) { //Evitamos que el offset llegue a ser un número demasiado grande
			_this.offSet.x = _this.offSet.x - _this.imageWidht;
		}
		else if (_this.offSet.x < -_this.imageWidth) {
			_this.offSet.x = _this.offSet.x + _this.imageWidht;
		}

		if (_this.offSet.y > _this.imageHeigh) {
			_this.offSet.y = _this.offSet.y - _this.imageHeigh;
		}
		else if (_this.offSet.y < -_this.imageHeigh) {
			_this.offSet.y = _this.offSet.y + _this.imageHeigh;
		}

		var image = _this.game.cache.image(_this.sprite).image
		var pattern = canvas.createPattern(image, "repeat"); //Creamos el patron en modo repetición

		var rectX = Math.round(-(pos.x + _this.offSet.x));
		var rectY = Math.round(-(pos.y + _this.offSet.y));

		this.applyRotationAndPos(canvas, {
			x: rectX,
			y: rectY
		});

		var rectWidht = Math.round(_this.width * _this.scale.x);
		var rectHeigth = Math.round(_this.height * _this.scale.y);

		canvas.beginPath();
		canvas.rect(rectX, rectY, rectWidht, rectHeigth); //Creamos el rect donde se va pintar nuestra imagen
		canvas.fillStyle = pattern; //Asignamos el patrón que hemos creado antes
		canvas.globalAlpha = _this.alpha;
		canvas.fill();
		canvas.restore();
	},
};

Object.assign(XEngine.TilledImage.prototype, XEngine.TilledImage.prototypeExtends);


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

/**
 * Objeto que define un boton
 * 
 * @class XEngine.Button
 * @extends XEngine.BaseObject
 * @constructor
 * 
 * @param {XEngine.Game} game - referencia el objeto del juego
 * @param {Number} posX - posición en x
 * @param {Number} posY - posición en y
 * @param {String} sprite - nombre del sprite guardado en cache
 * @param {String} [spriteDown] - nombre del sprite guardado en cache para cuando se aprieta
 * @param {String} [spriteOver] - nombre del sprite guardado en cache ara cuando se pasa el ratón por encima
 * @param {String} [spriteUp] - nombre del sprite guardado en cache para cuando se suelta
 * 
 */
XEngine.Button = function (game, posX, posY, sprite, spriteDown, spriteOver, spriteUp) {
	XEngine.BaseObject.call(this, game);
	var _this = this;
	_this.spriteNormal = sprite;
	_this.spriteDown = spriteDown || sprite;
	_this.spriteOver = spriteOver || sprite;
	_this.spriteUp = spriteUp || sprite;
	_this.game = game; //guardamos una referencia al juego
	_this._swapSprite(sprite);
	_this.position.setTo(posX, posY);
	_this.inputEnabled = true;

	_this.onClick = new XEngine.Signal();

	_this.onInputDown.add(function () {
		_this._swapSprite(_this.spriteDown);
	}, this);

	_this.onInputOver.add(function () {
		if (!_this.isInputDown)
			_this._swapSprite(_this.spriteOver);
	}, this);

	_this.onInputLeft.add(function () {
		if (!_this.isInputDown)
			_this._swapSprite(_this.spriteNormal);
	}, this);

	_this.onInputUp.add(function () {
		_this.onClick.dispatch();
		if (!_this.isInputOver) {
			_this._swapSprite(_this.spriteUp);
		}
		else {
			_this._swapSprite(_this.spriteOver);
		}
	}, this);
};

XEngine.Button.prototype = Object.create(XEngine.BaseObject.prototype);

XEngine.Button.prototypeExtends = {

	_swapSprite: function (sprite) {
		var _this = this;
		_this.sprite = sprite;
		var new_image = _this.game.cache.image(_this.sprite).image;
		_this.width = new_image.width || 10; //Si la imagen no se ha cargado bien, ponemos valor por defecto
		_this.height = new_image.height || 10;
	},

	_renderToCanvas: function (canvas) { //Sobreescribimos el método render	
		var _this = this;
		canvas.save(); //Guardamos el estado actual del canvas
		var image = _this.game.cache.image(_this.sprite).image; //Obtenemos la imagen a renderizar
		this.applyRotationAndPos(canvas);
		canvas.globalAlpha = _this.alpha; //Aplicamos el alpha del objeto
		var posX = Math.round(-(_this.width * _this.anchor.x));
		var posY = Math.round(-(_this.height * _this.anchor.y));
		//Renderizamos la imagen teniendo en cuenta el punto de anclaje
		canvas.drawImage(image, posX, posY, _this.width, _this.height);
		canvas.restore(); //Restauramos el estado del canvas
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


Object.assign(XEngine.Button.prototype, XEngine.Button.prototypeExtends);


/**
 * Objeto que define un sonido
 * 
 * @class XEngine.Audio
 * @constructor
 * 
 * @param {XEngine.Game} game - referencia el objeto del juego
 * @param {String} audioName - nombre del sonido guardado en cache
 * @param {Boolean} [autoStart=false] - define si el sonido debe empezar al crearse
 * @param {Number} [volume=1] - define el volumen del audio
 * 
 */
XEngine.Audio = function (game, audioName, autoStart, volume) {
	var _this = this;
	_this.game = game;
	_this.isLoop = false;
	_this.audio = _this.game.cache.audio(audioName).audio;
	_this.persist = false;
	_this.volume = volume || 1;
	_this.onComplete = new XEngine.Signal();

	_this.completed = false;
	_this.pendingDestroy = false;
	_this.alive = true;
	if (autoStart) {
		this.play();
	}
};

XEngine.Audio.prototype = {
	update: function () {
		if (this.gainNode != null) {
			this.gainNode.gain.value = this.volume;
		}
	},

	play: function (time) {
		var _this = this;
		_this.source = _this.game.audioContext.createBufferSource();
		_this.source.buffer = _this.audio;
		_this.source.connect(_this.game.audioContext.destination);
		_this.source.onended = function () {
			_this._complete();
		};
		_this.gainNode = _this.game.audioContext.createGain();
		_this.source.connect(_this.gainNode);
		_this.gainNode.connect(_this.game.audioContext.destination);
		_this.gainNode.gain.value = _this.volume;
		this.source.loop = this.isLoop;
		_this.source.start(time || 0);
	},

	stop: function (time) {
		if (this.source)
			this.source.stop(time || 0);
	},

	loop: function (value) {
		this.isLoop = value;
	},

	destroy: function () {
		this.kill();
		this.pendingDestroy = true;
		if (this.onComplete) {
			this.onComplete._destroy();
			delete this.onComplete;
		}
	},

	kill: function () {
		this.alive = false;
		this.stop();
	},

	_complete: function () {
		var _this = this;
		this.stop();
		if (_this.onComplete) {
			_this.onComplete.dispatch();
		}
	}
};

/**
* Un KeyCode representa un botón físico del teclado
*
* @class XEngine.KeyCode
*/
XEngine.KeyCode = {
	/** @static */
	BACKSPACE: 8,
	/** @static */
	TAB: 9,
	/** @static */
	ENTER: 13,

	/** @static */
	SHIFT: 16,
	/** @static */
	CTRL: 17,
	/** @static */
	ALT: 18,

	/** @static */
	PAUSE: 19,
	/** @static */
	CAPS_LOCK: 20,
	/** @static */
	ESC: 27,
	/** @static */
	SPACE: 32,

	/** @static */
	PAGE_UP: 33,
	/** @static */
	PAGE_DOWN: 34,
	/** @static */
	END: 35,
	/** @static */
	HOME: 36,

	/** @static */
	LEFT: 37,
	/** @static */
	UP: 38,
	/** @static */
	RIGHT: 39,
	/** @static */
	DOWN: 40,

	/** @static */
	PRINT_SCREEN: 42,
	/** @static */
	INSERT: 45,
	/** @static */
	DELETE: 46,

	/** @static */
	ZERO: 48,
	/** @static */
	ONE: 49,
	/** @static */
	TWO: 50,
	/** @static */
	THREE: 51,
	/** @static */
	FOUR: 52,
	/** @static */
	FIVE: 53,
	/** @static */
	SIX: 54,
	/** @static */
	SEVEN: 55,
	/** @static */
	EIGHT: 56,
	/** @static */
	NINE: 57,

	/** @static */
	A: 65,
	/** @static */
	B: 66,
	/** @static */
	C: 67,
	/** @static */
	D: 68,
	/** @static */
	E: 69,
	/** @static */
	F: 70,
	/** @static */
	G: 71,
	/** @static */
	H: 72,
	/** @static */
	I: 73,
	/** @static */
	J: 74,
	/** @static */
	K: 75,
	/** @static */
	L: 76,
	/** @static */
	M: 77,
	/** @static */
	N: 78,
	/** @static */
	O: 79,
	/** @static */
	P: 80,
	/** @static */
	Q: 81,
	/** @static */
	R: 82,
	/** @static */
	S: 83,
	/** @static */
	T: 84,
	/** @static */
	U: 85,
	/** @static */
	V: 86,
	/** @static */
	W: 87,
	/** @static */
	X: 88,
	/** @static */
	Y: 89,
	/** @static */
	Z: 90,
	
	/** @static */
	PAD0: 96,
	/** @static */
	PAD1: 97,
	/** @static */
	PAD2: 98,
	/** @static */
	PAD3: 99,
	/** @static */
	PAD4: 100,
	/** @static */
	PAD5: 101,
	/** @static */
	PAD6: 102,
	/** @static */
	PAD7: 103,
	/** @static */
	PAD8: 104,
	/** @static */
	PAD9: 105,

	/** @static */
	F1: 112,
	/** @static */
	F2: 113,
	/** @static */
	F3: 114,
	/** @static */
	F4: 115,
	/** @static */
	F5: 116,
	/** @static */
	F6: 117,
	/** @static */
	F7: 118,
	/** @static */
	F8: 119,
	/** @static */
	F9: 120,
	/** @static */
	F10: 121,
	/** @static */
	F11: 122,
	/** @static */
	F12: 123,

	/** @static */
	SEMICOLON: 186,
	/** @static */
	PLUS: 187,
	/** @static */
	COMMA: 188,
	/** @static */
	MINUS: 189,
	/** @static */
	PERIOD: 190,
	/** @static */
	FORWAD_SLASH: 191,
	/** @static */
	BACK_SLASH: 220,
	/** @static */
	QUOTES: 222
};
