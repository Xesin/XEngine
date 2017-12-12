/**
 * Grupo de objetos. Es un contenedor donde poder controlar varios objetos a la vez
 * 
 * @class XEngine.Group
 * @extends XEngine.BaseObject
 * @constructor
 * 
 * @param {XEngine.Game} game - referencia el objeto del juego
 * @param {Number} x - posición en x
 * @param {Number} y - posición en y
 */
XEngine.Group = function (game, x, y) {
	XEngine.BaseObject.call(this, game);
	var _this = this;
	_this.game = game;
	_this.children = new Array(); //Array de objetos contenidos
	_this.position.setTo(x, y);
	_this.position.z = 0;
};

XEngine.Group.prototypeExtends = {
	update: function (deltaTime) {
		this.children.removePending();
		for (var i = this.children.length - 1; i >= 0; i--) //Recorremos los objetos del grupo para hacer su update
		{
			var gameObject = this.children[i];
			if (gameObject.alive) //En caso contrario miramos si contiene el método update y lo ejecutamos
			{
				gameObject.update(deltaTime);
				if (XEngine.Sprite.prototype.isPrototypeOf(gameObject)) {
					gameObject._updateAnims(this.game.deltaMillis);
				}
			}
		}
	},

	getFirstDead: function () {
		for (var i = this.children.length - 1; i >= 0; i--) //Recorremos los objetos del grupo para encontrar alguno que esté "muerto"
		{
			var gameObject = this.children[i];
			if (!gameObject.alive) {
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
		for (var i = this.children.length - 1; i >= 0; i--) //Destruimos todos los hijos y liberamos memoria	
		{
			var gameObject = this.children[i];
			if (gameObject.destroy != undefined) {
				gameObject.destroy(gameObject);
				delete this.children[i];
			}
		}
		this.children = [];
		if (this.onDestroy != undefined) {
			this.onDestroy();
		}
	},

	add: function (gameObject) {
		if (this.game.updateQueue.indexOf(gameObject) >= 0) {
			var index = this.game.updateQueue.indexOf(gameObject);
			this.game.updateQueue.splice(index, 1);
		}
		if (this.game.renderQueue.indexOf(gameObject) >= 0) {
			var index = this.game.renderQueue.indexOf(gameObject);
			this.game.renderQueue.splice(index, 1);
		}
		if (gameObject.parent.constructor == XEngine.Group && gameObject.parent.indexOf(gameObject) >= 0) {
			var index = gameObject.parent.children.indexOf(gameObject);
			gameObject.parent.children.splice(index, 1);
		}
		this.children.push(gameObject);
		if (gameObject.start != undefined) {
			gameObject.start();
		}
		gameObject.parent = this;
		return gameObject;
	},

	setAll:function(property, value){
		for (var i = this.children.length - 1; i >= 0; i--) //Recorremos los objetos del grupo para hacer su update
		{
			this.children[i][property] = value;
		}
	},

	callAll:function(funct){
		for (var i = this.children.length - 1; i >= 0; i--) //Recorremos los objetos del grupo para hacer su update
		{
			if(this.children[i][funct] != undefined)
				this.children[i][funct]();
		}
	}
};
XEngine.Group.prototype = Object.create(XEngine.BaseObject.prototype);
Object.assign(XEngine.Group.prototype, XEngine.Group.prototypeExtends); //Se le añade el prototypeExtends al prototype original
