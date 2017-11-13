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