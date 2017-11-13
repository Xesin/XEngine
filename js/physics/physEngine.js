// ----------------------------------------- PHYSICS ------------------------------------------//


/**
 * Motor de físicas
 * 
 * @class XEngine.Physics
 * @constructor
 * 
 * @param {XEngine.Game} game - referencia al objeto principal del juego
 */
XEngine.Physics = function (game) {
	this.game = game;
	/**
	 * @property {Boolean} systemEnabled - determina si el motor está activo
	 * @public
	 */
	this.systemEnabled = false; //Flag de sistema habilitado
	/**
	 * @property {Array.<XEngine.Physics.PhysicsBody>} physicsObjects - determina si el motor está activo
	 * @private
	 */
	this.physicsObjects = new Array(); //Array de objetos que tienen fisicas activas
	/**
	 * @property {Number} gravity - Cantidad de gravedad que hay en el juego
	 * @public
	 */
	this.gravity = 1; //Gravedad global
};

XEngine.Physics.Shapes = {
		Box: 0,
		Circle: 0
	},

	XEngine.Physics.prototype = {
		/**
		 * Arranca el motor de fisicas
		 * @method XEngine.Physics#startSystem
		 * @public
		 */
		startSystem: function () {
			this.systemEnabled = true; //Arranca el sistema
		},
		/**
		 * Pausa el motor de físicas
		 * @method XEngine.Physics#pauseSystem
		 * @public
		 */
		pauseSystem: function () {
			this.systemEnabled = false; //Pausa el sistema
		},
		/**
		 * Para por completo el motor y elimina los objetos que tenía añadidos
		 * @method XEngine.Physics#stop
		 * @public
		 */
		stop: function () { //Para por comleto el sistema
			this.systemEnabled = false;
			this._destroy();
		},
		/**
		 * Habilita las físicas para un objeto
		 * @method XEngine.Physics#enablePhysics
		 * @param {XEngine.BaseObject} gameObject - objeto al que se le habilitan las físicas
		 * @public
		 */
		enablePhysics: function (gameObject) { //Habilita las fisicas para un objeto
			gameObject.body = new XEngine.Physics.PhysicsBody(this.game, gameObject.position, gameObject); //Se crea el objeto de fisicas
			gameObject.body.physicsEngine = this; //Se le asigna una referencia a este sistema
			this.physicsObjects.push(gameObject.body); //Se añade el objeto de fisicas al array
		},
		/**
		 * Hace los cambios oportunos antes de llamar al update
		 * @method XEngine.Physics#preupdate
		 * @private
		 */
		preupdate: function () {
			for (var i = this.physicsObjects.length - 1; i >= 0; i--) //Recorremos los objetos del motor de fisicas para hacer su update
			{
				var gameObject = this.physicsObjects[i];
				if (gameObject.preupdate != undefined) //En caso contrario miramos si contiene el método update y lo ejecutamos
				{
					gameObject.preupdate();
				}
			}
		},
		/**
		 * Llama al update de todos los objetos que contiene
		 * @method XEngine.Physics#update
		 * @param {Number} deltaTime - Tiempo entre frames en segundos
		 * @private
		 */
		update: function (deltaTime) {
			var _this = this;
			for (var i = _this.physicsObjects.length - 1; i >= 0; i--) //Recorremos los objetos del motor de fisicas para hacer su update
			{
				var gameObject = _this.physicsObjects[i];
				if (!gameObject || gameObject.isPendingDestroy) //Si es un objeto destruido lo eliminamos del array y liberamos memoria
				{
					delete this.physicsObjects[i];
					this.physicsObjects.splice(i, 1);
				}
				else if (gameObject.update != undefined) //En caso contrario miramos si contiene el método update y lo ejecutamos
				{
					gameObject.update(deltaTime);
				}
			}
		},

		/**
		 * Devuelve true si los dos objetos están uno encima del otro
		 * @method XEngine.Physics#_isOverlapping
		 * @param {XEngine.Physics.PhysicsBody} gameObject1 - Primer objeto
		 * @param {XEngine.Physics.PhysicsBody} gameObject2 - Segundo objeto
		 * @returns {Boolean}
		 * @private
		 */
		_isOverlapping: function (gameObject1, gameObject2) {
			if (gameObject1 == undefined || gameObject2 == undefined) { //Si alguno de los objetos no está definido, saltamos el resto de la función
				return false;
			}
			if (gameObject1.max.x <= gameObject2.min.x || gameObject1.min.x >= gameObject2.max.x) {
				return false;

			}
			else if (gameObject1.max.y <= gameObject2.min.y || gameObject1.min.y >= gameObject2.max.y) {
				return false;

			}
			else {
				return true;
			}
		},

		/**
		 * Ejecuta los ovelaps si se da el caso
		 * @method XEngine.Physics#_overlaphandler
		 * @param {XEngine.Physics.PhysicsBody} body1 - Primer objeto
		 * @param {XEngine.Physics.PhysicsBody} body2 - Segundo objeto
		 * @returns {Boolean}
		 * @private
		 */
		_overlapHandler: function (body1, body2) { //Determina si dos objetos de fisicas están uno encima de otro
			if (body1 == undefined || !body1._contObject.alive) {
				return false;
			}
			if (body2 == undefined || !body2._contObject.alive) {
				return false;
			}
			if (this._isOverlapping(body1, body2)) //Miramos si colisionan
			{
				body1.onOverlap(body2); //Llamamos al método onOverlap del body
				body2.onOverlap(body1); //Llamamos al método onOverlap del body
				return true;
			}
			else {
				return false;
			}
		},

		/**
		 * Ejecuta los onCollision y separa los objetos si se da el caso
		 * @method XEngine.Physics#_collisionHandler
		 * @param {XEngine.Physics.PhysicsBody} body1 - Primer objeto
		 * @param {XEngine.Physics.PhysicsBody} body2 - Segundo objeto
		 * @returns {Boolean}
		 * @private
		 */
		_collisionHandler: function (body1, body2) { //Determina si dos objetos de fisicas están uno encima de otro
			if (body1 == undefined || !body1._contObject.alive) {
				return false;
			}
			if (body2 == undefined || !body2._contObject.alive) {
				return false;
			}

			if (this._isOverlapping(body1, body2)) {
				var overlapX = this.getOverlapX(body1, body2);
				var overlapY = this.getOverlapY(body1, body2);
				if (Math.abs(overlapX) > Math.abs(overlapY)) {
					this.separateY(body1, body2, overlapY);
					if (this._isOverlapping(body1, body2)) {
						this.separateX(body1, body2, overlapX);
					}
				}
				else {
					this.separateX(body1, body2, overlapX);
					if (this._isOverlapping(body1, body2)) {
						this.separateY(body1, body2, overlapY);
					}
				}

				body1.onCollision(body2); //Llamamos al método onCollision del body
				body2.onCollision(body1); //Llamamos al método onCollision del body
				return true;
			}
			else {
				return false;
			}
		},
		
		/**
		 * Separa los objetos en el eje X
		 * @method XEngine.Physics#separateX
		 * @param {XEngine.Physics.PhysicsBody} body1 - Primer objeto
		 * @param {XEngine.Physics.PhysicsBody} body2 - Segundo objeto
		 * @param {Number} overlap - Cantidad de overlap que hay
		 * @returns {Boolean}
		 * @private
		 */
		separateX: function (body1, body2, overlap) {

			//  Can't separate two immovable bodies, or a body with its own custom separation logic
			if (body1.immovable && body2.immovable) {
				//  return true if there was some overlap, otherwise false
				return (overlap !== 0);
			}

			if (overlap === 0)
				return false;

			//  Adjust their positions and velocities accordingly (if there was any overlap)
			var v1 = body1.velocity.x;
			var v2 = body2.velocity.x;
			var e = Math.min(body1.restitution, body2.restitution);

			if (!body1.immovable && !body2.immovable) {
				overlap *= 0.5;

				body1.position.x -= overlap;
				body2.position.x += overlap;

				var nv1 = Math.sqrt((v2 * v2 * body2.mass) / body1.mass) * ((v2 > 0) ? 1 : -1);
				var nv2 = Math.sqrt((v1 * v1 * body1.mass) / body2.mass) * ((v1 > 0) ? 1 : -1);
				var avg = (nv1 + nv2) * 0.5;

				nv1 -= avg;
				nv2 -= avg;

				body1.velocity.x = avg + nv1 * e;
				body2.velocity.x = avg + nv2 * e;
				body1.updateBounds();
				body2.updateBounds();
			}
			else if (!body1.immovable) {
				body1.position.x -= overlap;
				body1.velocity.x = v2 - v1 * e;
				body1.updateBounds();
			}
			else {
				body2.position.x += overlap;
				body2.velocity.x = v1 - v2 * e;
				body2.updateBounds();
			}

			//  If we got this far then there WAS overlap, and separation is complete, so return true
			return true;

		},

		/**
		 * Separa los objetos en el eje Y
		 * @method XEngine.Physics#separateY
		 * @param {XEngine.Physics.PhysicsBody} body1 - Primer objeto
		 * @param {XEngine.Physics.PhysicsBody} body2 - Segundo objeto
		 * @param {Number} overlap - Cantidad de overlap que hay
		 * @returns {Boolean}
		 * @private
		 */
		separateY: function (body1, body2, overlap) {

			//  Can't separate two immovable bodies, or a body with its own custom separation logic
			if (body1.immovable && body2.immovable) {
				//  return true if there was some overlap, otherwise false
				return (overlap !== 0);
			}

			if (overlap === 0)
				return false;

			//  Adjust their positions and velocities accordingly (if there was any overlap)
			var v1 = body1.velocity.y;
			var v2 = body2.velocity.y;
			var e = Math.min(body1.restitution, body2.restitution);

			if (!body1.immovable && !body2.immovable) {
				overlap *= 0.5;

				body1.position.y -= overlap;
				body2.position.y += overlap;

				var nv1 = Math.sqrt((v2 * v2 * body2.mass) / body1.mass) * ((v2 > 0) ? 1 : -1);
				var nv2 = Math.sqrt((v1 * v1 * body1.mass) / body2.mass) * ((v1 > 0) ? 1 : -1);
				var avg = (nv1 + nv2) * 0.5;

				nv1 -= avg;
				nv2 -= avg;

				body1.velocity.y = avg + nv1 * e;
				body2.velocity.y = avg + nv2 * e;
				body1.updateBounds();
				body2.updateBounds();
			}
			else if (!body1.immovable) {
				body1.position.y -= overlap;
				body1.velocity.y = v2 - v1 * e;
				body1.updateBounds();
			}
			else {
				body2.position.y += overlap;
				body2.velocity.y = v1 - v2 * e;
				body2.updateBounds();
			}

			//  If we got this far then there WAS overlap, and separation is complete, so return true
			return true;

		},

		/**
		 * Obtiene la cantidad de overlap que hay entre dos objetos en el eje Y
		 * @method XEngine.Physics#getOverlapY
		 * @param {XEngine.Physics.PhysicsBody} body1 - Primer objeto
		 * @param {XEngine.Physics.PhysicsBody} body2 - Segundo objeto
		 * @returns {Boolean}
		 * @public
		 */
		getOverlapY: function (body1, body2) {
			var overlap = 0;

			if (body1.velocity.y > body2.velocity.y) {
				overlap = body1.max.y - body2.min.y;
				body1.inAir = false;
			}
			else if (body1.velocity.y < body2.velocity.y) {
				overlap = body1.min.y - body2.max.y;
				body2.inAir = false;
			}

			return overlap;
		},

		/**
		 * Obtiene la cantidad de overlap que hay entre dos objetos en el eje X
		 * @method XEngine.Physics#getOverlapX
		 * @param {XEngine.Physics.PhysicsBody} body1 - Primer objeto
		 * @param {XEngine.Physics.PhysicsBody} body2 - Segundo objeto
		 * @returns {Boolean}
		 * @public
		 */
		getOverlapX: function (body1, body2) {
			var overlap = 0;

			if (body1.velocity.x > body2.velocity.x) {
				overlap = body1.max.x - body2.min.x;
			}
			else if (body1.velocity.x < body2.velocity.x) {
				overlap = body1.min.x - body2.max.x;
			}

			return overlap;
		},

		/**
		 * Ejecuta todo el calculo de la colisión para hacer overlap
		 * @method XEngine.Physics#overlap
		 * @param {XEngine.BaseObject} collider - Objeto que colisiona
		 * @param {XEngine.BaseObject} collideWith - Objeto con el que colisiona el primer objeto
		 * @public
		 */
		overlap: function (collider, collideWith) { //Metodo que se llama para que se determine el overlapping de dos objetos
			var _this = this;
			if (!_this.systemEnabled) return;
			var _coll1;
			var _coll2;
			if (XEngine.Group.prototype.isPrototypeOf(collider) && XEngine.Group.prototype.isPrototypeOf(collideWith)) {
				for (var i = 0; i < collider.children.length; i++) {
					_coll1 = collider.children[i].body;

					for (var j = 0; j < collideWith.children.length; j++) {
						_coll2 = collideWith.children[j].body;
						_this._overlapHandler(_coll1, _coll2);
					}
				}
			}
			else if (!XEngine.Group.prototype.isPrototypeOf(collider) && XEngine.Group.prototype.isPrototypeOf(collideWith)) {
				_coll1 = collider.body;
				for (var i = 0; i < collideWith.children.length; i++) {
					_coll2 = collideWith.children[i].body;
					_this._overlapHandler(_coll1, _coll2);
				}
			}
			else if (XEngine.Group.prototype.isPrototypeOf(collider) && !XEngine.Group.prototype.isPrototypeOf(collideWith)) {
				_coll2 = collideWith.body;
				for (var i = 0; i < collider.children.length; i++) {
					_coll1 = collider.children[i].body;
					_this._overlapHandler(_coll1, _coll2);
				}
			}
			else {
				_coll1 = collider.body;
				_coll2 = collideWith.body;
				_this._overlapHandler(_coll1, _coll2);
			}
		},

		/**
		 * Ejecuta todo el calculo de la colisión para hacer colisión
		 * @method XEngine.Physics#collide
		 * @param {XEngine.BaseObject} collider - Objeto que colisiona
		 * @param {XEngine.BaseObject} collideWith - Objeto con el que colisiona el primer objeto
		 * @public
		 */
		collide: function (collider, collideWith) { //Metodo que se llama para que se determine el overlapping de dos objetos
			var _this = this;
			if (!_this.systemEnabled) return;
			var _coll1;
			var _coll2;
			if (XEngine.Group.prototype.isPrototypeOf(collider) && XEngine.Group.prototype.isPrototypeOf(collideWith)) {
				for (var i = 0; i < collider.children.length; i++) {
					_coll1 = collider.children[i].body;

					for (var j = 0; j < collideWith.children.length; j++) {
						_coll2 = collideWith.children[j].body;
						_this._collisionHandler(_coll1, _coll2);
					}
				}
			}
			else if (!XEngine.Group.prototype.isPrototypeOf(collider) && XEngine.Group.prototype.isPrototypeOf(collideWith)) {
				_coll1 = collider.body;
				for (var i = 0; i < collideWith.children.length; i++) {
					_coll2 = collideWith.children[i].body;
					_this._collisionHandler(_coll1, _coll2);
				}
			}
			else if (XEngine.Group.prototype.isPrototypeOf(collider) && !XEngine.Group.prototype.isPrototypeOf(collideWith)) {
				_coll2 = collideWith.body;
				for (var i = 0; i < collider.children.length; i++) {
					_coll1 = collider.children[i].body;
					_this._collisionHandler(_coll1, _coll2);
				}
			}
			else {
				_coll1 = collider.body;
				_coll2 = collideWith.body;
				_this._collisionHandler(_coll1, _coll2);
			}
		},

		/**
		 * Destruye todos los objetos de físicas que están registrados en el motor
		 * @method XEngine.Physics#_destroy
		 * @private
		 */
		_destroy: function () {
			this.physicsObjects = new Array();
		}
	};