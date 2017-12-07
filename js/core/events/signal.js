/**
 * Objeto que almacena observadores para lanzar los eventos posteriormente
 * 
 * @class XEngine.Signal
 * @constructor
 */
XEngine.Signal = function () {
	/**
	 * @property {Map.<XEngine.SignalBinding>} bindings - Almacena todos los bindings que tiene el evento
	 * @readonly
	 */
	this.bindings = {}; //Listener que tiene la señal
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
		var newBinding = new XEngine.SignalBinding(this, listener, listenerContext, false);
		this.bindings[listenerContext] = newBinding;
		return newBinding;
	},

	/**
	 * añade un listener a este objeto que solo se ejecuta una vez
	 * @method XEngine.Signal#add
	 * @param {Function} listener - funcion a ejecutar
	 * @param {Object} listenerContext - contexto en el que se ejecuta la funcion
	 * @return {XEngine.Signal}
	 */
	addOnce: function (listener, listenerContext) {
		var newBinding = new XEngine.SignalBinding(this, listener, listenerContext, true);
		this.bindings[listenerContext] = newBinding;
		return newBinding;
	},

	/**
	 * Elimina un listener de los bindings
	 * @method XEngine.Signal#add
	 * @param {XEngine.SignalBinding} signalBinding - binding a eliminar
	 */
	remove: function (listenerContext) {
		delete this.bindings[listenerContext]; //Liberamos memoria
	},

	_destroy: function () { //Libera memoria
		delete this.bindings;
		this.bindings = {};
	},

	/**
	 * Lanza el evento a todos los listeners
	 * @method XEngine.Signal#dispatch
	 * @param {Object} args[] - sequencia de todos los parametros a ser enviados
	 */
	dispatch: function () {
		this._cleanup();
		for (var listenerContext in this.bindings) {
			this.bindings[listenerContext].dispatch.apply(this.bindings[listenerContext], arguments);
		}
	},

	/**
	 * Lanza el evento a todos los listeners
	 * @method XEngine.Signal#dispatch
	 * @param {Object} args[] - sequencia de todos los parametros a ser enviados
	 */
	_cleanup: function () {
		for (var i = this.bindings.length - 1; i >= 0; i--) {
			if (this.bindings[i] == null || this.bindings[i] == undefined) { //Si el binding ha dejado de existir, lo quitamos del array
				this.bindings.splice(i, 1);
			}
		}
	}
};