/**
 * Renderer principal del juego (usa el contexto de canvas)
 * 
 * @class XEngine.Renderer
 * @constructor
 * @param {XEngine.Game} game - referencia al objeto del juego
 * @param {HTMLElement} canvas - contexto en el que pinta este renderer
 */
XEngine.Renderer = function (game, canvas) {
	this.game = game;
	this.scale = {
		x: 1,
		y: 1
	};
	try {
		// Tratar de tomar el contexto estandar. Si falla, probar otros.
		this.context = canvas.getContext("webgl") || canvas.getContext("experimental-webgl") || canvas.getContext("moz-webgl") || canvas.getContext("webkit-3d");
	}
	catch(e) {}
	
	// Si no tenemos ningun contexto GL, date por vencido ahora
	if (!this.context) {
		alert("Imposible inicializar WebGL. Tu navegador puede no soportarlo.");
		this.context = null;
	}else{
		//this.context.viewportWidth = this.game.canvas.width;
		//this.context.viewportHeight = this.game.canvas.height;
		this.context.clearColor(0.0, 0.0, 0.0, 1.0);                      // Establecer el color base en negro, totalmente opaco
		this.context.enable(this.context.DEPTH_TEST);                               // Habilitar prueba de profundidad
		this.context.depthFunc(this.context.LEQUAL);                                // Objetos cercanos opacan objetos lejanos
		this.context.clear(this.context.COLOR_BUFFER_BIT|this.context.DEPTH_BUFFER_BIT);      // Limpiar el buffer de color asi como el de profundidad
		this.context.viewport(0, 0, this.game.canvas.width, this.game.canvas.height);
		console.log(this.context);
	}
};

XEngine.Renderer.prototype = {
	/**
	 * Inicia el proceso de render
	 * @method XEngine.Renderer#render
	 * @private
	 */
	render: function () {
		this.context.clear(this.context.COLOR_BUFFER_BIT|this.context.DEPTH_BUFFER_BIT);
		this.context.viewport(0, 0, this.game.canvas.width, this.game.canvas.height);
		//this.context.clearRect(0, 0, this.game.width * this.scale.x, this.game.height * this.scale.y); //Limpiamos el canvas
		//this.context.save();
		//this.context.scale(this.scale.x, this.scale.y);
		this.renderLoop(this.game.gameObjects);
		//this.context.restore();
	},

	/**
	 * Loop que llama al render de todos los objetos. Si es un grupo, se llama a si misma.
	 * @method XEngine.Renderer#renderLoop
	 * @param {Array.<XEngine.BaseObject>} arrayObjects - Array de objetos a renderizar
	 * @private
	 */
	renderLoop: function (arrayObjects) { //Renderizamos el array de objetos que le pasamos por parametro
		var _this = this;
		for (var i = 0; i < arrayObjects.length; i++) {
			var object = arrayObjects[i];
			if (!object.render) continue;
			if (XEngine.Group.prototype.isPrototypeOf(object)) { //Si es un grupo, llamamos al render pasando los objetos que contiene
				_this.renderLoop(object.children);
			}
			else if (!XEngine.Audio.prototype.isPrototypeOf(object)) { //Si no es un audio, renderizamos
				if (!object.alive) continue;
				if (object.sprite == 'player') {
					console.log("cosa");
				}
				object._renderToCanvas(_this.context);
				if (object.body != undefined) {
					object.body._renderBounds(_this.context); //Si tiene un body, llamamos al render de los bounds
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
	 * @return {Array.<object>}
	 */
	getFrameInfo: function () {
		var data = this.context.getImageData(0, 0, this.game.width, this.game.height).data;
		var returnData = new Array();
		//Push pixel data to more usable object
		for (var i = 0; i < data.length; i += 4) {
			var rgba = {
				r: data[i],
				g: data[i + 1],
				b: data[i + 2],
				a: data[i + 3]
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
	 * @return {Array.<object>}
	 */
	getPixelInfo: function (posX, posY) {
		var data = this.context.getImageData(Math.round(posX), Math.round(posY), 1, 1).data;
		var rgba = {
			r: data[0],
			g: data[1],
			b: data[2],
			a: data[3]
		};
		return rgba;
	}
};