/**
 * Objeto de físicas. Contiene toda la información sobre el comportamiento que debe tener un objeto dentro del motor de físicas
 * 
 * @class XEngine.Physics.PhysicsBody
 * @constructor
 * 
 * @param {XEngine.Game} game - referencia al objeto principal del juego
 * @param {XEngine.Vector} position - posición inicial del objeto de físicas
 * @param {XEngine.BaseObject} contObject - referencia al objeto que controla
 */
XEngine.Physics.PhysicsBody = function (game, position, contObject) {
	this.game = game;
	/**
	 * @property {XEngine.Vector} position - determina la posición del objeto
	 * @public
	 */
	this.position = position;
	/**
	 * @property {XEngine.Vector} velocity - determina la velocidad actual
	 * @public
	 */
	this.velocity = new XEngine.Vector(0, 0);
	
	/**
	 * @property {Boolean} collideWithWorld - Determina si colisiona con los limites del mundo
	 * @public
	 */
	this.collideWithWorld = false;
	
	/**
	 * @property {Number} restitution - Cantidad de energia que mantiene al collisionar
	 * @public
	 */
	this.restitution = 0.1; 
	
	/**
	 * @property {Number} restitution - Gravedad local (cuanto la afecta la gravedad)
	 * @public
	 */
	this.gravity = 9;
	
	/**
	 * @property {Number} maxVelocity - Velocidad máxima que puede tener el objeto
	 * @public
	 */
	this.maxVelocity = 300;
	/**
	 * @property {Number} staticFriction - Fricción base para la velocidad en x
	 * @public
	 */
	this.staticFriction = 40;
	
	/**
	 * @property {Boolean} pendingDestroy - Si es true, el objeto será eliminado en el siguiente update
	 * @readonly
	 */
	this.pendingDestroy = false;
	
	/**
	 * @property {XEngine.Vector} acceleration - Aceleración del objeto
	 * @public
	 */
	this.acceleration = new XEngine.Vector(0, 0);
	
	/**
	 * @property {XEngine.Vector} min - Bounds en la posición mínima de cada eje
	 * @readonly
	 */
	this.min = new XEngine.Vector(0, 0); //Min y Max son los bounds del objeto
	/**
	 * @property {XEngine.Vector} max - Bounds en la posición máxima de cada eje
	 * @readonly
	 */
	this.max = new XEngine.Vector(0, 0);
	/**
	 * @property {Boolean} debug - Si es true, se pintará una caja verder indicando los bounds del objeto
	 * @public
	 */
	this.debug = false;
	/**
	 * @property {XEngine.BaseObject} _contObject - Objeto que controla este body
	 * @readonly
	 */
	this._contObject = contObject;
	/**
	 * @property {XEngine.BaseObject} bounds - Ancho y alto del objeto que está controlando
	 * @public
	 */
	this.bounds = this._contObject.getBounds();
	this.updateBounds();
};

XEngine.Physics.PhysicsBody.prototype = {
	
	/**
	 * Marca el objeto para que sea destruido
	 * @method XEngine.Physics.PhysicsBody#destroy
	 * @private
	 */
	destroy: function () {
		this.pendingDestroy = true;
	},

	/**
	 * Acualiza velocidades y mueve al objeto
	 * @method XEngine.Physics.PhysicsBody#update
	 * @param {Number} deltaTime - Tiempo entre frames en segundos
	 * @private
	 */
	update: function (deltaTime) {
		if (this.immovable) {
			this.updateBounds();
			return;
		}
		var _this = this;
		_this.velocity.y += _this.physicsEngine.gravity * _this.gravity * deltaTime;

		if (_this.velocity.x != 0 && _this.acceleration.x == 0) { //Si el objeto tiene velocidad y no está acelerando, se le aplica la fricción
			var signX = _this.velocity.x / Math.abs(_this.velocity.x); //Se obtiene el signo (dirección, negativa o positiva)
			var newVelocityX = XEngine.Mathf.clamp(Math.abs(_this.velocity.x) - _this.staticFriction * deltaTime, 0, _this.maxVelocity); //Se obtiene la nueva velocidad en valores positivos
			newVelocityX *= signX; //Se le aplica el signo
			_this.velocity.x = newVelocityX; //Se asigna la nueva velocidad
		}

		if (_this.velocity.y != 0 && _this.acceleration.y == 0 && _this.gravity == 0) { //Si el objeto tiene velocidad y no está acelerando, se le aplica la fricción
			var signY = _this.velocity.y / Math.abs(_this.velocity.y); //Se obtiene el signo (dirección, negativa o positiva)
			var newVelocityY = XEngine.Mathf.clamp(Math.abs(_this.velocity.y), 0, _this.maxVelocity); //Se obtiene la nueva velocidad en valores positivos
			newVelocityY *= signY; //Se le aplica el signo
			_this.velocity.y = newVelocityY; //Se asigna la nueva velocidad
		}

		_this.velocity.x += _this.acceleration.x * deltaTime; //Aplicamos la aceleracion
		_this.velocity.y += _this.acceleration.y * deltaTime;

		_this.velocity.y = XEngine.Mathf.clamp(_this.velocity.y, -_this.maxVelocity, _this.maxVelocity); //Aplicamos la velocidad máxima
		_this.velocity.x = XEngine.Mathf.clamp(_this.velocity.x, -_this.maxVelocity, _this.maxVelocity);

		_this.position.x += _this.velocity.x * deltaTime; //Actualizamos la posición en base a la velocidad
		_this.position.y += _this.velocity.y * deltaTime;

		_this._contObject.position = _this.position; //Actualizamos la posición del objeto controlado
		_this.updateBounds(); //Actualizamos los bounds una vez se ha calculado la nueva posición
		if (_this.collideWithWorld) { //Si tiene que colisionar con el mundo, evitamos que se salga
			if (_this.min.x < 0) { //Izquierda
				_this.position.x = (_this.bounds.width * _this._contObject.anchor.x);
				_this.velocity.x = (-this.velocity.x * _this.restitution);
			}
			else if (_this.max.x > _this.game.worldWidth) { //Derecha
				_this.position.x = _this.game.worldWidth - (_this.bounds.width * (1 - _this._contObject.anchor.x));
				_this.velocity.x = (-this.velocity.x * _this.restitution);
			}
			if (_this.min.y < 0) { //Arriba
				_this.position.y = (_this.bounds.height * _this._contObject.anchor.y);
				_this.velocity.y = (-this.velocity.y * _this.restitution);
			}
			else if (_this.max.y > _this.game.worldHeight) { //Abajo
				_this.position.y = _this.game.worldHeight - (_this.bounds.height * (1 - _this._contObject.anchor.y));
				_this.velocity.y = (-this.velocity.y * _this.restitution);
			}
		}

	},

	/**
	 * Actualiza los bounds minimos y maximos
	 * @method XEngine.Physics.PhysicsBody#updateBounds
	 * @private
	 */
	updateBounds: function () { //Se obtiene la caja de colisión teniendo en cuenta el achor del sprite
		var _this = this;
		_this.min.x = _this.position.x - (_this.bounds.width * _this._contObject.anchor.x);
		_this.min.y = _this.position.y - (_this.bounds.height * _this._contObject.anchor.y);
		_this.max.x = _this.position.x + (_this.bounds.width * (1 - _this._contObject.anchor.x));
		_this.max.y = _this.position.y + (_this.bounds.height * (1 - _this._contObject.anchor.y));
	},

	/**
	 * Renderiza la caja verde que indica los bounds encima del objeto
	 * @method XEngine.Physics.PhysicsBody#_renderBounds
	 * @param {CanvasRenderingContext2D} canvas - Contexto de canvas en el que pinta la caja
	 * @private
	 */
	_renderBounds: function (canvas) {
		var _this = this;
		if (_this.debug) { //Si el objeto está en debug, pintaremos su bounding box por encima
			canvas.save();
			canvas.fillStyle = 'rgba(200,255,200, 0.7)';
			canvas.fillRect(_this.position.x - (_this.bounds.width * _this._contObject.anchor.x), _this.position.y - (_this.bounds.height * _this._contObject.anchor.y), _this.bounds.width, _this.bounds.height);
			canvas.restore();
		}
	},

	/**
	 * Obtiene la posición del objeto en coordenadas globales
	 * @method XEngine.Physics.PhysicsBody#getWorldPos
	 * @returns {XEngine.Vector}
	 * @public
	 */
	getWorldPos: function () {
		var parentPos = this._contObject.parent.getWorldPos();
		var x = this.position.x + parentPos.x;
		var y = this.position.y + parentPos.y;
		
		return new XEngine.Vector(x, y);
	},
	
	/**
	 * Llama al evento onCollision del objeto al que controla
	 * @method XEngine.Physics.PhysicsBody#onCollision
	 * @private
	 */
	onCollision: function (other) {
		if (this._contObject.onCollision != undefined) { //Si el objeto controlado tiene implementado el metodo, lo llamamos
			this._contObject.onCollision(other._contObject);
		}
	},

	/**
	 * Llama al evento onOverlap del objeto al que controla
	 * @method XEngine.Physics.PhysicsBody#onOverlap
	 * @private
	 */
	onOverlap: function (other) {
		if (this._contObject.onOverlap != undefined) { //Si el objeto controlado tiene implementado el metodo, lo llamamos
			this._contObject.onOverlap(other._contObject);
		}
	},

	/**
	 * Deshabilita y destruye este objeto
	 * @method XEngine.Physics.PhysicsBody#disablePhysics
	 * @private
	 */
	disablePhysics: function () { //Deshabilitamos las fisicas para este objeto
		var index = this.physicsEngine.physicsObjects.indexOf(this);
		this.physicsEngine.physicsObjects.splice(index, 1);
		this.destroy();
		this._contObject.body = undefined;
		delete this;
	}
};
