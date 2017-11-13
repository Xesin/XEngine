/**
 * @author Francisco Ferrer <xisco@xiscoferrer.com>
 * @license
 * Copyright © 2017 Francisco Ferrer Fernandez <http://www.xiscoferrer.com>
 * https://opensource.org/licenses/MIT
 */

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