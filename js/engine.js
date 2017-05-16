var XEngine = {
	version: '0.7-alpha'
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
	 * Referencia al elemento canvas
	 * 
	 * @property {HTMLElement} reference
	 * @readonly
	 */
	this.reference = document.getElementById(idContainer);
	/**
	 * Posición por defecto del juego
	 * 
	 * @property {XEngine.Vector} position
	 * @readonly
	 * @private
	 */
	this.position = new XEngine.Vector(0,0);
	/**
	 * Ancho del juego
	 * 
	 * @property {Number} width
	 * @public
	 */
	this.width = width;															
	/**
	 * Alto del juego
	 * 
	 * @property {Number} height
	 * @public
	 */
	this.height = height;
	/**
	 * Ancho del mundo (al iniciar es igual que el del juego)
	 * 
	 * @property {Number} worldWidth
	 * @public
	 */
	this.worldWidth = width;													
	/**
	 * Alto del mundo (al iniciar es igual que el del juego)
	 * 
	 * @property {Number} height
	 * @public
	 */
	this.worldHeight = height;

	this.reference.setAttribute('width', width+'px');							//asignamos el ancho del canvas
	this.reference.setAttribute('height', height+'px');							//asignamos el alto del canvas
	
	/**
	 * Contexto 2D del canvas
	 * 
	 * @property {CanvasRenderingContext2D} canvas
	 * @readonly
	 */
	this.canvas = this.reference.getContext('2d');
	
	window.AudioContext = window.AudioContext||window.webkitAudioContext;
	
	/**
	 * Contexto del audio
	 * 
	 * @property {AudioContext} audioContext
	 * @readonly
	 */
	this.audioContext = new AudioContext();
	/**
	 * Limite de frames por segundo
	 * 
	 * @property {Number} frameLimit
	 * @default
	 */
	this.frameLimit = 30;
	/**
	 * Tiempo tiempo en el que se arrancó el juego
	 * 
	 * @property {Number} _startTime
	 * @readonly
	 * @private
	 */
	this._startTime = 0;
	/**
	 * Tiempo desde que se arrancó el juego
	 * 
	 * @property {Number} _elapsedTime
	 * @readonly
	 * @private
	 */
	this._elapsedTime = 0;
	/**
	 * Tiempo en el que transcurre el frame
	 * 
	 * @property {Number} frameTime
	 * @readonly
	 */
	this.frameTime = 0;
	/**
	 * Tiempo en el que transcurrió el último frame
	 * 
	 * @property {Number} previousFrameTime
	 * @readonly
	 */
	this.previousFrameTime = 0;
	/**
	 * Tiempo entre frames en segundos
	 * 
	 * @property {Number} deltaTime
	 * @readonly
	 */
	this.deltaTime = 0;
	/**
	 * Tiempo entre frames en milisegundos
	 * 
	 * @property {Number} deltaMillis
	 * @readonly
	 */
	this.deltaMillis = 0;
	
	/**
	 * Determina si el juego está pausado o no
	 * 
	 * @property {Bool} pause
	 */
	this.pause = false;
	
	/**
	 * Array con las referencias de todos los objetos añadidos directamente al juego
	 * 
	 * @property {Array} gameObjects
	 */
	this.gameObjects = null;
	/**
	 * Estado en el que está actualmente el juego
	 * 
	 * @property {Object} state
	 */
	this.state = null;
	/**
	 * Fábrica de objetos. Esto ofrece acceso al creador de objetos
	 * 
	 * @property {XEngine.ObjectFactory} add
	 * @readonly
	 */
	this.add = null;
	/**
	 * Motor de físicas
	 * 
	 * @property {XEngine.Physics} physics
	 * @readonly
	 * @private
	 */
	this.physics = null;
	/**
	 * Tween Manager. Da acceso a la creación de tweens.
	 * 
	 * @property {XEngine.TweenManager} tween
	 * @readonly
	 */
	this.tween = null;
	/**
	 * Caché del juego. Aquí se almacenan todos los assets que se cargan
	 * 
	 * @property {XEngine.Cache} cache
	 * @readonly
	 */
	this.cache = null;
	/**
	 * Loader. Da acceso a la carga de assets
	 * 
	 * @property {XEngine.Loader} load
	 * @readonly
	 */
	this.load = null;
	/**
	 * Camara del juego
	 * 
	 * @property {XEngine.Camera} camera
	 */
	this.camera = null;
	/**
	 * Renderer del juego.
	 * 
	 * @property {XEngine.Cache} renderer
	 * @readonly
	 * @private
	 */
	this.renderer = null;
	/**
	 * Scale manager
	 * 
	 * @property {XEngine.ScaleManager} scale
	 * @readonly
	 */
	this.scale = null;
	/**
	 * Define si se está ejecutando en móvil o no
	 * 
	 * @property {Bool} cache
	 * @readonly
	 */
	this.isMobile = false;
	/**
	 * Input manager. Da acceso al inputManager
	 * 
	 * @property {XEngine.InputManager} input
	 * @readonly
	 */
	this.input = null;
	
	/**
	 * Define el ancho de los tiles (para perspectiva isometrica)
	 * 
	 * @property {Number} ISO_TILE_WIDTH
	 * @public
	 */
	this.ISO_TILE_WIDTH = 32;
	
	/**
	 * Define el alto de los tiles (para perspectiva isometrica)
	 * 
	 * @property {Number} ISO_TILE_HEIGHT
	 * @public
	 */
	this.ISO_TILE_HEIGHT = 32;
	
	this.init();																//iniciamos el juego
	
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
	init : function () {
		var _this = this;
		console.log('Game engine ' + XEngine.version + ' arrancado con canvas!!!');
		_this._startTime = Date.now();
		_this._elapsedTime = 0;
		_this.frameTime = 0;		_this.previousFrameTime = 0;
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
		_this.scale = new XEngine.ScaleManager(_this);
		_this.scale.init();
		_this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent); //Obtiene si se está ejecutando en un dispositivo móvil
		_this.input = new XEngine.InputManager(_this);
		this.update();															//Iniciamos el loop
	},
	
	/**
	 * Asigna el color de background del canvas
	 * 
	 * @method XEngine.Game#setBackgroundColor
	 * @param {String} color - El color a poner de fondo
	 */
	setBackgroundColor: function (color) {
		this.reference.style.backgroundColor = color;
	},
	
	/**
	 * Llamado automaticamente en cada frame
	 * 
	 * @method XEngine.Game#update
	 * @private
	 */
	update : function () {
		var _this = this;
		if(window.requestAnimationFrame){
			window.requestAnimationFrame(XEngine.Game._updateCaller);
		}else{
			clearTimeout(_this.timer);                       						//limpiamos el timer para que no se quede en memoria
			_this.timer = setTimeout(XEngine.Game._updateCaller, _this.frameLimit / 1);
		}
		
		_this.elapsedTime = Date.now() - _this._startTime;						//tiempo transcurrido desde que se creó el juego
		_this.frameTime = _this.elapsedTime;									//tiempo en el que transcurre este frame
		_this.deltaMillis = (_this.frameTime - _this.previousFrameTime);		//tiempo entre frames (en milisegundos)
		_this.deltaTime = _this.deltaMillis / 1000;								//tiempo entre frames (en segundos)
		if(1/_this.frameLimit > _this.deltaTime) return;
		_this.previousFrameTime = _this.frameTime;								//guardamos el tiempo de este frame para después calcular el delta time
		if(_this.pause) return;
		if(_this.state.currentState == null) return;							//Si no hay arrancado ningún estado, saltamos el update
		if(!this.load.preloading){												//Si no estamos precargando los assets, ejecutamos el update
			for(var i = _this.gameObjects.length - 1; i >= 0; i--)				//Recorremos los objetos del juego para hacer su update
			{
				var gameObject = _this.gameObjects[i];
				if(gameObject.isPendingDestroy)									//Si es un objeto destruido lo eliminamos del array
				{
					if(gameObject.body != undefined){							//Si tiene un body, también lo destruimos
						gameObject.body.destroy();
						delete _this.gameObjects[i].body;						//Liberamos memoria
					}
					delete _this.gameObjects[i];								//Liberamos memoria
					_this.gameObjects.splice(i, 1);
				}
				else if(gameObject.alive)		//En caso contrario miramos si contiene el método update y está vivo, lo ejecutamos
				{	
					if(gameObject.update != undefined){
						gameObject.update(_this.deltaTime);
					}
					if(XEngine.Sprite.prototype.isPrototypeOf(gameObject)){
						gameObject._updateAnims(_this.deltaMillis);
					}
				}
			}
			
			if(_this.state.currentState.update != undefined){
				_this.state.currentState.update(_this.deltaTime);				//Llamamos al update del estado actual
			}
			
			_this.camera.update(_this.deltaTime);								//Actualizamos la cámara
			_this.tween._update(_this.deltaMillis);								//Actualizamos el tween manager
			
			if(_this.physics.systemEnabled){
				_this.physics.update(_this.deltaTime);							//Actualizamos el motor de físicas
				if(_this.state.currentState.physicsUpdate != undefined){
					_this.state.currentState.physicsUpdate();
				}
			}																	//Llamamos al handler de condición de fin;
		}			
		_this.renderer.render();												//Renderizamos la escena
	},
	
	/**
	 * Se llama cuando se inicia un nuevo estado
	 * 
	 * @method XEngine.Game#destroy
	 * @private
	 */
	destroy: function () {														//Este paso se llama cuando se cambia de un estado a otro
		for(var i = this.gameObjects.length - 1; i >= 0; i--)					//Destruimos todos los objetos del juego
		{
			var gameObject = this.gameObjects[i];
			if(gameObject.destroy != undefined)						
			{
				if(!gameObject.persist){
					gameObject.destroy();
					if(gameObject.body != undefined){								//Si tienen un body, lo destruimos también
						gameObject.body.destroy();
						delete this.gameObjects[i].body;							//Liberamos memoria
					}
					delete this.gameObjects[i];										//Liberamos memoria
					this.gameObjects.splice(i, 1);
				}
			}
		}
		this.physics._destroy();												//Llamamos a los destroy de los distintos componentes
		this.tween._destroy();
		delete this.camera;														//Liberamos la memoria de la camara para crear una nueva								
		this.camera = new XEngine.Camera(this);	
	},
	
	/**
	 * Unicamente para que los hijos directos del estado no tengan una referencia nula a este método
	 * 
	 * @method XEngine.Game#getWorldPos
	 * @private
	 * @returns {XEngine.Vector}
	 */
	getWorldPos : function () {
    	return this.position;
    },
    
    
    /**
	 * Unicamente para que los hijos directos del estado no tengan una referencia nula a este método
	 * 
	 * @method XEngine.Game#getTotalRotation
	 * @private
	 * @returns {Number}
	 */
    getTotalRotation : function () {
    	return 0;
    }
};

// ----------------------------------------- CAMERA ------------------------------------------//

/**
 * Enum para limitar los ejes en los que se puede mover la camara
 * 
 * @enum {String}
 * @readonly
 */
XEngine.AXIS = {
	NONE: "none", 
	HORIZONTAL: "horizontal", 
	VERTICAL: "vertical", 
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
	 * Referencia al juego
	 * 
	 * @property {XEngine.Game} game
	 * @private
	 * @readonly
	 */
	this.game = game;
	/**
	 * Posición actual de la camara
	 * 
	 * @property {XEngine.Vector} position
	 */
	this.position = new XEngine.Vector(0,0);
	/**
	 * Objeto que tiene que seguir la camara. Si es nulo no sigue a nada
	 * Se cambia con {@link #followObject}.
	 * @property {XEngine.BaseObject} followedObject
	 * 
	 * @protected
	 */
	this.followedObject = null;
	/**
	 * Ejes en los que se puede mover la cámara
	 * 
	 * @property {XEngine.AXIS} axis
	 */
	this.axis = XEngine.AXIS.BOTH;
};

XEngine.Camera.prototype = {
	/**
	 * Asigna el objeto que tiene que seguir la cámara
	 * @method XEngine.Camera#followObject
	 * @param {XEngine.BaseObject} gameObject - Objeto a seguir
	 * @param {Number} offsetLeft - Offset que tendrá por la izquierda
	 * @param {Number} offsetUp - Offset que tendrá por arriba
	 */
	followObject: function(gameObject, offsetLeft, offsetUp){					//Asigna el objeto a seguir
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
	update: function () {														//Si tiene objeto a seguir, intenta alcanzarlo si el movimiento de los ejes se lo permite y si no se sale del mundo
		var _this = this;
		if(_this.followedObject != null){
			if(_this.axis == XEngine.AXIS.BOTH || _this.axis == XEngine.AXIS.HORIZONTAL){
				if((_this.followedObject.position.x - _this.offsetLeft) - _this.game.width / 2 > 0 && (_this.followedObject.position.x + _this.offsetLeft) + _this.game.width / 2 < _this.game.worldWidth){
					_this.position.x = _this.followedObject.position.x - _this.game.width / 2 - _this.offsetLeft;
				}
			}
			if(_this.axis == XEngine.AXIS.BOTH || _this.axis == XEngine.AXIS.VERTICAL){
				if((_this.followedObject.position.y - _this.offsetUp) - _this.game.height / 2 > 0 && (_this.followedObject.position.y + _this.offsetUp) + _this.game.height / 2 < _this.game.worldHeight){
					_this.position.y = _this.followedObject.position.y - _this.game.height / 2 - _this.offsetUp;
				}		
			}
		}
	},
};
// ----------------------------------------- STATE MANAGER ------------------------------------------//


XEngine.StateManager = function (game) {
	this.game = game;
	this.states = new Array();
	this.currentState = null;
	this.currentStateName = null;
};

XEngine.StateManager.prototype = {
	/**
	 * Añade un estado al array de estados
	 * @method XEngine.StateManager#add
	 * @param {String} stateName - KeyName del estado
	 * @param {Object} stateClass - Objeto de la clase del estado
	 */
	add : function (stateName, stateClass) {									//Añade un estado al array de estados
		this.states[stateName] = stateClass;
	},
	
	/**
	 * Arranca un estado
	 * @method XEngine.StateManager#start
	 * @param {String} stateName - KeyName del estado
	 */
	start : function (stateName) {												//Iniciamos un nuevo estado
		var _this = this;
		if(_this.currentState != null){
			_this.game.destroy();												//Llamamos al destroy del game si venimos de otro estado
			if(_this.currentState.destroy != undefined){
				_this.currentState.destroy();									//Llamammos al destroy del estado si este lo tiene implementado
			}
			delete _this.currentState;											//Liberamos la memoria del objeto almacenado
			_this.currentState = null;											//asignamos a null el estado
		}
         var state = _this.states[stateName];									//Obtener el estado al que queremos ir
         
         if(state == null){														//Si no existe mostramos un error y paramos la ejecución;
         	console.error("no state for name " + stateName);					
         	return;
         }

         _this.currentState = new state(_this.game);							//Creamos el nuevo estado y lo ponemos como actual
         _this.currentState.game = _this.game;									//Asignamos la referencia de game al estado
         _this.currentState.stateName = stateName;								//Asignamos el propio nombre del estado
         if(_this.currentState.preload != undefined){							//Si el estado tiene preload, lo llamamos
         	_this.currentState.preload();
         }
         _this.game.load._startPreload();										//Una vez se ha llamado al preload del estado, podemos proceder a cargar los assets
	},
	
	/**
	 * Reinicia el estado actual
	 * @method XEngine.StateManager#restart
	 */
	restart : function () {
		this.start(this.currentState.stateName);								//Reiniciamos el estado actual
	}
};


// ----------------------------------------- PRELOADER AND CACHE ------------------------------------------//
XEngine.Loader = function (game) {
	this.game = game;
	this.pendingLoads = new Array();											//Objetos a cargar
	this.progress = 0;															//Progreso (de 0 a 1 == de 0% a 100%)
	this.preloading = false;													//En progreso de precarga, por defecto a false
	this.onCompleteFile = new XEngine.Signal();									//Evento que se dispara cada vez que se completa una descarga. Envía el progreso actual
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
		if(this.pendingLoads.length == 0) {										//Si no hay cargas pendientes, llama directamente al start
			this._callStart();
		}else{																	//En caso contrario llama al load de cada objeto a cargar
			for(var i = 0; i < this.pendingLoads.length; i++){
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
		
		for(var i = 0; i < this.pendingLoads.length; i++){						//Recorremos las cargas pendientes para ver cuales se han completado
			if(this.pendingLoads[i].completed){
				completedTasks++;
			}
		}
		
		this.progress = completedTasks / this.pendingLoads.length;				//Calculamos el progreso
		this.onCompleteFile.dispatch(this.progress);							//Disparamos el evento
			
		if(this.progress == 1){													//Si el progreso llega al 100% terminamos, liberamos memoria y llamamos al start
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
		this.game.state.currentState.start();									//Llama al start del estado actual
	},
};

XEngine.ImageLoader = function (imageName, imageUrl, loader, frameWidth, frameHeight) {
	this.imageName = imageName;													//Nombre de la imagen a guardar en chache
	this.imageUrl = imageUrl;													//Url de la imagen (con extension y todo)
	this.completed = false;												
	this.loader = loader;														//Referencia al loader
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
		var newImage = {														//Creamos el objeto a guardar en cache
			imageName : _this.imageName,										//Nombre de la imagen
			image: null,														//Referencia de la imagen
			frameWidth : _this.frameWidth,
			frameHeight: _this.frameHeight,
			data: new Array(),
		};
		var img1 = new Image();													//Creamos el objeto Image
		var handler = function () {												//Creamos el handler de cuando se completa o da error
        	var imageRef = _this.loader.game.cache.images[_this.imageName];		//Obtenemos la imagen de cache
        	imageRef.image = this;												//Asignamos la referencia
        	_this.completed = true;												//Marcamos como completado
        
        	if(_this.frameWidth == 0){
        		imageRef.frameWidth = this.width;
        	}else{
        		imageRef.frameWidth = _this.frameWidth;
        	}
        	
        	if(_this.frameHeight == 0){
        		imageRef.frameHeight = this.height;
        	}else{
        		imageRef.frameHeight = _this.frameHeight;
        	}
        	
        	var canvas = document.createElement("canvas");
	        canvas.width =this.width;
	        canvas.height =this.height;
	
	        var ctx = canvas.getContext("2d");
	        ctx.drawImage(this, 0, 0);
	
	        var data = ctx.getImageData(0,0, this.width, this.height).data;
	        
	        //Push pixel data to more usable object
	        for(var i = 0; i < data.length; i+=4){
	        	var rgba = {
	        		r: data[i],
	        		g: data[i+1],
	        		b: data[i+2],
	        		a: data[i+3]
	        	};
	        	
	        	imageRef.data.push(rgba);
	        }
        	
        	_this.loader._notifyCompleted();									//Notificamos de que la carga se ha completado
        };
        img1.onload = handler;													//Asignamos los handlers
        img1.onerror = handler;
        img1.src = _this.imageUrl;												//Asignamos la url al objeto imagen
		_this.loader.game.cache.images[_this.imageName] = newImage;				//Guardamos nuesto objeto de imagen en cache para luego recogerlo
	}	
};

XEngine.AudioLoader = function (audioName, audioUrl, loader) {
	this.audioName = audioName;													//Nombre del audio a guardar en chache
	this.audioUrl = audioUrl;													//Url del audio (con extension y todo)
	this.completed = false;												
	this.loader = loader;														//Referencia al loader
};

XEngine.AudioLoader.prototype = {
	/**
	 * Arranca la carga del audio
	 * @method XEngine.AudioLoader#load
	 * @private
	 */
	load: function () {
		var _this = this;
		var newAudio = {														//Creamos el objeto a guardar en cache
			audioName : _this.audioName,										//Nombre del audio
			audio: null,														//Referencia del audio
			decoded: false,														//El audio ya está decodificado?
		};
		var request = new XMLHttpRequest();
		request.open('GET', _this.audioUrl, true);
		request.responseType = 'arraybuffer';
		var handler = function () {												//Creamos el handler de cuando se completa o da error
        	var audioRef = _this.loader.game.cache.audios[_this.audioName];		//Obtenemos el audio de cache
        	if(request.status == 200){
	        	_this.loader.game.audioContext.decodeAudioData(request.response, function(buffer) {
			    	audioRef.audio = buffer;
			    	audioRef.decoded = true;
			    	_this.completed = true;
			    	_this.loader._notifyCompleted();
			    }, function(){
			    	_this.completed = true;										//Marcamos como completado
        			_this.loader._notifyCompleted();
			    });
        	}else{
        		_this.completed = true;											//Marcamos como completado
        		_this.loader._notifyCompleted();								//Notificamos de que la carga se ha completado
        	}
        };
        request.onload = handler;
		_this.loader.game.cache.audios[_this.audioName] = newAudio;				//Guardamos nuesto objeto de audio en cache para luego recogerlo
		request.send();
	}	
};


XEngine.Cache = function (game) {
	this.game = game;
	this.images = new Array();													//Cache de imagenes
	this.audios = new Array();													//Cache de audios
};

XEngine.Cache.prototype = {
	/**
	 * Devuelve una imagen guardada en cache
	 * @method XEngine.Cache#image
	 * @param {String} imageName - keyName de la imagen
	 * @private
	 */
	image: function(imageName){
		if(this.images[imageName] == undefined){
			console.error('No hay imagen para el nombre: '+ imageName);	
		}else{
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
		if(this.audios[audioName] == undefined){
			console.error('No hay audio para el nombre: '+ audioName);	
		}else{
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

XEngine.Renderer = function (game, context) {
	this.game = game;
	this.scale = {x: 1, y: 1};
	this.context = context;
};

XEngine.Renderer.prototype = {
	/**
	 * Inicia el proceso de render
	 * @method XEngine.Renderer#render
	 * @private
	 */
	render: function () {
		this.context.clearRect(0, 0, this.game.width * this.scale.x, this.game.height * this.scale.y);				//Limpiamos el canvas
		this.context.save();
		this.context.scale(this.scale.x, this.scale.y);
		this.renderLoop(this.game.gameObjects);
		this.context.restore();
	},
	
	/**
	 * Loop que llama al render de todos los objetos. Si es un grupo, se llama a si misma.
	 * @method XEngine.Renderer#renderLoop
	 * @param {Array} arrayObjects - Array de objetos a renderizar
	 * @private
	 */
	renderLoop: function (arrayObjects) {											//Renderizamos el array de objetos que le pasamos por parametro
		var _this = this;
		for(var i = 0; i < arrayObjects.length; i++){							
			var object = arrayObjects[i];
			if(!object.render) continue;
			if(XEngine.Group.prototype.isPrototypeOf(object)){					//Si es un grupo, llamamos al render pasando los objetos que contiene
				_this.renderLoop(object.children);
			}else if(!XEngine.Audio.prototype.isPrototypeOf(object)){			//Si no es un audio, renderizamos
				if(!object.alive) continue;
				if(object.sprite == 'player'){
					console.log("cosa");
				}
				object._renderToCanvas(_this.context);							
				if(object.body != undefined){
					object.body._renderBounds(_this.context);					//Si tiene un body, llamamos al render de los bounds
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
	 * @return {Array}
	 */
	getFrameInfo: function () {
        var data = this.context.getImageData(0,0, this.game.width, this.game.height).data;
        var returnData = new Array();
        //Push pixel data to more usable object
        for(var i = 0; i < data.length; i+=4){
        	var rgba = {
        		r: data[i],
        		g: data[i+1],
        		b: data[i+2],
        		a: data[i+3]
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
	 * @return {Array}
	 */
	getPixelInfo: function (posX, posY) {
		var data = this.context.getImageData(Math.round(posX),Math.round(posY), 1, 1).data;
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

XEngine.ScaleManager = function (game) {
	this.game = game;
	this.scaleType = XEngine.Scale.NO_SCALE;
	this.orientation = 'landScape';
	this.sourceAspectRatio = 0;
};

XEngine.Scale = {
	FIT : 0,
	SHOW_ALL: 1,
	NO_SCALE : 2,
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
	 * @private
	 */
	updateScale: function () {
		if(this.scaleType !== XEngine.Scale.NO_SCALE){
			var newWidth = 0;
			var newHeight = 0;
			if(this.scaleType === XEngine.Scale.FIT){
				newWidth = window.innerWidth;
				newHeight = window.innerHeight;
			}else{
				this.sourceAspectRatio = this.game.width / this.game.height;
				newHeight = window.innerHeight;
				newWidth = newHeight * this.sourceAspectRatio;
				if(newWidth > window.innerWidth){
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
	 * @private
	 */
	resizeCanvas: function(newWidth, newHeight){
		this.game.reference.setAttribute('width', newWidth);
		this.game.reference.setAttribute('height', newHeight);
		this.game.renderer.setScale(newWidth / this.game.width, newHeight / this.game.height);
	},
};

// ----------------------------------------- OBJECT FACTORY ------------------------------------------//

XEngine.ObjectFactory = function (game) {
	this.game = game;
};

XEngine.ObjectFactory.prototype = {
	/**
	 * Añade un objeto ya existente (creado con new) al juego
	 * @method XEngine.ObjectFacory#existing
	 * @param {XEngine.BasicObject} gameObject - Objeto a añadir
	 * @return {Object}
	 * @private
	 */
	existing : function (gameObject) {											//Añade un objeto que ya ha sido creado
		this.game.gameObjects.push(gameObject);									//Añadimos el objeto al array de objetos
		gameObject.parent = this.game;											//Asignamos el padre del objeto
		if(gameObject.start != undefined){
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
	 * @private
	 */
	sprite : function (posX, posY, sprite) {									//Creamos y añadimos un sprite a partir de los datos proporcionados
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
	 * @private
	 */
	tilled : function (posX, posY, sprite, width, height) {						//Creamos y añadimos una imagen que se puede tilear
		var gameObject = new XEngine.TilledImage(this.game, posX, posY, sprite, width, height);
		return this.existing(gameObject);
	},
	
	rect : function (posX, posY, width, height, color) {			//Creamos un rectangulo a partir de los datos proporcionados
		var gameObject = new XEngine.Rect(this.game, posX, posY, width, height, color);
		return this.existing(gameObject);
	},
	
	circle : function (posX, posY, radius, color, stroke, strokeColor, fill, startAngle, endAngle) {			//Creamos un rectangulo a partir de los datos proporcionados
		var gameObject = new XEngine.Circle(this.game, posX, posY, radius, color, stroke, strokeColor, fill, startAngle, endAngle);
		return this.existing(gameObject);
	},
	
	text : function (posX, posY, text, textStyle) {
		var gameObject = new XEngine.Text(this.game, posX, posY, text, textStyle);
		return this.existing(gameObject);
	},
	
	audio: function (audio, autoStart, volume) {
		var audioObject = new XEngine.Audio(this.game, audio, autoStart, volume);
		return this.existing(audioObject);
	},
	
	group : function (posX, posY) {												//Creamos y añadimos un grupo
		var x = posX || 0;
		var y = posY || 0;
		var gameObject = new XEngine.Group(this.game, x, y);
		return this.existing(gameObject);
	}
};

// ----------------------------------------- TWEENS ------------------------------------------//

XEngine.TweenManager = function(game){
	this.game = game;
	this.tweens = new Array();
};

XEngine.TweenManager.prototype = {												
	
	add : function (target) {													//Añade un tween para el objeto que se le pasa por parametro
		var tween = new XEngine.Tween(target);
		this.tweens.push(tween);
		return tween;
	},
	
	_update : function (deltaTimeMillis) {											
		var _this = this;
		for(var i = _this.tweens.length - 1; i >= 0; i--)						//Recorremos todos los tweens que han sido creados
		{
			var tween = _this.tweens[i];
			if(tween.isPendingDestroy){											//Si el tween está marcado para destruir, liberamos memoria y lo quitamos del array
				delete _this.tweens[i];
				_this.tweens.splice(i, 1);
			}else if(tween.isRunning) {											//Si está en marcha, lo actualizamos
				tween._update(deltaTimeMillis);
			}else if(tween.autoStart && !tween.started){						//Si no está en marcha pero tiene autoStart, lo arrancamos
				tween.play();
			}
		}
	},
	
	_destroy: function () {
		for(var i = this.tweens.length - 1; i >= 0; i--)						//Liberamos la memoria de todos los tweens que teníamos creados
		{
			this.tweens[i].destroy();
			delete this.tweens[i];
			delete this.tweens;
		}
		
		this.tweens = new Array();
	}
};

XEngine.Tween = function (target) {
	this.isPendingDestroy = false;	
	this.started = false;
	this.target = target;
	this.fromProperties = new Array();											//Propiedades de inicio
	this.properties = new Array();												//Propiedades a las que se quiere llegar
	this.duration = 0;
	this.autoStart = true;
	this.easing = undefined;													//Funcion de Easing
	this.delay = 0;
	this.repeat = 0;															//Cantidad de veces a repetir
	this.runCount = 0;															//Cantidad de veces que se ha ejecutado el tween desde el principio
	this.isRunning = false;
	this.progress = 0;
	this.time = 0;																//Tiempo que lleva corriendo el tween
	this.yoyo = false;															//Determina si el tween solo va a las propiedades asignadas o también vuelve a las originales
	this.onComplete = new XEngine.Signal();										//Se llama al completarse el tween
	this.onCompleteLoop = new XEngine.Signal();									//Se llama al completarse un loop del tween
	this.reverse = 1;
};

XEngine.Tween.prototype = {
	
	play : function () {
		var _this = this;
		_this.started = true;													//Marcamos que ya se ha llamado al play
		var timer = setTimeout(function () {									//Le aplica el delay
			clearTimeout(timer);												//Limpiamos el timer una vez que se ejecuta
			_this._startTween();
		}, _this.delay);
	},
	
	_startTween : function () {
		this.runCount++;														//Aumentamos el contador de ejecuciones
		for(var property in this.properties){
			this.target[property] = this.fromProperties[property];				//Asignamos las propiedades de inicio al objetivo
		}
		this.isRunning = true;													//Marcamos como que se está ejecutando
	},
	
	complete : function () {
		this.time = this.duration;
		for(var property in this.properties){									//Para cada propiedad, calculamos su valor actual y se lo asignamos al objetivo
			this.target[property] = this.fromProperties[property];
		}
	},
	
	_update: function (deltaTime) {
		if(this.target == undefined || this.target == null) {this._destroy(); return;}	//Si el target ha sido destruido, destruimos el tween
		var _this = this;
		_this.progress = XEngine.Mathf.clamp(_this.time / _this.duration, 0, 1);	//Calculamos el progreso del tween basado en el tiempo que está corriendo y la duración
		for(var property in _this.properties){									//Para cada propiedad, calculamos su valor actual y se lo asignamos al objetivo
			var t = _this.progress;
			if(_this.yoyo){
				if(t <= 0.5){
					t *= 2;
				}else{
					var t2 = (t - 0.5) * 2;
					t = XEngine.Mathf.lerp(1,0, t2);
				}
			}
			this.target[property] = XEngine.Mathf.lerp(_this.fromProperties[property], _this.properties[property], _this.easing(t));
		}
		_this.time += deltaTime * this.reverse;									//Incrementamos el tiempo de ejecución
		if((_this.progress == 1)){												//Si el tween llega al final, se comprueba si tiene que hacer loop o ha acabado
			if(_this.repeat == -1 || _this.runCount <= _this.repeat){
				_this.onCompleteLoop.dispatch();
				_this.time = 0;
				_this.progress = 0;
				_this.play();
			}else{
				_this.onComplete.dispatch();
				_this.destroy();
			}
		}
		
	},
	
	to : function (properties, duration, ease, autoStart, delay, repeat, yoyo) {
		for(var property in properties){										//Se asignan todas las propiedades de las que se proviene
			this.fromProperties[property] = this.target[property];
		}
		this.properties = properties;											//Se asignan las propiedades a las que se quieren llegar
		this.duration = duration;												//Se asigna la duración, easing, etc
		this.easing = ease;
		this.autoStart = autoStart || true;
		this.delay = delay || 0;
		this.repeat = repeat || 0;
		this.yoyo = yoyo || false;
		return this;
	},
	
	destroy: function () {														//Se destruye el tween y se libera memoria 
		this.isRunning = false;
		this.isPendingDestroy = true;
		if(this.onComplete != undefined){
			this.onComplete._destroy();
		}
		if(this.onCompleteLoop != undefined){
			this.onCompleteLoop._destroy();
		}
		delete this.onComplete;
		delete this.onCompleteLoop;
		delete this.fromProperties;
		delete this.properties;
	},
	
	from : function (properties) {												//Asigna unas propiedades iniciacles definidas por el usuario
		for(var property in properties){
			this.fromProperties[property] = properties[property];
		}
	}
	
};


XEngine.Easing = {																//Todas las funciones de Easing
	Linear: function (t) { return t },
	QuadIn: function (t) { return t*t },
	QuadOut: function (t) { return t*(2-t) },
	QuadInOut: function (t) { return t<.5 ? 2*t*t : -1+(4-2*t)*t },
	CubicIn: function (t) { return t*t*t },
	CubicOut: function (t) { return (--t)*t*t+1 },
	CubicInOut: function (t) { return t<.5 ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1 },
	QuartIn: function (t) { return t*t*t*t },
	QuartOut: function (t) { return 1-(--t)*t*t*t },
	QuartInOut: function (t) { return t<.5 ? 8*t*t*t*t : 1-8*(--t)*t*t*t },
	QuintIn: function (t) { return t*t*t*t*t },
	QuintOut: function (t) { return 1+(--t)*t*t*t*t },
	QuintInOut: function (t) { return t<.5 ? 16*t*t*t*t*t : 1+16*(--t)*t*t*t*t },
	SinIn: function(t){ if(t === 0) return 0; if(t === 1) return 1; return Math.cos(t * Math.PI / 2); },
	SinOut: function(t){if (t === 0) return 0; if (t === 1) return 1; return Math.sin( t * Math.PI / 2 );},
	SinInOut: function(t){if (t === 0) return 0; if (t === 1) return 1; return 0.5 * (1 - Math.cos( Math.PI * t)) },
	ExpoIn : function(t){ return t===0 ? 0: Math.pow(1024, t -1) },
	ExpoOut : function(t){return t===1 ? 1 : 1 - Math.pow(2, -10 * t)},
	ExpoInOut: function (t) {

        if (t === 0) return 0;
        if (t === 1) return 1;
        if (( t *= 2) < 1) return 0.5 * Math.pow(1024, t - 1);
        return 0.5 * (- Math.pow( 2, - 10 * ( t - 1 ) ) + 2);

    },
    CircularIn:function(t){return 1 - Math.sqrt(1 - t * t)},
    CircularOut: function(t){return Math.sqrt(1 - (--t * t))},
    CircularInOut: function(t){
    	if ((t *= 2) < 1) return - 0.5 * (Math.sqrt( 1 - t * t) - 1);
        return 0.5 * (Math.sqrt(1 - (t -= 2) * t) + 1);
    },
    ElasticIn: function (t) {
    	var s, a = 0.1, p = 0.4;
        if (t === 0) return 0;
        if (t === 1) return 1;
        if (!a || a < 1) { a = 1; s = p / 4; }
        else s = p * Math.asin(1 / a) / (2 * Math.PI);
        return - (a * Math.pow(2, 10 * (t -= 1 )) * Math.sin((t - s) * (2 * Math.PI) / p ) );
    },
    ElasticOut:function(t){
    	var s, a = 0.1, p = 0.4;
        if (t === 0) return 0;
        if (t === 1) return 1;
        if (!a || a < 1) { a = 1; s = p / 4; }
        else s = p * Math.asin(1 / a) / (2 * Math.PI);
        return ( a * Math.pow(2, - 10 * t) * Math.sin((t - s) * (2 * Math.PI) / p) + 1);
    },
    ElasticInOut:function(t){
    	var s, a = 0.1, p = 0.4;
        if (t === 0) return 0;
        if (t === 1) return 1;
        if (!a || a < 1) { a = 1; s = p / 4; }
        else s = p * Math.asin(1 / a) / (2 * Math.PI);
        if ((t *= 2) < 1) return - 0.5 * ( a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t - s ) * (2 * Math.PI) / p ) );
        return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t - s) * (2 * Math.PI) / p) * 0.5 + 1;
    },
    BackIn:function(t){
    	 var s = 1.70158;
         return t * t * ((s + 1) * t - s);
    },
    BackOut:function(t){
    	var s = 1.70158;
        return --t * t * ((s + 1) * t + s) + 1;
    },
    BackInOut:function(t){
    	var s = 1.70158 * 1.525;
        if ((t *= 2) < 1) return 0.5 * (t * t * ((s + 1) * t - s));
        return 0.5 * ((t -= 2) * t * ((s + 1) * t + s) + 2);
    },
    BounceIn:function(t){
    	return 1 - XEngine.Easing.BounceOut(1 - t);
    },
    BounceOut:function(t){
    	if (t < ( 1 / 2.75)) {
            return 7.5625 * t * t;
        } else if ( t < ( 2 / 2.75 ) ) {
            return 7.5625 * ( t -= ( 1.5 / 2.75 ) ) * t + 0.75;
        } else if ( t < ( 2.5 / 2.75 ) ) {
            return 7.5625 * ( t -= ( 2.25 / 2.75 ) ) * t + 0.9375;
        } else {
            return 7.5625 * ( t -= ( 2.625 / 2.75 ) ) * t + 0.984375;
        }
    },
    BounceInOut:function(t){
    	if ( t < 0.5 ) return XEngine.Easing.BounceIn( t * 2 ) * 0.5;
        return XEngine.Easing.BounceOut( t * 2 - 1 ) * 0.5 + 0.5;
    },
};

// ----------------------------------------- EVENTS ------------------------------------------//

XEngine.Signal = function () {
	this.bindings = new Array();												//Listener que tiene la señal
};

XEngine.Signal.prototype = {
	add : function (listener, listenerContext) {								//Añade un listener que siempre se ejecuta
		this.bindings.push(new XEngine.SignalBinding(this, listener, listenerContext, false));
	},
	
	addOnce : function (listener, listenerContext) {							//Añade un listener que solo se ejecuta una vez
		this.bindings.push(new XEngine.SignalBinding(this, listener, listenerContext, true));
	},
	
	_unBind : function (signalBinding) {										//Elimina un listener
		var index = this.bindings.indexOf(signalBinding);
		delete this.bindings[index];											//Liberamos memoria
		this.bindings.splice(index, 1);
	},
	
	_destroy : function () {													//Libera memoria
		delete this.bindings;
		this.bindings = new Array();
	},
	
	dispatch : function (params) {												//Manda el evento a todos los bindings
		for(var i = this.bindings.length - 1; i >= 0; i--){
			if(this.bindings[i] == null || this.bindings[i] == undefined){		//Si el binding ha dejado de existir, lo quitamos del array
				this.bindings.splice(i, 1);
			}
			this.bindings[i].dispatch.apply(this.bindings[i], arguments);
		}
	}
};

XEngine.SignalBinding = function (signal, listener, listenerContext, isOnce) {	//Objeto donde se almacena un listener
	this.signal = signal;
	this.bindings = new Array();
	this.listener = listener;
	this.listenerContext = listenerContext;
	this.isOnce = isOnce;
};

XEngine.SignalBinding.prototype = {
	dispatch : function (params) {
		this.listener.apply(this.listenerContext, arguments);
		if(this.isOnce){
			this.detach();
		}
	},
	
	detach: function () {
		this.signal._unBind(this);
	}
};



// ----------------------------------------- PHYSICS ------------------------------------------//


XEngine.Physics = function (game) {
	this.game = game;
	this.systemEnabled = false;													//Flag de sistema habilitado
	this.physicsObjects = new Array();											//Array de objetos que tienen fisicas activas
	this.gravity = 1;															//Gravedad global
};

XEngine.Physics.Shapes = {
	Box : 0,
	Circle : 0
},

XEngine.Physics.prototype = {
	startSystem : function () {
		this.systemEnabled = true;												//Arranca el sistema
	},
	
	pauseSystem : function () {
		this.systemEnabled = false;												//Pausa el sistema
	},
	
	stop : function(){															//Para por comleto el sistema
		this.systemEnabled = false;
		this._destroy();
	},
	
	enablePhysics : function (gameObject) {										//Habilita las fisicas para un objeto
		gameObject.body = new XEngine.Physics.PhysicsBody(this.game, gameObject.position, gameObject);	//Se crea el objeto de fisicas
		gameObject.body.physicsEngine = this;									//Se le asigna una referencia a este sistema
		this.physicsObjects.push(gameObject.body);								//Se añade el objeto de fisicas al array
	},
	
	preupdate: function () {
		for(var i = this.physicsObjects.length - 1; i >= 0; i--)				//Recorremos los objetos del motor de fisicas para hacer su update
		{
			var gameObject = this.physicsObjects[i];
			if(gameObject.preupdate != undefined)							//En caso contrario miramos si contiene el método update y lo ejecutamos
			{	
				gameObject.preupdate();	
			}
		}
	},
	
	update : function (deltaTime) {
		var _this = this;
		for(var i = _this.physicsObjects.length - 1; i >= 0; i--)				//Recorremos los objetos del motor de fisicas para hacer su update
		{
			var gameObject = _this.physicsObjects[i];
			if(!gameObject || gameObject.isPendingDestroy)						//Si es un objeto destruido lo eliminamos del array y liberamos memoria
			{
				delete this.physicsObjects[i];
				this.physicsObjects.splice(i, 1);
			}
			else if(gameObject.update != undefined)								//En caso contrario miramos si contiene el método update y lo ejecutamos
			{	
				gameObject.update(deltaTime);	
			}
		}
	},
	
	_isOverlapping: function (gameObject1, gameObject2) {							
		if(gameObject1 == undefined || gameObject2 == undefined){				//Si alguno de los objetos no está definido, saltamos el resto de la función
			return false;
		}
		if (gameObject1.max.x <= gameObject2.min.x || gameObject1.min.x >= gameObject2.max.x) {
                return false;

        } else if (gameObject1.max.y <= gameObject2.min.y || gameObject1.min.y >= gameObject2.max.y) {
            return false;

        } else {
            return true;
        }
	},
	
	_overlapHandler : function (body1, body2) {									//Determina si dos objetos de fisicas están uno encima de otro
		if(body1 == undefined || !body1._contObject.alive){													
			return false;
		}
		if(body2 == undefined || !body2._contObject.alive){
			return false;
		}
		if(this._isOverlapping(body1, body2)) 									//Miramos si colisionan
		{
			body1.onOverlap(body2);												//Llamamos al método onOverlap del body
			body2.onOverlap(body1);												//Llamamos al método onOverlap del body
			return true;
		}else{
			return false;
		}
	},
	
	_collisionHandler : function (body1, body2) {									//Determina si dos objetos de fisicas están uno encima de otro
		if(body1 == undefined || !body1._contObject.alive){													
			return false;
		}
		if(body2 == undefined || !body2._contObject.alive){
			return false;
		}
	
		if(this._isOverlapping(body1, body2)){
			var overlapX = this.getOverlapX(body1, body2);
			var overlapY = this.getOverlapY(body1, body2);
			if(Math.abs(overlapX) > Math.abs(overlapY)){
				this.separateY(body1, body2, overlapY);
				if(this._isOverlapping(body1, body2)){
					this.separateX(body1, body2, overlapX);
				}
			}else{
				this.separateX(body1, body2, overlapX);
				if(this._isOverlapping(body1, body2)){
					this.separateY(body1, body2, overlapY);
				}	
			}
			
			body1.onCollision(body2);											//Llamamos al método onCollision del body
			body2.onCollision(body1);											//Llamamos al método onCollision del body
			return true;
		}
		else{
			return false;
		}
	},
	
	separateX: function (body1, body2, overlap) {

        //  Can't separate two immovable bodies, or a body with its own custom separation logic
        if (body1.immovable && body2.immovable)
        {
            //  return true if there was some overlap, otherwise false
            return (overlap !== 0);
        }
        
        if(overlap === 0)
        	return false;

        //  Adjust their positions and velocities accordingly (if there was any overlap)
        var v1 = body1.velocity.x;
        var v2 = body2.velocity.x;
        var e = Math.min(body1.restitution, body2.restitution);

        if (!body1.immovable && !body2.immovable)
        {
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
        else if (!body1.immovable)
        {
            body1.position.x -= overlap;
            body1.velocity.x = v2 - v1 * e;
            body1.updateBounds();
        }
        else
        {
            body2.position.x += overlap;
            body2.velocity.x = v1 - v2 * e;
            body2.updateBounds();
        }

        //  If we got this far then there WAS overlap, and separation is complete, so return true
        return true;

    },
    
    separateY: function (body1, body2, overlap) {

        //  Can't separate two immovable bodies, or a body with its own custom separation logic
        if (body1.immovable && body2.immovable)
        {
            //  return true if there was some overlap, otherwise false
            return (overlap !== 0);
        }
        
        if(overlap === 0)
        	return false;

        //  Adjust their positions and velocities accordingly (if there was any overlap)
        var v1 = body1.velocity.y;
        var v2 = body2.velocity.y;
        var e = Math.min(body1.restitution, body2.restitution);

        if (!body1.immovable && !body2.immovable)
        {
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
        else if (!body1.immovable)
        {
            body1.position.y -= overlap;
            body1.velocity.y = v2 - v1 * e;
            body1.updateBounds();
        }
        else
        {
            body2.position.y += overlap;
            body2.velocity.y = v1 - v2 * e;
            body2.updateBounds();
        }

        //  If we got this far then there WAS overlap, and separation is complete, so return true
        return true;

    },
    
    getOverlapY: function (body1, body2) {
    	var overlap = 0;
    	
    	if(body1.velocity.y > body2.velocity.y)
    	{
    		overlap = body1.max.y - body2.min.y;
			body1.inAir = false;
    	}else if(body1.velocity.y < body2.velocity.y)
    	{
    		overlap = body1.min.y - body2.max.y; 
    		body2.inAir = false;
    	}
    	
    	return overlap;
    },
    
    getOverlapX: function (body1, body2) {
    	var overlap = 0;
    	
    	if(body1.velocity.x > body2.velocity.x)
    	{
    		overlap = body1.max.x - body2.min.x; 
    	}else if(body1.velocity.x < body2.velocity.x)
    	{
    		overlap = body1.min.x - body2.max.x; 
    	}
    	
    	return overlap;
    },
	
	overlap: function (collider, collideWith) {									//Metodo que se llama para que se determine el overlapping de dos objetos
		var _this = this;
		if(!_this.systemEnabled) return;
		var _coll1;
		var _coll2;
		if(XEngine.Group.prototype.isPrototypeOf(collider) && XEngine.Group.prototype.isPrototypeOf(collideWith))
		{
			for(var i = 0; i < collider.children.length; i++)
			{
				_coll1 = collider.children[i].body;
		
				for(var j = 0; j < collideWith.children.length; j++)
				{
					_coll2 = collideWith.children[j].body;
					_this._overlapHandler(_coll1, _coll2);
				}
			}
		}
		else if(!XEngine.Group.prototype.isPrototypeOf(collider) && XEngine.Group.prototype.isPrototypeOf(collideWith))
		{									
			_coll1 = collider.body;
			for(var i = 0; i < collideWith.children.length; i++)
			{
				_coll2 = collideWith.children[i].body;
				_this._overlapHandler(_coll1, _coll2);
			}
		}else if(XEngine.Group.prototype.isPrototypeOf(collider) && !XEngine.Group.prototype.isPrototypeOf(collideWith)){
			_coll2 = collideWith.body;
			for(var i = 0; i < collider.children.length; i++)
			{
				_coll1 = collider.children[i].body;
				_this._overlapHandler(_coll1, _coll2);
			}
		}else{
			_coll1 = collider.body;
			_coll2 = collideWith.body;
			_this._overlapHandler(_coll1, _coll2);
		}
	},
	
	collide: function (collider, collideWith) {									//Metodo que se llama para que se determine el overlapping de dos objetos
		var _this = this;
		if(!_this.systemEnabled) return;
		var _coll1;
		var _coll2;
		if(XEngine.Group.prototype.isPrototypeOf(collider) && XEngine.Group.prototype.isPrototypeOf(collideWith))
		{
			for(var i = 0; i < collider.children.length; i++)
			{
				_coll1 = collider.children[i].body;
		
				for(var j = 0; j < collideWith.children.length; j++)
				{
					_coll2 = collideWith.children[j].body;
					_this._collisionHandler(_coll1, _coll2);
				}
			}
		}
		else if(!XEngine.Group.prototype.isPrototypeOf(collider) && XEngine.Group.prototype.isPrototypeOf(collideWith))
		{									
			_coll1 = collider.body;
			for(var i = 0; i < collideWith.children.length; i++)
			{
				_coll2 = collideWith.children[i].body;
				_this._collisionHandler(_coll1, _coll2);
			}
		}else if(XEngine.Group.prototype.isPrototypeOf(collider) && !XEngine.Group.prototype.isPrototypeOf(collideWith)){
			_coll2 = collideWith.body;
			for(var i = 0; i < collider.children.length; i++)
			{
				_coll1 = collider.children[i].body;
				_this._collisionHandler(_coll1, _coll2);
			}
		}else{
			_coll1 = collider.body;
			_coll2 = collideWith.body;
			_this._collisionHandler(_coll1, _coll2);
		}
	},
	
	_destroy : function () {
		this.physicsObjects = new Array();
	}
};

XEngine.Physics.PhysicsBody = function(game, position, contObject){
	this.game = game;
	this.position = position;
	this.velocity = new XEngine.Vector(0,0);
	this.collideWithWorld = false;												//Determina si colisiona con los limites del mundo
	this.restitution = 0.1;														//Al colisionar, cuanta energia mantiene
	this.gravity = 9;															//Gravedad local (cuanto la afecta la gravedad)
	this.maxVelocity = 300;
	this.staticFriction = 40;													//Fricción base para la velocidad en x
	this.pendingDestroy = false;
	this.acceleration = new XEngine.Vector(0,0);
	this.min = new XEngine.Vector(0,0);											//Min y Max son los bounds del objeto
	this.max = new XEngine.Vector(0,0);
	this.debug = false;
	this._contObject = contObject;
	this.bounds = this._contObject.getBounds();
	this.updateBounds();
};

XEngine.Physics.PhysicsBody.prototype = {
	destroy : function () {
		this.pendingDestroy = true;
	},
	
	update : function (deltaTime) {
		if(this.immovable) {this.updateBounds();return;}
		var _this = this;
		_this.velocity.y += _this.physicsEngine.gravity * _this.gravity * deltaTime;
		
		if(_this.velocity.x != 0 && _this.acceleration.x == 0){					//Si el objeto tiene velocidad y no está acelerando, se le aplica la fricción
			var signX = _this.velocity.x / Math.abs(_this.velocity.x);			//Se obtiene el signo (dirección, negativa o positiva)
			var newVelocityX = XEngine.Mathf.clamp(Math.abs(_this.velocity.x) - _this.staticFriction * deltaTime, 0, _this.maxVelocity);//Se obtiene la nueva velocidad en valores positivos
			newVelocityX *= signX;												//Se le aplica el signo
			_this.velocity.x = newVelocityX;									//Se asigna la nueva velocidad
		}
		
		if(_this.velocity.y != 0 && _this.acceleration.y == 0 && _this.gravity == 0){ //Si el objeto tiene velocidad y no está acelerando, se le aplica la fricción
			var signY = _this.velocity.y / Math.abs(_this.velocity.y);			//Se obtiene el signo (dirección, negativa o positiva)
			var newVelocityY = XEngine.Mathf.clamp(Math.abs(_this.velocity.y) - _this.staticFriction * deltaTime, 0, _this.maxVelocity); //Se obtiene la nueva velocidad en valores positivos
			newVelocityY *= signY;												//Se le aplica el signo
			_this.velocity.y = newVelocityY;									//Se asigna la nueva velocidad
		}
		
		_this.velocity.x += _this.acceleration.x * deltaTime;					//Aplicamos la aceleracion
		_this.velocity.y += _this.acceleration.y * deltaTime;
		
		_this.velocity.y = XEngine.Mathf.clamp(_this.velocity.y, -_this.maxVelocity, _this.maxVelocity); //Aplicamos la velocidad máxima
		_this.velocity.x = XEngine.Mathf.clamp(_this.velocity.x, -_this.maxVelocity, _this.maxVelocity);
		
		_this.position.x += _this.velocity.x * deltaTime;						//Actualizamos la posición en base a la velocidad
		_this.position.y += _this.velocity.y * deltaTime;
		
		_this._contObject.position = _this.position;							//Actualizamos la posición del objeto controlado
		_this.updateBounds();													//Actualizamos los bounds una vez se ha calculado la nueva posición
		if(_this.collideWithWorld){												//Si tiene que colisionar con el mundo, evitamos que se salga
			if(_this.min.x < 0){												//Izquierda
				_this.position.x = (_this.bounds.width * _this._contObject.anchor.x);
				_this.velocity.x = (-this.velocity.x * _this.restitution);
			}else if(_this.max.x > _this.game.worldWidth){						//Derecha
				_this.position.x = _this.game.worldWidth - (_this.bounds.width * ( 1 -_this._contObject.anchor.x));
				_this.velocity.x = (-this.velocity.x * _this.restitution);
			}
			if(_this.min.y < 0){												//Arriba
				_this.position.y = (_this.bounds.height * _this._contObject.anchor.y);
				_this.velocity.y = (-this.velocity.y * _this.restitution);
			}else if(_this.max.y > _this.game.worldHeight){						//Abajo
				_this.position.y = _this.game.worldHeight - (_this.bounds.height * (1 - _this._contObject.anchor.y));
				_this.velocity.y = (-this.velocity.y * _this.restitution);
			}
		}
		
	},
	
	updateBounds: function () {													//Se obtiene la caja de colisión teniendo en cuenta el achor del sprite
		var _this = this;
		_this.min.x = _this.position.x - (_this.bounds.width * _this._contObject.anchor.x);
		_this.min.y = _this.position.y - (_this.bounds.height * _this._contObject.anchor.y);
		_this.max.x = _this.position.x + (_this.bounds.width * (1 - _this._contObject.anchor.x));
		_this.max.y = _this.position.y + (_this.bounds.height * (1 - _this._contObject.anchor.y));
	},
	
	_renderBounds: function (canvas) {
		var _this = this;
		if(_this.debug){														//Si el objeto está en debug, pintaremos su bounding box por encima
			canvas.save();														
			canvas.fillStyle = 'rgba(200,255,200, 0.7)';
			canvas.fillRect(_this.position.x - (_this.bounds.width * _this._contObject.anchor.x), _this.position.y - (_this.bounds.height * _this._contObject.anchor.y), _this.bounds.width, _this.bounds.height);
			canvas.restore();
		}
	},
	
	getWorldPos : function () {
    	var parentPos = this._contObject.parent.getWorldPos();
    	var x = this.position.x + parentPos.x;
    	var y = this.position.y + parentPos.y;
    	return {x: x, y: y};
    },
    
    onCollision :function (other) {
    	if(this._contObject.onCollision != undefined){							//Si el objeto controlado tiene implementado el metodo, lo llamamos
    		this._contObject.onCollision(other._contObject);
    	}
    },
    
    onOverlap :function (other) {
    	if(this._contObject.onOverlap != undefined){							//Si el objeto controlado tiene implementado el metodo, lo llamamos
    		this._contObject.onOverlap(other._contObject);
    	}
    },
    
    disablePhysics : function () {												//Deshabilitamos las fisicas para este objeto
    	var index = this.physicsEngine.physicsObjects.indexOf(this);
    	this.physicsEngine.physicsObjects.splice(index, 1);
    	this.destroy();
    	this._contObject.body = undefined;
    	delete this;
    }
};



// ----------------------------------------- MATHS ------------------------------------------//

XEngine.Mathf = {};
XEngine.Mathf.randomRange = function (min, max) {
	return min + (Math.random() * (max - min));									//Obtiene un float random con el rango que se le asigna, min (inclusive) y max (exclusive)
};

XEngine.Mathf.randomIntRange = function (min, max) {							//Obtiene un float random con el rango que se le asigna, min (inclusive) y max (inclusive)
	 return Math.round(min + Math.random() * (max - min));
};

XEngine.Mathf.clamp = function (number, min, max) {								//Devuelve el número si está dentro de min o max, en caso contrario devuelve min o max
	return Math.max(Math.min(number, max), min);
};

XEngine.Mathf.lerp = function (a, b, t) {										//Interpolación lineal
	t = XEngine.Mathf.clamp(t, 0, 1);
	return (1 - t) * a + t * b;
};

/**
 * A linear interpolator for hexadecimal colors
 * @param {String} a
 * @param {String} b
 * @param {Number} amount
 * @example
 * // returns #7F7F7F
 * lerpColor('#000000', '#ffffff', 0.5)
 * @returns {String}
 */
XEngine.Mathf.lerpColor = function(a, b, amount) { 

    var ah = parseInt(a.replace(/#/g, ''), 16),
        ar = ah >> 16, ag = ah >> 8 & 0xff, ab = ah & 0xff,
        bh = parseInt(b.replace(/#/g, ''), 16),
        br = bh >> 16, bg = bh >> 8 & 0xff, bb = bh & 0xff,
        rr = ar + amount * (br - ar),
        rg = ag + amount * (bg - ag),
        rb = ab + amount * (bb - ab);

    return '#' + ((1 << 24) + (rr << 16) + (rg << 8) + rb | 0).toString(16).slice(1);
};

XEngine.Mathf.angleBetween = function (originX, originY, targetX, targetY) {
	var x = targetX - originX;
	var y = targetY - originY;
	var angle = (Math.atan2(y, x));
	

    return angle;
};

XEngine.Vector = function (x, y) {												//Vector de 2 dimensiones
	this.x = x;
	this.y = y;
	this.z = 0;																	//Sólo se usa en caso de isometrica
	this.zOffset = 0;
};

XEngine.Vector.sub = function(vector1, vector2){
	var newVector = new XEngine.Vector(vector1.x, vector1.y);
	newVector.x -= vector2.x;	
	newVector.y -= vector2.y;
	return newVector;
};

XEngine.Vector.add = function(vector1, vector2){
	var newVector = new XEngine.Vector(vector1.x, vector1.y);
	newVector.x += vector2.x;	
	newVector.y += vector2.y;
	return newVector;
};

XEngine.Vector.distance = function(vector1, vector2){
	var difference = XEngine.Vector.sub(vector1, vector2);
	return difference.length();
};

XEngine.Vector.cartToIsoCoord = function(coordinates){
	var outCoordinates = new XEngine.Vector(0,0);
	outCoordinates.x = coordinates.x - coordinates.y;
	outCoordinates.y = (coordinates.x + coordinates.y) / 2;
	outCoordinates.z = (coordinates.x + coordinates.y) + coordinates.zOffset;
	return outCoordinates;
};
	
XEngine.Vector.isoToCarCoord= function (isoCoord) {
	var outCoordinates = new XEngine.Vector(0,0);
	outCoordinates.x = (isoCoord.x / 2) + isoCoord.y;
	outCoordinates.y = isoCoord.y - (isoCoord.x / 2);
	return outCoordinates;
};


XEngine.Vector.prototype = {
	
	setTo: function (x, y) {													//Asigna los valores (solo por comodidad)
		this.x = x;
		if(y === undefined) y = x;
		this.y = y;
	},
	
	add: function (other) {														//Suma de vectores
		this.x += other.x;
    	this.y += other.y;
	},
	
	sub: function (other) {														//Resta de vectores
		this.x -= other.x;
    	this.y -= other.y;
    	return this;	
	},
	
	multiply: function (other) {												//Multiplicación de vectores
		this.x *= other.x;
		this.y *= other.y;
		return this;
	},
	
	rotate: function (angle) {													//Rotar el vector
		var x = this.x;
	    var y = this.y;
	    this.x = x * Math.cos(angle) - y * Math.sin(angle);
	    this.y = x * Math.sin(angle) + y * Math.cos(angle);
	    return this;
	},
	
	normalize: function () {													//Normalizar el vector
		var d = this.len();
	    if(d > 0) {
	      this.x = this.x / d;
	      this.y = this.y / d;
	    }
	    return this;	
	},
	
	project : function (other) {												//Projectar el vector en otro
		var amt = this.dot(other) / other.len2();
	    this.x = amt * other.x;
	    this.y = amt * other.y;
	    return this;
	},
		
	dot: function (other) {														//Producto escalar
		return this.x * other.x + this.y * other.y;
	},
	
	scale: function (x, y) {													//Escala del vector
		this.x *= x;
	    this.y *= y || x;
	    return this; 
	},
	
	reflect: function (axis) {													//Reflejar el vector en un eje (Vector)
		var x = this.x;
	    var y = this.y;
	    this.project(axis).scale(2);
	    this.x -= x;
	    this.y -= y;
	    return this;
	},
	
	length: function () {														//Longitud de un vector
		return Math.sqrt(this.len2());	
	},
	
	len2: function () {															//Cuadrado de la longitud de un vector
		return this.dot(this);
	}
};

XEngine.Vector.prototype.constructor = XEngine.Vector;

// -------------------------------------------- INPUT--------------------------------------------//

XEngine.InputManager = function (game) {										//Esto se explica solo
	this.game = game;
	this.keysPressed = new Array();
	this.onKeyDown = new XEngine.Signal();
	this.onKeyUp = new XEngine.Signal();
	this.onKeyPressed = new XEngine.Signal();
	this.onClick = new XEngine.Signal();
	this.onInputDown = new XEngine.Signal();
	this.onInputUp = new XEngine.Signal();
	this.onInputMove = new XEngine.Signal();
	this.isDown = false;
	this.pointer = new XEngine.Vector(0,0);
	var _this = this;
	document.addEventListener('keydown', function (event) {
		_this.keyDownHandler.call(_this, event);
	});
	document.addEventListener('keyup', function (event) {
		_this.keyUpHandler.call(_this, event);
	});
	document.addEventListener('keypressed', function (event) {
		_this.keyPressedHandler.call(_this, event);
	});
	
	if(this.game.isMobile){
		this.game.reference.addEventListener('touchstart', function (event) {
			_this.inputDownHandler.call(_this, event);
		});	
		this.game.reference.addEventListener('touchend', function (event) {
			_this.inputUpHandler.call(_this, event);
		});
		this.game.reference.addEventListener('touchmove', function (event) {
			_this.inputMoveHandler.call(_this, event);
		});
	}else{
		this.game.reference.addEventListener('mousedown', function (event) {
			_this.inputDownHandler.call(_this, event);
		});
		this.game.reference.addEventListener('mouseup', function (event) {
			_this.inputUpHandler.call(_this, event);
		});
		this.game.reference.addEventListener('mousemove', function (event) {
			_this.inputMoveHandler.call(_this, event);
		});
		this.game.reference.addEventListener('click', function (event) {
			_this.clickHandler.call(_this, event);
		});
	}
};

XEngine.InputManager.prototype = {
	_initializeKeys: function () {
		for(var i = 0; i <= 222; i++){
			this.keysPressed.push(false);
		}
	},
	
	isPressed: function(keyCode){
		return this.keysPressed[keyCode];
	},
	
	keyDownHandler: function (event) {
		this.keysPressed[event.keyCode] = true;
		this.onKeyDown.dispatch(event);
	},
	
	keyUpHandler: function(event){
		this.keysPressed[event.keyCode] = false;
		this.onKeyUp.dispatch(event);
	},
	
	keyPressedHandler: function(event){
		this.onKeyPressed.dispatch(event);
	},
	
	clickHandler: function(event){
		var inputPos = this.getInputPosition(event);
		this.clickDispatcher(inputPos);
	},
	
	inputDownHandler: function(event){
		this.isDown = true;
		var inputPos = this.getInputPosition(event);
		this.pointer.x = inputPos.position.x;
		this.pointer.y = inputPos.position.y;
		this.onInputDown.dispatch(inputPos);
		for(var i = this.game.gameObjects.length - 1; i >= 0; i--){
			var gameObject = this.game.gameObjects[i];
			if(!gameObject.inputEnabled) continue;
			if(this._pointerInsideBounds(gameObject)){
				if(gameObject.onInputDown == undefined){
					gameObject.onInputDown = new XEngine.Signal();
				} 
				gameObject.onInputDown.dispatch(event);
				gameObject.isInputDown = true;
				return true;
			}
		}
	},
	
	inputMoveHandler: function (event) {
		
		var inputPos = this.getInputPosition(event);
		this.pointer.x = inputPos.position.x;
		this.pointer.y = inputPos.position.y;
		this.onInputMove.dispatch(inputPos);
	},
	
	getInputPosition: function (event) {
		var rect = this.game.reference.getBoundingClientRect();
		var newEvent = {
			position : {
				x: event.pageX - (document.documentElement.scrollLeft || document.body.scrollLeft) - rect.left,
				y: event.pageY - (document.documentElement.scrollTop || document.body.scrollTop) - rect.top
			},
		};
		
		if(this.game.isMobile){
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
	
	inputUpHandler: function(event){
		this.isDown = false;
		var newEvent = {
			position : {
				x: this.pointer.x,
				y: this.pointer.y,
			},
		};
		if(this.game.isMobile){
			this.clickDispatcher(newEvent);
		}
		this.onInputUp.dispatch(newEvent);
		for(var i = this.game.gameObjects.length - 1; i >= 0; i--){
			var gameObject = this.game.gameObjects[i];
			if(!gameObject.inputEnabled) continue;
			if(gameObject.isInputDown){
				if(gameObject.onInputUp == undefined){
					gameObject.onInputUp = new XEngine.Signal();
				} 
				gameObject.onInputUp.dispatch(event);
				gameObject.isInputDown = false;
				return true;
			}
		}
	},
	
	clickDispatcher: function (event) {
		this.onClick.dispatch(event);
		var _this = this;
		var loop = function (array) {											//Bucle que inspecciona todos los elementos de un Array
			for(var i = array.length - 1; i >= 0; i--){
				var gameObject = array[i];
				if(XEngine.Group.prototype.isPrototypeOf(gameObject)){
					if(loop(gameObject.children)) return true;					//Si éste loop ha encontrado un objeto que hacer click, terminamos 
				}else{
					if(gameObject || gameObject.inputEnabled){
						if(_this._pointerInsideBounds(gameObject)){				//Si el area el objeto está dentro del puntero, lanzamos el click y acabamos
							if(gameObject.onClick == undefined){
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
	
	_pointerInsideBounds: function (gameObject) {								//Obtenemos si el puntero está dentro del area de un objeto
		if(gameObject.getBounds != undefined){
			var bounds = gameObject.getBounds();
			if (this.pointer.x < (gameObject.position.x - bounds.width * gameObject.anchor.x) || this.pointer.x > (gameObject.position.x + bounds.width * (1 - gameObject.anchor.x))) {
	                return false;
	
	        } else if (this.pointer.y < (gameObject.position.y - bounds.height * gameObject.anchor.y) || this.pointer.y > (gameObject.position.y + bounds.height * (1 - gameObject.anchor.y))) {
	            return false;
	
	        } else {
	            return true;
	        }
		}else{
			return false;
		}
	},
	
	reset: function () {
		this.onKeyUp._destroy();
		this.onKeyDown._destroy();
		this.onKeyPressed._destroy();
		this._initializeKeys();
	},
};

// ----------------------------------------- GAME OBJECTS ------------------------------------------//

XEngine.BaseObject = function(game){											//De este objeto parten todos los objetos que se pueden poner en el juego
	var _this = this;
    _this.game = game;															//Referencia al juego
    _this.isPendingDestroy = false;
    _this.alive = true;
    _this.alpha = 1.0;
    _this.scale = new XEngine.Vector(1,1);
    _this.anchor = new XEngine.Vector(0,0);										//Ancla del objeto (0,0) = Arriba a la izquierda
    _this.rotation = 0;
    _this.position = new XEngine.Vector(0, 0); 
    _this.onClick = new XEngine.Signal();
    _this.onInputDown = new XEngine.Signal();			
    _this.onInputUp = new XEngine.Signal();
    _this.inputEnabled = false;													//No estoy seguro de que el input funcione con todos los objetos y menos todavía con los grupos
    _this.render = true;
    _this.fixedToCamera = false;
    _this.isometric = false;
    _this.isInputDown = false;
};

XEngine.BaseObject.prototype = {
	destroy: function () {
		this.kill();
        this.isPendingDestroy = true;
        if(this.onDestroy != undefined){
        	this.onDestroy();
        }
    },
    
    kill: function () {
    	this.alive = false;	
    },
    
    restore: function (posX, posY) {
    	this.position.x = posX;
    	this.position.x = posY;
    	this.alive = true;
    },
    
    getWorldPos : function () {													//Obtiene la posición del objeto en el mundo teniendo en cuenta la posición local y la posición del mundo del padre
    	var _this = this;
    	var parentPos = _this.parent.getWorldPos();
    	var x = _this.position.x + parentPos.x;
    	var y = _this.position.y + parentPos.y;
    	return {x : x, y : y};
    },
    
    getTotalRotation: function () {												//Obtiene la rotación teniendo en cuenta la rotación de los padres
    	var parentRot = this.parent.getTotalRotation();
    	return parentRot + this.rotation;
    },
    
    _renderToCanvas: function (canvas) {										//Como cada objeto se renderiza distinto, en cada uno se implementa este método según la necesidad
		
	},
	
	applyRotationAndPos: function (canvas) {									//Aplica, al canvas, la rotación y posición del objeto para que se renderice como toca
		var _this = this;
		var pos = new XEngine.Vector(0,0);
		if(_this.isometric){
			pos = XEngine.Vector.cartToIsoCoord(_this.getWorldPos());
		}else{
			pos = _this.getWorldPos();
		}
	    if(_this.fixedToCamera){
	    	canvas.translate(pos.x, pos.y);
		}else{
	    	canvas.translate(pos.x - this.game.camera.position.x , pos.y - this.game.camera.position.y);
		}
	    canvas.rotate(this.getTotalRotation()*Math.PI/180);
	    canvas.scale(this.scale.x, this.scale.y);
	}
};

XEngine.Group = function (game, x, y) {
	XEngine.BaseObject.call(this, game);
	var _this = this;
	_this.game = game;
    _this.children = new Array();												//Array de objetos contenidos
    _this.position.setTo(x, y);
    _this.position.z = 0;
};

XEngine.Group.prototypeExtends = {
    update: function (deltaTime) {
		for(var i = this.children.length - 1; i >= 0; i--)						//Recorremos los objetos del grupo para hacer su update
		{
			var gameObject = this.children[i];
			if(gameObject.isPendingDestroy)										//Si es un objeto destruido lo eliminamos del array y liberamos memoria
			{
				if(gameObject.body != undefined){
					gameObject.body.destroy();
				}
				delete this.children[i];
				this.children.splice(i, 1);
			}
			else if(gameObject.update != undefined && gameObject.alive)			//En caso contrario miramos si contiene el método update y lo ejecutamos
			{	
				gameObject.update(deltaTime);	
			}
		}
    },
    
    getFirstDead: function () {
    	for(var i = this.children.length - 1; i >= 0; i--)						//Recorremos los objetos del grupo para encontrar alguno que esté "muerto"
		{
			var gameObject = this.children[i];
			if(!gameObject.alive)
			{
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
    	for(var i = this.children.length - 1; i >= 0; i--)						//Destruimos todos los hijos y liberamos memoria	
		{
			var gameObject = this.children[i];
			if(gameObject.destroy != undefined)								
			{
				gameObject.destroy(gameObject);
				delete this.children[i];
			}
		}
		if(this.onDestroy != undefined){
        	this.onDestroy();
        }
    },
    
    add: function (gameObject) {
    	if(this.game.gameObjects.indexOf(gameObject) >= 0)
    	{
    		var index = this.game.gameObjects.indexOf(gameObject);
    		this.game.gameObjects.splice(index, 1);
    	}
        this.children.push(gameObject);
        if(gameObject.start != undefined){
			gameObject.start();
		}
        gameObject.parent = this;
        return gameObject;
    },
};
XEngine.Group.prototype = Object.create(XEngine.BaseObject.prototype);
Object.assign(XEngine.Group.prototype, XEngine.Group.prototypeExtends);			//Se le añade el prototypeExtends al prototype original

XEngine.Sprite = function (game, posX, posY, sprite){
	XEngine.BaseObject.call(this, game);
	var _this = this;
	_this.sprite = sprite;
	var cache_image = _this.game.cache.image(sprite);
    _this.game = game;                                                   		//guardamos una referencia al juego
    _this.width = cache_image.frameWidth || 10;											//Si la imagen no se ha cargado bien, ponemos valor por defecto
    _this.height = cache_image.frameHeight || 10;
    _this._columns = Math.floor(cache_image.image.width / _this.width);
    _this._rows = Math.floor(cache_image.image.height / _this.height);
    _this.position.setTo(posX, posY);
    _this.frame = 0;
    _this.animation = new XEngine.AnimationManager(game, this);
};

XEngine.Sprite.prototype = Object.create(XEngine.BaseObject.prototype);

XEngine.Sprite.prototypeExtends = {
	_renderToCanvas: function (canvas) {										//Sobreescribimos el método render	
		var _this = this;
		canvas.save();															//Guardamos el estado actual del canvas
		var cache_image = _this.game.cache.image(_this.sprite);					//Obtenemos la imagen a renderizar
		this.applyRotationAndPos(canvas);										
		canvas.globalAlpha =_this.alpha;										//Aplicamos el alpha del objeto
		//Renderizamos la imagen teniendo en cuenta el punto de anclaje
		var column = _this.frame;
		if(_this.frame > _this._columns - 1){
			column -= _this._columns; 
		}
		var row = Math.floor(_this.frame / _this._columns);
		var posX = Math.round(-(_this.width * _this.anchor.x));
		var posY = Math.round(-(_this.height * _this.anchor.y));
		canvas.drawImage(cache_image.image,column * cache_image.frameWidth, row * cache_image.frameHeight, cache_image.frameWidth, cache_image.frameHeight, posX, posY, _this.width, _this.height);
		canvas.restore();														//Restauramos el estado del canvas
	},
	
	getBounds: function () {													
		var _this = this;
		var width = _this.width * _this.scale.x;
		var height = _this.height * _this.scale.y;
		return {width : width, height: height};
	},
	
	recalculateWidht: function () {
		var _this = this;
		var cache_image = _this.game.cache.image(_this.sprite);
	    _this.width = cache_image.frameWidth || 10;											//Si la imagen no se ha cargado bien, ponemos valor por defecto
	    _this.height = cache_image.frameHeight || 10;
	},
	
	reset: function (x, y) {													//Reseteamos el sprite
		this.position.x = x;
		this.position.y = y;
		this.alive = true;
		if(this.start != undefined){
			this.start();
		}
		if(this.body){
			this.body.velocity = new XEngine.Vector(0, 0);
		}
	},
	
	_updateAnims: function(deltaMillis){
		this.animation._update(deltaMillis);
	}
};

Object.assign(XEngine.Sprite.prototype, XEngine.Sprite.prototypeExtends);

XEngine.Animation = function (game, sprite, frames, rate){						//Objeto que almacena la información de una animación y la ejecuta
	var _this = this;
	_this.sprite = sprite;
    _this.game = game;                                                   		//guardamos una referencia al juego
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
		if(_this.frameTime >= _this.rate){
			_this.currentFrame++;
			_this.frameTime = 0;
			if(_this.currentFrame > _this.maxFrames){
				if(_this.loop){
					_this.currentFrame = 0;
				}else{
					_this._stop();
					return;
				}
			}
		}
		_this.sprite.frame = _this.frames[_this.currentFrame];
	},
	
	_start: function () {
		this.started = true;
	},
	
	_stop: function(){
		this.playing = false;
		this.frameTime = 0;
		this.currentFrame = 0;
	},
};

XEngine.AnimationManager = function (game, sprite){								//Manager para manejar el uso de las animaciones de los sprites
	var _this = this;
	_this.sprite = sprite;
    _this.game = game;                                                   		//guardamos una referencia al juego
    _this.animations = new Array();
    _this.currentAnim = null;
};

XEngine.AnimationManager.prototype = {
	_update: function (deltaMillis) {
		var _this = this;
		if(_this.currentAnim){
			_this.currentAnim._update(deltaMillis);
		}
	},
	
	play: function (animName) {													//Ejecuta una animación
		if(this.currentAnim){													//Si ya hay una en marcha, la paramos
			this.currentAnim._stop();
		}
		var anim = this.animations[animName];
		if(!anim){
			return;
		}
		this.currentAnim = anim;
		anim._start();
	},
	
	_stop: function(animName){
		var anim = this.animations[animName];
		if(!anim){
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


XEngine.Rect = function (game, posX, posY, width, height, color){
	XEngine.BaseObject.call(this, game);
	var _this = this;
    _this.game = game;                                                   		//guardamos una referencia al juego
    _this.width = width;
    _this.height = height;
    _this.color = color;
    _this.position.setTo(posX, posY);				                     		//set de la posición
};

XEngine.Rect.prototype = Object.create(XEngine.BaseObject.prototype);
XEngine.Rect.constructor = XEngine.Rect;

XEngine.Rect.prototypeExtends = {
	_renderToCanvas: function (canvas) {
		var _this = this;
		canvas.save();
		this.applyRotationAndPos(canvas);
		canvas.fillStyle=_this.color;
		canvas.globalAlpha =_this.alpha;
		var posX = Math.round(-(_this.width * _this.anchor.x));
		var posY = Math.round(-(_this.height * _this.anchor.y));
		canvas.fillRect(posX, posY, _this.width, _this.height);
		canvas.restore();
	},
	
	getBounds: function () {
		var _this = this;
		var width = _this.width * _this.scale.x;
		var height = _this.height * _this.scale.y;
		return {width : width, height: height};
	},
};

Object.assign(XEngine.Rect.prototype, XEngine.Rect.prototypeExtends);

XEngine.Circle = function (game, posX, posY, radius, color, stroke, strokeColor, fill, startAngle, endAngle){
	XEngine.BaseObject.call(this, game);
	var _this = this;
    _this.game = game;                                                   		//guardamos una referencia al juego
    _this.radius = radius;
    _this.color = color;
    _this.position.setTo(posX, posY);				                     		//set de la posición
    _this.stroke = stroke || 0;
    _this.fill = fill;
    if(fill == undefined){
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
		canvas.globalAlpha =_this.alpha;
		var posX = Math.round(-(_this.radius * 2) * _this.anchor.x);
		var posY = Math.round(-(_this.radius * 2) * _this.anchor.y);
		canvas.beginPath();
		var startAntle = _this.startAngle * (Math.PI / 180);
		var endAngle = _this.endAngle * (Math.PI / 180);
		canvas.arc(posX, posY, _this.radius, startAntle, endAngle);
		if(_this.fill){
			canvas.fillStyle=_this.color;
			canvas.fill();
		}
		if(_this.stroke > 0){
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
		return {width : width, height: height};
	},
};

Object.assign(XEngine.Circle.prototype, XEngine.Circle.prototypeExtends);

XEngine.TilledImage = function (game, posX, posY, sprite, widht, height){
	XEngine.BaseObject.call(this, game);
	var _this = this;
	_this.sprite = sprite;
    _this.game = game;                                                   		//guardamos una referencia al juego
    var image = _this.game.cache.image(sprite).image;
    _this.imageWidht = image.widht || 10;
    _this.imageHeigh = image.height || 10;
    _this.width = widht;
    _this.height = height;
    _this.position.setTo(posX, posY);
    _this.offSet = new XEngine.Vector(0,0);										//Offset para poder mover la posición del tilling
};

XEngine.TilledImage.prototype = Object.create(XEngine.BaseObject.prototype);

XEngine.TilledImage.prototypeExtends = {
	_renderToCanvas: function (canvas) {										
		var _this = this;
		canvas.save();
		var pos = _this.getWorldPos();
		
		if(_this.offSet.x > _this.imageWidht){									//Evitamos que el offset llegue a ser un número demasiado grande
			_this.offSet.x = _this.offSet.x - _this.imageWidht;
		}else if(_this.offSet.x < -_this.imageWidth){
			_this.offSet.x = _this.offSet.x + _this.imageWidht;
		}
		
		if(_this.offSet.y > _this.imageHeigh){
			_this.offSet.y = _this.offSet.y - _this.imageHeigh;
		}else if(_this.offSet.y < -_this.imageHeigh){
			_this.offSet.y = _this.offSet.y + _this.imageHeigh;
		}
		
		var image = _this.game.cache.image(_this.sprite).image
		var pattern = canvas.createPattern(image, "repeat");					//Creamos el patron en modo repetición
		
		var rectX = Math.round(-(pos.x + _this.offSet.x));
		var rectY = Math.round(-(pos.y + _this.offSet.y));
		
		this.applyRotationAndPos(canvas, {x: rectX, y: rectY});	
		
		var rectWidht = Math.round(_this.width * _this.scale.x);
		var rectHeigth = Math.round(_this.height * _this.scale.y);
		
		canvas.beginPath();
		canvas.rect(rectX, rectY, rectWidht, rectHeigth);						//Creamos el rect donde se va pintar nuestra imagen
		canvas.fillStyle = pattern;												//Asignamos el patrón que hemos creado antes
		canvas.globalAlpha =_this.alpha;							
		canvas.fill();
		canvas.restore();
	},
};

Object.assign(XEngine.TilledImage.prototype, XEngine.TilledImage.prototypeExtends);

XEngine.Text = function (game, posX, posY, text, textStyle){
	XEngine.BaseObject.call(this, game);
	var _this = this;
    _this.game = game;                                                   		//guardamos una referencia al juego
    _this.text = text || "";													//Set de los atributos del texto
	_this.font = textStyle.font || 'Arial';
	_this.size = textStyle.font_size || 12;
	_this.color = textStyle.font_color || 'white';
	_this.style = '';
	_this.strokeWidth = textStyle.stroke_width || 0;
	_this.strokeColor = textStyle.stroke_color || 'black';
    var canvas = game.canvas;													//Ponemos los valores al canvas para objeter el width del texto
    canvas.save();
    canvas.font = _this.size + 'px ' + _this.font;
    var textSize = canvas.measureText(_this.text);
    canvas.restore();															//Restauramos los valores previos
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
		canvas.globalAlpha =_this.alpha;
		var font = 	font = _this.style + ' ' + _this.size + 'px ' + _this.font;
		canvas.font = font.trim();
		var posX = Math.round(-(_this.width * _this.anchor.x));
		var posY = Math.round(-(_this.height * _this.anchor.y));
		var pos = {x: posX, y: posY + _this.size};
		if(_this.strokeWidth > 0){
			canvas.strokeStyle = _this.strokeColor;
    		canvas.lineWidth = _this.strokeWidth;
    		canvas.strokeText(_this.text, pos.x, pos.y);
		}
		var textSize = canvas.measureText(_this.text);
		_this.width = textSize.width;
		_this.height = _this.size * 1.5;
		canvas.fillStyle = _this.color;
		canvas.fillText(_this.text, pos.x, pos.y);
		canvas.restore();
	},
	
	getBounds: function () {
		var _this = this;
		var width = _this.width * _this.scale.x;
		var height = _this.height * _this.scale.y;
		return {width : width, height: height};
	},
};

Object.assign(XEngine.Text.prototype, XEngine.Text.prototypeExtends);

XEngine.Button = function (game, posX, posY, sprite){							
	XEngine.BaseObject.call(this, game);
	var _this = this;
	_this.sprite = sprite;
	var image = _this.game.cache.image(sprite).image;
    _this.game = game;                                                   		//guardamos una referencia al juego
    _this.width = image.width || 10;											//Si la imagen no se ha cargado bien, ponemos valor por defecto
    _this.height = image.height || 10;
    _this.position.setTo(posX, posY);
    _this.inputEnabled = true;
};

XEngine.Button.prototype = Object.create(XEngine.BaseObject.prototype);

XEngine.Button.prototypeExtends = {
	_renderToCanvas: function (canvas) {										//Sobreescribimos el método render	
		var _this = this;
		canvas.save();															//Guardamos el estado actual del canvas
		var image = _this.game.cache.image(_this.sprite).image;					//Obtenemos la imagen a renderizar
		this.applyRotationAndPos(canvas);										
		canvas.globalAlpha =_this.alpha;										//Aplicamos el alpha del objeto
		var posX = Math.round(-(_this.width * _this.anchor.x));
		var posY = Math.round(-(_this.height * _this.anchor.y));
		//Renderizamos la imagen teniendo en cuenta el punto de anclaje
		canvas.drawImage(image, posX, posY, _this.width, _this.height);
		canvas.restore();														//Restauramos el estado del canvas
	},
	
	getBounds: function () {													
		var _this = this;
		var width = _this.width * _this.scale.x;
		var height = _this.height * _this.scale.y;
		return {width : width, height: height};
	},
};

Object.assign(XEngine.Button.prototype, XEngine.Button.prototypeExtends);


XEngine.Audio = function (game, audioName, autoStart, volume){
	var _this = this;
	_this.game = game;
	_this.audio = _this.game.cache.audio(audioName).audio;
	_this.persist = false;
	_this.volume = volume || 1;
	_this.onComplete = new XEngine.Signal();
	_this.completed = false;
	_this.pendingDestroy = false;
	_this.alive = true;
	_this.source = game.audioContext.createBufferSource(); 
	_this.source.buffer = _this.audio;                    
	_this.source.connect(game.audioContext.destination);
	_this.source.onended = function(){
		_this._complete();
	};
	_this.gainNode = game.audioContext.createGain();
	_this.source.connect(_this.gainNode);
	_this.gainNode.connect(game.audioContext.destination);
	_this.gainNode.gain.value = _this.volume;
	if(autoStart){
		this.play();
	}
};

XEngine.Audio.prototype = {
	update: function(){
		this.gainNode.gain.value = this.volume;
	},
	
	play: function (time) {															
		this.source.start(time || 0);
	},
	
	stop: function (time) {
		this.source.stop(time || 0);
	},
	
	loop: function (value) {
		this.source.loop = value;
	},
	
	destroy: function () {
		this.kill();
		this.pendingDestroy = true;
		if(this.onComplete){
			this.onComplete._destroy();
			delete this.onComplete;
		}
	},
	
	kill: function () {
		this.alive = false;
		this.stop();
	},
	
	_complete: function(){
		var _this = this;
		_this.onComplete.dispatch();
	}
};

XEngine.KeyCode = {
    BACKSPACE: 8,
    TAB: 9,
    ENTER: 13,

    SHIFT: 16,
    CTRL: 17,
    ALT: 18,

    PAUSE: 19,
    CAPS_LOCK: 20,
    ESC: 27,
    SPACE: 32,

    PAGE_UP: 33,
    PAGE_DOWN: 34,
    END: 35,
    HOME: 36,

    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40,

    PRINT_SCREEN: 42,
    INSERT: 45,
    DELETE: 46,

    ZERO: 48,
    ONE: 49,
    TWO: 50,
    THREE: 51,
    FOUR: 52,
    FIVE: 53,
    SIX: 54,
    SEVEN: 55,
    EIGHT: 56,
    NINE: 57,

    A: 65,
    B: 66,
    C: 67,
    D: 68,
    E: 69,
    F: 70,
    G: 71,
    H: 72,
    I: 73,
    J: 74,
    K: 75,
    L: 76,
    M: 77,
    N: 78,
    O: 79,
    P: 80,
    Q: 81,
    R: 82,
    S: 83,
    T: 84,
    U: 85,
    V: 86,
    W: 87,
    X: 88,
    Y: 89,
    Z: 90,
    
    PAD0: 96,
    PAD1: 97,
    PAD2: 98,
    PAD3: 99,
    PAD4: 100,
    PAD5: 101,
    PAD6: 102,
    PAD7: 103,
    PAD8: 104,
    PAD9: 105,

    F1: 112,
    F2: 113,
    F3: 114,
    F4: 115,
    F5: 116,
    F6: 117,
    F7: 118,
    F8: 119,
    F9: 120,
    F10: 121,
    F11: 122,
    F12: 123,

    SEMICOLON: 186,
    PLUS: 187,
    COMMA: 188,
    MINUS: 189,
    PERIOD: 190,
    FORWAD_SLASH: 191,
    BACK_SLASH: 220,
    QUOTES: 222
};