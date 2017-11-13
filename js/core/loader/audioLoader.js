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