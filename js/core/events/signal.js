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
		var newBinding = new XEngine.SignalBinding(this, listener, listenerContext, false);
		this.bindings.push(newBinding);
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
		this.bindings.push(newBinding);
		return newBinding;
	},

	/**
	 * Elimina un listener de los bindings
	 * @method XEngine.Signal#add
	 * @param {XEngine.SignalBinding} signalBinding - binding a eliminar
	 */
	unbind: function (signalBinding) {
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