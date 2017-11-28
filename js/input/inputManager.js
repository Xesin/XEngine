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
					if(loop(gameObject.children)) return true;
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
			return false;
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