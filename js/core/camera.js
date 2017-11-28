/**
 * @author Francisco Ferrer <xisco@xiscoferrer.com>
 * @license
 * Copyright © 2017 Francisco Ferrer Fernandez <http://www.xiscoferrer.com>
 * https://opensource.org/licenses/MIT
 */

 /**
* Definicion de Ejes para la camara
*
* @class XEngine.AXIS
*/
XEngine.AXIS = {
	/** @static */
	NONE: "none",
	/** @static */
	HORIZONTAL: "horizontal",
	/** @static */
	VERTICAL: "vertical",
	/** @static */
	BOTH: "both"
};
/**
 * Objeto de cámara. Se usa para saber qué se debe renderizar y dónde se ubica en pantalla
 * 
 * @class XEngine.Camera
 * @constructor
 * @param {XEngine.Game} game - Referencia al juego
 */
XEngine.Camera = function (game) {
	/**
	 * @property {XEngine.Game} game - Referencia al juego
	 * @readonly
	 */
	this.game = game;
	/**
	 * @property {XEngine.Vector} position - Posición actual de la camara
	 */
	this.position = new XEngine.Vector(0, 0);
	/**
	 * 
	 * @property {XEngine.BaseObject} followedObject - Objeto que tiene que seguir la camara. Si es nulo no sigue a nada (Se cambia con {@link XEngine.Camera#followObject})
	 * 
	 * @readonly
	 */
	this.followedObject = null;
	/**
	 * 
	 * 
	 * @property {XEngine.AXIS} axis - Ejes en los que se puede mover la cámara
	 */
	this.axis = XEngine.AXIS.BOTH;

	this.pMatrix = mat4.create();
	mat4.ortho(this.pMatrix, 0, this.game.width , this.game.height, 0, 0.1, 100);
};

XEngine.Camera.prototype = {
	/**
	 * Asigna el objeto que tiene que seguir la cámara
	 * @method XEngine.Camera#followObject
	 * @param {XEngine.BaseObject} gameObject - Objeto a seguir
	 * @param {Number} offsetLeft - Offset que tendrá por la izquierda
	 * @param {Number} offsetUp - Offset que tendrá por arriba
	 * @public
	 */
	followObject: function (gameObject, offsetLeft, offsetUp) { //Asigna el objeto a seguir
		this.follow = true;
		this.offsetLeft = offsetLeft || 0;
		this.offsetUp = offsetUp || 0;
		this.followedObject = gameObject;
	},

	/**
	 * Actualiza la cámara. Se llama automáticamente.
	 * @method XEngine.Camera#update
	 * @private
	 */
	update: function () { //Si tiene objeto a seguir, intenta alcanzarlo si el movimiento de los ejes se lo permite y si no se sale del mundo
		var _this = this;
		if (_this.followedObject != null) {
			if (_this.axis == XEngine.AXIS.BOTH || _this.axis == XEngine.AXIS.HORIZONTAL) {
				if ((_this.followedObject.position.x - _this.offsetLeft) - _this.game.width / 2 > 0 && (_this.followedObject.position.x + _this.offsetLeft) + _this.game.width / 2 < _this.game.worldWidth) {
					_this.position.x = _this.followedObject.position.x - _this.game.width / 2 - _this.offsetLeft;
				}
			}
			if (_this.axis == XEngine.AXIS.BOTH || _this.axis == XEngine.AXIS.VERTICAL) {
				if ((_this.followedObject.position.y - _this.offsetUp) - _this.game.height / 2 > 0 && (_this.followedObject.position.y + _this.offsetUp) + _this.game.height / 2 < _this.game.worldHeight) {
					_this.position.y = _this.followedObject.position.y - _this.game.height / 2 - _this.offsetUp;
				}
			}
		}
		mat4.ortho(this.pMatrix, _this.position.x , _this.game.width + _this.position.x, _this.game.height + _this.position.y, _this.position.y, 0.1, 100);
	},
};