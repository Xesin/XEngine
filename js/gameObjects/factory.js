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
	sprite: function (posX, posY, sprite, frame) { //Creamos y añadimos un sprite a partir de los datos proporcionados
		var gameObject = new XEngine.Sprite(this.game, posX, posY, sprite, frame);
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
	button: function (posX, posY, sprite, frameIdle, spriteDown, spriteOver, spriteUp) {
		var gameObject = new XEngine.Button(this.game, posX, posY, sprite, frameIdle, spriteDown, spriteOver, spriteUp);
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
	 * @param {Number} width - ancho del circulo
	 * @param {Number} height - alto del circulo
	 * @return {XEngine.Circe}
	 */
	circle: function (posX, posY, width, height) { //Creamos un rectangulo a partir de los datos proporcionados
		var gameObject = new XEngine.Circle(this.game, posX, posY, width, height);
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