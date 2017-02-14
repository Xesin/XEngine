var XEngine = {
	version: '0.4-alpha'
};

// ----------------------------------------- GAME ENGINE ------------------------------------------//

XEngine.Game = function (width, height, idContainer) {
	this.reference = document.getElementById(idContainer);
	this.position = new XEngine.Vector(0,0);									//valor por defecto del juego (para que los hijos que accedan a la posicón del padre y sea el propio juego no de un undefined)
	this.width = width;															
	this.height = height;
	this.worldWidth = width;													//ancho del mundo. Lo usa la cámara para no salirse
	this.worldHeight = height;													//alto del mundo. Lo usa la cámara para no salirse
	this.reference.setAttribute('width', width+'px');							//asignamos el ancho del canvas
	this.reference.setAttribute('height', height+'px');							//asignamos el alto del canvas
	this.canvas = this.reference.getContext('2d');								//Obtenemos el contexto 2d del canvas
	this.frameLimit = 30;														//Ponemos un valor por defecto al límite de frames
	this.init();
	XEngine.Game._ref = this;
};

XEngine.Game.prototype.constructor = XEngine.Game;

XEngine.Game._updateCaller = function () {
	XEngine.Game._ref.update();
};

XEngine.Game.prototype = {
	init : function () {
		var _this = this;
		console.log('Game engine ' + XEngine.version + ' arrancado con canvas!!!');
		_this._startTime = Date.now();											//Tiempo en el que empieza el juego
		_this._elapsedTime = 0;													//Tiempo transcurrido desde que el juego se creó
		_this.frameTime = 0;													//Tiempo en el que transcurre el frame (tiempo desde el inicio del juego)
		_this.previousFrameTime = 0;											//Tiempo en el que transcurrió el último frame
		_this.deltaTime = 0;													//Tiempo entre frames en segundos
		_this.deltaMillis = 0;													//Tiempo entre frames en milisegundos
		_this.gameObjects = new Array();										//objetos pertenecientes al juego
		_this.state = new XEngine.StateManager(_this);							//Manager de estados
		_this.add = new XEngine.ObjectFactory(_this);							//Fabrica de objetos
		_this.physics = new XEngine.Physics(_this);								//Motor de físicas
		_this.tween = new XEngine.TweenManager(_this);							//Manager de tweens
		_this.cache = new XEngine.Cache(_this);									//Cache para guardar los objetos descargados
		_this.load = new XEngine.Loader(_this);									//Loader de objetos, para obtener imagenes y guardarlas en cache
		_this.camera = new XEngine.Camera(_this, _this.width, _this.height);	//Camara del juego
		_this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent); //Obtiene si se está ejecutando en un dispositivo móvil
		_this.input = new XEngine.InputManager(_this);							//Controla los inputs sobre el canvas
		_this.onWindowsResize = new XEngine.Signal();
	/*	window.onresize = function (event) {									//Evento para cambiar el tamaño del canvas cuando se cambie el tamaño de la pantalla
			_this.resizeHandle.call(_this, event);
			_this.onWindowsResize.dispatch.call(_this.onWindowsResize, event);
		};

		_this.resizeHandle();													//Llamamos una vez al handler del evento anterior para iniciar con los valores que toca
	*/	
		this.update();															//Iniciamos el loop
	},
	
	/*resizeHandle: function (event) {											//escalamos el canvas para que se ajuste al tamaño de la ventana
		this.width = window.innerWidth;
		this.height = window.innerHeight;
		this.reference.width = window.innerWidth;								
		this.reference.height = window.innerHeight;
		this.worldHeight = window.innerHeight;
		this.worldWidth = window.innerWidth;
	},*/
	
	setBackgroundColor: function (color) {
		this.reference.style.backgroundColor = color;
	},
	
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
			}													//Llamamos al handler de condición de fin;
		}			
		_this.canvas.clearRect(0, 0, _this.width, _this.height);					//Limpiamos el canvas
		_this.render(this.gameObjects);											//Renderizamos la escena
	},
	
	destroy: function () {														//Este paso se llama cuando se cambia de un estado a otro
		for(var i = this.gameObjects.length - 1; i >= 0; i--)					//Destruimos todos los objetos del juego
		{
			var gameObject = this.gameObjects[i];
			if(gameObject.destroy != undefined)						
			{
				gameObject.destroy();
				if(gameObject.body != undefined){								//Si tienen un body, lo destruimos también
					gameObject.body.destroy();
					delete this.gameObjects[i].body;							//Liberamos memoria
				}
				delete this.gameObjects[i];										//Liberamos memoria
			}
		}
		delete this.gameObjects;												//Liberamos la memoria del array para luego crear uno nuevo
		this.gameObjects = new Array();
		this.physics._destroy();												//Llamamos a los destroy de los distintos componentes
		this.tween._destroy();
		this.onWindowsResize._destroy();
		delete this.camera;														//Liberamos la memoria de la camara para crear una nueva								
		this.camera = new XEngine.Camera(this);	
	},
	
	render: function (arrayObjects) {											//Renderizamos el array de objetos que le pasamos por parametro
		var _this = this;
		for(var i = 0; i < arrayObjects.length; i++){							
			var object = arrayObjects[i];
			if(!object.render) continue;
			if(XEngine.Group.prototype.isPrototypeOf(object)){					//Si es un grupo, llamamos al render pasando los objetos que contiene
				_this.render(object.children);
			}else if(!XEngine.Audio.prototype.isPrototypeOf(object)){			//Si no es un audio, renderizamos
				if(!object.alive) continue;
				object._renderToCanvas(_this.canvas);							
				if(object.body != undefined){
					object.body._renderBounds(_this.canvas);					//Si tiene un body, llamamos al render de los bounds
				}
			}
		}
	},
	
	getWorldPos : function () {
    	return this.position;
    },
    
    getTotalRotation : function () {
    	return 0;
    }
};

// ----------------------------------------- CAMERA ------------------------------------------//

XEngine.AXIS = {
	NONE: "none", 
	HORIZONTAL: "horizontal", 
	VERTICAL: "vertical", 
	BOTH: "both"
};

XEngine.Camera = function (game) {
	this.game = game;
	this.position = new XEngine.Vector(0,0);
	this.followedObject = null;													//Objeto a seguir
	this.axis = XEngine.AXIS.BOTH;												//Ejes en los que se puede mover la cámara
};

XEngine.Camera.prototype = {
	followObject: function(gameObject, offsetLeft, offsetUp){					//Asigna el objeto a seguir
		this.follow = true;
		this.offsetLeft = offsetLeft || 0;										
		this.offsetUp = offsetUp || 0;
		this.followedObject = gameObject;
	},
	
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
	add : function (stateName, stateClass) {									//Añade un estado al array de estados
		this.states[stateName] = stateClass;
	},
	
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
	image: function (imageName, imageUrl) {										//Añade una imagen al array de cargas pendientes
		this.pendingLoads.push(new XEngine.ImageLoader(imageName, imageUrl, this));
	},
	
	spriteSheet: function (imageName, imageUrl, frameWidth, frameHeight) {
		this.pendingLoads.push(new XEngine.ImageLoader(imageName, imageUrl, this, frameWidth, frameHeight));
	},
	
	audio: function (audioName, audioUrl) {
		this.pendingLoads.push(new XEngine.AudioLoader(audioName, audioUrl, this));
	},
	
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
	
	_notifyCompleted: function () {												//Metodo que se llama al completarse una carga
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
	load: function () {
		var _this = this;
		var newImage = {														//Creamos el objeto a guardar en cache
			imageName : _this.imageName,										//Nombre de la imagen
			image: null,														//Referencia de la imagen
			frameWidth : _this.frameWidth,
			frameHeight: _this.frameHeight 
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
	load: function () {
		var _this = this;
		var newAudio = {														//Creamos el objeto a guardar en cache
			audioName : _this.audioName,										//Nombre del audio
			audio: null															//Referencia del audio
		};
		var audio = new Audio(_this.audioUrl);									//Creamos el objeto Audio
		var handler = function (e) {											//Creamos el handler de cuando se completa o da error
        	var audioRef = _this.loader.game.cache.audios[_this.audioName];		//Obtenemos el audio de cache
        	audioRef.audio = this;												//Asignamos la referencia
        	_this.completed = true;												//Marcamos como completado
        	_this.loader._notifyCompleted();									//Notificamos de que la carga se ha completado
        };
        audio.addEventListener('error', handler, false);
        audio.addEventListener('canplaythrough', handler, false);
        audio.onLoad = handler;
        audio.load();
		_this.loader.game.cache.audios[_this.audioName] = newAudio;				//Guardamos nuesto objeto de audio en cache para luego recogerlo
	}	
};


XEngine.Cache = function (game) {
	this.game = game;
	this.images = new Array();													//Cache de imagenes
	this.audios = new Array();													//Cache de audios
};

XEngine.Cache.prototype = {
	image: function(imageName){													//Devuelve una imagen de cache
		if(this.images[imageName] == undefined){
			console.error('No hay imagen para el nombre: '+ imageName);	
		}else{
			return this.images[imageName];
		}
	},
	
	audio: function (audioName) {												//Devuelve un audio de la cache
		if(this.audios[audioName] == undefined){
			console.error('No hay audio para el nombre: '+ audioName);	
		}else{
			return this.audios[audioName];
		}
	},
	
	clearCache: function () {													//Borra la cache
		delete this.images;
		delete this.audios;
		this.images = new Array();
		this.audios = new Array();
	}
};

// ----------------------------------------- OBJECT FACTORY ------------------------------------------//

XEngine.ObjectFactory = function (game) {
	this.game = game;
};

XEngine.ObjectFactory.prototype = {
	existing : function (gameObject) {											//Añade un objeto que ya ha sido creado
		this.game.gameObjects.push(gameObject);									//Añadimos el objeto al array de objetos
		gameObject.parent = this.game;											//Asignamos el padre del objeto
		if(gameObject.start != undefined){
			gameObject.start();
		}
		return gameObject;
	},
	
	sprite : function (posX, posY, sprite) {									//Creamos y añadimos un sprite a partir de los datos proporcionados
		var gameObject = new XEngine.Sprite(this.game, posX, posY, sprite);
		return this.existing(gameObject);
	},
	
	tilled : function (posX, posY, sprite, width, height) {						//Creamos y añadimos una imagen que se puede tilear
		var gameObject = new XEngine.TilledImage(this.game, posX, posY, sprite, width, height);
		return this.existing(gameObject);
	},
	
	rect : function (posX, posY, width, height, color) {			//Creamos un rectangulo a partir de los datos proporcionados
		var gameObject = new XEngine.Rect(this.game, posX, posY, width, height, color);
		return this.existing(gameObject);
	},
	
	text : function (posX, posY, text, size, font, color) {
		var gameObject = new XEngine.Text(this.game, posX, posY, text, size, font, color);
		return this.existing(gameObject);
	},
	
	audio: function (audio, autoStart) {
		var audioObject = new XEngine.Audio(this.game, audio, autoStart);
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
			this.tweens[i]._destroy();
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
	
	finish : function () {
		this.time = this.duration;
	},
	
	_update: function (deltaTime) {
		if(this.target == undefined || this.target == null) {this._destroy(); return;}	//Si el target ha sido destruido, destruimos el tween
		var _this = this;
		_this.progress = XEngine.Mathf.clamp(_this.time / _this.duration, 0, 1);	//Calculamos el progreso del tween basado en el tiempo que está corriendo y la duración
		for(var property in _this.properties){									//Para cada propiedad, calculamos su valor actual y se lo asignamos al objetivo
			var t = _this.progress;
			if(_this.yoyo){
				t /= 2;
			}
			this.target[property] = XEngine.Mathf.lerp(_this.fromProperties[property], _this.properties[property], _this.easing(this.progress));
		}
		_this.time += deltaTime;												//Incrementamos el tiempo de ejecución
		if(_this.progress == 1){												//Si el tween llega al final, se comprueba si tiene que hacer loop o ha acabado
			if(_this.repeat == -1 || _this.runCount <= _this.repeat){
				_this.onCompleteLoop.dispatch();
				_this.time = 0;
				_this.progress = 0;
				_this.play();
			}else{
				_this.onComplete.dispatch();
				_this._destroy();
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
	
	_destroy: function () {														//Se destruye el tween y se libera memoria 
		this.isRunning = false;
		this.isPendingDestroy = true;	
		this.onComplete._destroy();
		this.onCompleteLoop._destroy();
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
	this.gravity = 5;															//Gravedad global
};

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
	
	_overlapHandler : function (body1, body2) {									//Determina si dos objetos de fisicas están uno encima de otro
		if(body1 == undefined || !body1._contObject.alive){													
			return false;
		}
		if(body2 == undefined || !body2._contObject.alive){
			return false;
		}
		if(this._isOverlapping(body1, body2)) 									//Miramos si colisionan
		{
			body1.onCollision(body2);											//Llamamos al método onCollision del body
			body2.onCollision(body1);											//Llamamos al método onCollision del body
			return true;
		}else{
			return false;
		}
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
	
	_isOverlapping: function (gameObject1, gameObject2) {							
		if(gameObject1 == undefined || gameObject2 == undefined){				//Si alguno de los objetos no está definido, saltamos el resto de la función
			return false;
		}
		if (gameObject1.max.x < gameObject2.min.x || gameObject1.min.x > gameObject2.max.x) {
                return false;

        } else if (gameObject1.max.y < gameObject2.min.y || gameObject1.min.y > gameObject2.max.y) {
            return false;

        } else {
            return true;
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
		var _this = this;
		_this.velocity.y += _this.physicsEngine.gravity * _this.gravity * deltaTime, -_this.maxVelocity, _this.maxVelocity;
		
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

XEngine.Mathf.angleBetween = function (originX, originY, targetX, targetY) {
	var x = targetX - originX;
	var y = targetY - originY;
	var angle = (Math.atan2(y, x));
	

    return angle;
};

XEngine.Vector = function (x, y) {												//Vector de 2 dimensiones
	this.x = x;
	this.y = y;
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


XEngine.Vector.prototype = {
	
	setTo: function (x, y) {													//Asigna los valores (solo por comodidad)
		this.x = x;
		this.y = y || x;
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
	},
	
	clickDispatcher: function (event) {
		this.onClick.dispatch(event);
		var _this = this;
		var loop = function (array) {											//Bucle que inspecciona todos los elementos de un Array
			for(var i = array.length - 1; i >= 0; i--){
				var gameObject = array[i];
				if(XEngine.Group.prototype.isPrototypeOf(gameObject)){
					if(loop(gameObject.children)) return true;					//Si éste loop ha encontrado un objeto que hacer click, terminamos 
					continue;
				}
				if(!gameObject || !gameObject.inputEnabled) continue;			//Si el objeto no existe o no tiene el input habilitado, pasamos al siguiente	
				if(_this._pointerInsideBounds(gameObject)){						//Si el area el objeto está dentro del puntero, lanzamos el click y acabamos
					if(gameObject.onClick == undefined){
						gameObject.onClick = new XEngine.Signal();
					} 
					gameObject.onClick.dispatch(event);
					return true;
				}
				return false;
			}
		};
		loop(this.game.gameObjects);
	},
	
	_pointerInsideBounds: function (gameObject) {								//Obtenemos si el puntero está dentro del area de un objeto
		var bounds = gameObject.getBounds();
		if (this.pointer.x < (gameObject.position.x - bounds.width * gameObject.anchor.x) || this.pointer.x > (gameObject.position.x + bounds.width * gameObject.anchor.x)) {
                return false;

        } else if (this.pointer.y < (gameObject.position.y - bounds.height * gameObject.anchor.y) || this.pointer.y > (gameObject.position.y + bounds.height * gameObject.anchor.y)) {
            return false;

        } else {
            return true;
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
    _this.inputEnabled = false;													//No estoy seguro de que el input funcione con todos los objetos y menos todavía con los grupos
    _this.render = true;
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
		var pos = _this.getWorldPos();
	    canvas.translate(pos.x - this.game.camera.position.x , pos.y - this.game.camera.position.y);
	    canvas.rotate(this.getTotalRotation()*Math.PI/180);
	}
};

XEngine.Group = function (game, x, y) {
	XEngine.BaseObject.call(this, game);
	var _this = this;
	_this.game = game;
    _this.children = new Array();												//Array de objetos contenidos
    _this.position.setTo(x, y);
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
		var bounds = _this.getBounds();
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
		canvas.drawImage(cache_image.image,column * cache_image.frameWidth, row * cache_image.frameHeight, cache_image.frameWidth, cache_image.frameHeight, -(bounds.width * _this.anchor.x), -(bounds.height * _this.anchor.y), bounds.width, bounds.height);
		canvas.restore();														//Restauramos el estado del canvas
	},
	
	getBounds: function () {													
		var _this = this;
		var width = _this.width * _this.scale.x;
		var height = _this.height * _this.scale.y;
		return {width : width, height: height};
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
		var bounds = _this.getBounds();
		canvas.save();
		this.applyRotationAndPos(canvas);
		canvas.fillStyle=_this.color;
		canvas.globalAlpha =_this.alpha;
		canvas.fillRect(-(bounds.width * _this.anchor.x), -(bounds.height * _this.anchor.y), bounds.width, bounds.height);
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
		var image = _this.game.cache.image(_this.sprite).image;
		var pattern = canvas.createPattern(image, "repeat");					//Creamos el patron en modo repetición
		var rectX = -(pos.x - this.game.camera.position.x + _this.offSet.x);
		var rectY = -(pos.y - this.game.camera.position.y + _this.offSet.y);
		this.applyRotationAndPos(canvas, {x: rectX, y: rectY});	
		var rectWidht = _this.width * _this.scale.x;
		var rectHeigth = _this.height * _this.scale.y;
		canvas.beginPath();
		canvas.rect(rectX, rectY, rectWidht, rectHeigth);						//Creamos el rect donde se va pintar nuestra imagen
		canvas.fillStyle = pattern;										//Asignamos el patrón que hemos creado antes
		canvas.globalAlpha =_this.alpha;							
		canvas.fill();
		canvas.restore();
	},
	
	applyRotationAndPos: function (canvas, pos) {									//Sobreescribimos el método ya que necesitamos tener en cuenta el offset
		var _this = this;
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
		
	    canvas.translate(-pos.x, -pos.y);
	    canvas.rotate(this.getTotalRotation()*Math.PI/180);
	}
};

Object.assign(XEngine.TilledImage.prototype, XEngine.TilledImage.prototypeExtends);

XEngine.Text = function (game, posX, posY, text, size, font, color){
	XEngine.BaseObject.call(this, game);
	var _this = this;
    _this.game = game;                                                   		//guardamos una referencia al juego
    _this.text = text || "";													//Set de los atributos del texto
	_this.font = font || 'Arial';
	_this.size = size || 12;
	_this.textAlign = 'left';
	_this.color = color || 'white';
	_this.style = '';
	_this.strokeWidth = 0;
	_this.strokeColor = 'black';
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
		var bounds = _this.getBounds();
		canvas.save();
		_this.applyRotationAndPos(canvas, _this.offSet);
		canvas.globalAlpha =_this.alpha;
		var font = 	font = _this.style + ' ' + _this.size + 'px ' + _this.font;
		canvas.font = font.trim();
		var pos = {x: -(bounds.width * _this.anchor.x), y: -(bounds.height * _this.anchor.y) + _this.size};
		if(_this.strokeWidth > 0){
			canvas.strokeStyle = _this.strokeColor;
    		canvas.lineWidth = _this.strokeWidth;
    		canvas.strokeText(_this.text, pos.x, pos.y);
		}
		var textSize = canvas.measureText(_this.text);
		_this.width = textSize.width;
		_this.height = _this.size;
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
		var bounds = _this.getBounds();
		canvas.save();															//Guardamos el estado actual del canvas
		var image = _this.game.cache.image(_this.sprite).image;					//Obtenemos la imagen a renderizar
		this.applyRotationAndPos(canvas);										
		canvas.globalAlpha =_this.alpha;										//Aplicamos el alpha del objeto
		//Renderizamos la imagen teniendo en cuenta el punto de anclaje
		canvas.drawImage(image, -(bounds.width * _this.anchor.x), -(bounds.height * _this.anchor.y), bounds.width, bounds.height);
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


XEngine.Audio = function (game, audioName ,autoStart){
	var _this = this;
	_this.game = game;
	_this.audio = _this.game.cache.audio(audioName).audio;
	_this.volume = 1;
	_this.audio.volume = _this.volume;
	_this.onComplete = new XEngine.Signal();
	_this.completed = false;
	_this.pendingDestroy = false;
	_this.alive = true;
	if(autoStart){
		this.play();
	}
};

XEngine.Audio.prototype = {
	
	update:function () {
		var _this = this;
		if(!_this.audio.loop && _this.audio.ended && !_this.completed){
			_this.completed = true;
			_this.onComplete.dispatch();
		}
	},
	
	play: function () {															
		this.audio.play();
	},
	
	stop: function () {
		this.audio.pause();
		this.audio.currentTime = 0;
	},
	
	pause: function () {
		this.audio.pause();
	},
	
	resume: function () {
		this.audio.resume();
	},
	
	loop: function (value) {
		this.audio.loop = value;
	},
	
	setVolume: function (newValue) {
		this.audio.volume = newValue;
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
	}
};