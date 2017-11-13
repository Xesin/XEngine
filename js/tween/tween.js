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