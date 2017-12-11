/**
 * Funciones mátematicas que no están en la clase Math de JS
 * 
 * @class XEngine.Mathf
 * @static
 */
XEngine.Mathf = {};

/**
 * Devuelve un float aleatorio entre el rango especificado
 * @param {Number} min - Número mínimo que puede devolver (inclusivo)
 * @param {Number} max - Número máximo que puede devolver (exclusivo)
 * 
 * @example
 * // returns 8.93
 * XEngine.Mathf.randomRange(1, 9)
 * @returns {Number}
 */
XEngine.Mathf.randomRange = function (min, max) {
	return min + (Math.random() * (max - min)); //Obtiene un float random con el rango que se le asigna, min (inclusive) y max (exclusive)
};

/**
 * Devuelve un entero aleatorio entre el rango especificado
 * @param {Number} min - Número mínimo que puede devolver (inclusivo)
 * @param {Number} max - Número máximo que puede devolver (inclusivo)
 * 
 * @example
 * // returns 3
 * XEngine.Mathf.randomIntRange(1, 9)
 * @returns {Number}
 */
XEngine.Mathf.randomIntRange = function (min, max) { //Obtiene un float random con el rango que se le asigna, min (inclusive) y max (inclusive)
	return Math.round(min + Math.random() * (max - min));
};


/**
 * Devuelve el número indicado entre el máximo y el mínimo, si number < min devuelve min, si number > max devuelve max, en cualquier otro caso devuelve number
 * @param {Number} number - Número al que se le aplica el clamp
 * @param {Number} min - Número mínimo que puede devolver
 * @param {Number} max - Número máximo que puede devolver
 * 
 * @example
 * // returns 10
 * XEngine.Mathf.clamp(70, 4, 10)
 * 
 * // returns 5
 * XEngine.Mathf.clamp(5, 4, 10)
 * @returns {Number}
 */
XEngine.Mathf.clamp = function (number, min, max) { //Devuelve el número si está dentro de min o max, en caso contrario devuelve min o max
	return Math.max(Math.min(number, max), min);
};

/**
 * Interpolacion lineal entre dos numeros
 * @param {Number} a - color 1
 * @param {Number} b - color 2
 * @param {Number} amount - 0 devuelve a, 1 devuelve b, cualquier valor entre esos devuelve un número entre a y b
 * @example
 * // returns 5
 * XEngine.Mathf.lerpColor(0, 10, 0.5)
 * @returns {Number}
 */
XEngine.Mathf.lerp = function (a, b, t) { //Interpolación lineal
	t = XEngine.Mathf.clamp(t, 0, 1);
	return (1 - t) * a + t * b;
};

/**
 * Interpolacion lineal entre dos colores
 * @param {String} a - color 1
 * @param {String} b - color 2
 * @param {Number} amount - 0 devuelve a, 1 devuelve b, cualquier valor entre esos devuelve un color entre a y b
 * @example
 * // returns #7F7F7F
 * XEngine.Mathf.lerpColor('#000000', '#ffffff', 0.5)
 * @returns {String}
 */
XEngine.Mathf.lerpColor = function (a, b, amount) {

	var ah = parseInt(a.replace(/#/g, ''), 16),
		ar = ah >> 16,
		ag = ah >> 8 & 0xff,
		ab = ah & 0xff,
		bh = parseInt(b.replace(/#/g, ''), 16),
		br = bh >> 16,
		bg = bh >> 8 & 0xff,
		bb = bh & 0xff,
		rr = ar + amount * (br - ar),
		rg = ag + amount * (bg - ag),
		rb = ab + amount * (bb - ab);

	return '#' + ((1 << 24) + (rr << 16) + (rg << 8) + rb | 0).toString(16).slice(1);
};

/**
 * Devuelve el angulo en radianes entre dos posiciones
 * @param {Number} originX - origen en X
 * @param {Number} originY - origen en Y
 * @param {Number} targetX - objetivo en X
 * @param {Number} targetY - objetivo en Y
 * @returns {Number}
 */
XEngine.Mathf.angleBetween = function (originX, originY, targetX, targetY) {
	var x = targetX - originX;
	var y = targetY - originY;
	var angle = (Math.atan2(y, x));


	return angle;
};

XEngine.Mathf.TO_RADIANS = 0.0174532925199432957;
XEngine.Mathf.TO_DEGREES = 57,2957795130823208767;

/**
 * Objeto vector que almacena coordenadas
 * 
 * @class XEngine.Vector
 * @constructor
 * 
 * @param {Number} x - posición en el eje x
 * @param {Number} y - posición en el eje y
 */
XEngine.Vector = function (x, y) { //Vector de 2 dimensiones
	/**
	 * @property {Number} x - coordenada en X
	 * @public
	 */
	this.x = x;
	/**
	 * @property {Number} y - coordenada en Y
	 * @public
	 */
	this.y = y;
	/**
	 * @property {Number} z - coordenada en Z (dentro del motor solo se usa para los sprites en isométrica)
	 * @public
	 */
	this.z = 0; //Sólo se usa en caso de isometrica
	/**
	 * @property {Number} zOffset - Añade un offset al eje Z
	 * @public
	 */
	this.zOffset = 0;
};

/**
 * Devuelve un vector que es la resta de dos vectores
 * @param {XEngine.Vector} vector1
 * @param {XEngine.Vector} vector2
 * @returns {XEngine.Vector}
 */
XEngine.Vector.sub = function (vector1, vector2) {
	var newVector = new XEngine.Vector(vector1.x, vector1.y);
	newVector.x -= vector2.x;
	newVector.y -= vector2.y;
	return newVector;
};

/**
 * Devuelve un vector que es la suma de dos vectores
 * @param {XEngine.Vector} vector1
 * @param {XEngine.Vector} vector2
 * @returns {XEngine.Vector}
 */
XEngine.Vector.add = function (vector1, vector2) {
	var newVector = new XEngine.Vector(vector1.x, vector1.y);
	newVector.x += vector2.x;
	newVector.y += vector2.y;
	return newVector;
};

/**
 * Devuelve la distancia entre dos vectores
 * @param {XEngine.Vector} vector1
 * @param {XEngine.Vector} vector2
 * @returns {Number}
 */
XEngine.Vector.distance = function (vector1, vector2) {
	var difference = XEngine.Vector.sub(vector1, vector2);
	return difference.length();
};

/**
 * Devuelve un vector que es la transformación a coordenadas isommétricas de un vector en coordenadas cartesianas
 * @param {XEngine.Vector} coordinates
 * @returns {XEngine.Vector}
 */
XEngine.Vector.cartToIsoCoord = function (coordinates) {
	var outCoordinates = new XEngine.Vector(0, 0);
	outCoordinates.x = coordinates.x - coordinates.y;
	outCoordinates.y = (coordinates.x + coordinates.y) / 2;
	outCoordinates.z = (coordinates.x + coordinates.y) + coordinates.zOffset;
	return outCoordinates;
};

/**
 * Devuelve un vector que es la transformación a coordenadas cartesianas de un vector en coordenadas isommétricas
 * @param {XEngine.Vector} coordinates
 * @returns {XEngine.Vector}
 */
XEngine.Vector.isoToCarCoord = function (isoCoord) {
	var outCoordinates = new XEngine.Vector(0, 0);
	outCoordinates.x = (isoCoord.x / 2) + isoCoord.y;
	outCoordinates.y = isoCoord.y - (isoCoord.x / 2);
	return outCoordinates;
};


XEngine.Vector.prototype = {

	/**
	 * Asigna valores al vector
	 * @method XEngine.Vector#setTo
	 * 
	 * @param {Number} x - Valor en la coordenada X
	 * @param {Number} [y=x] - Valor en la coordenada Y
	 * @public
	 */
	setTo: function (x, y) { //Asigna los valores (solo por comodidad)
		this.x = x;
		if (y === undefined) y = x;
		this.y = y;
	},

	/**
	 * Suma a este vector los valores de otro
	 * @method XEngine.Vector#add
	 * 
	 * @param {XEngine.Vector} other - Vector a sumar
	 * @public
	 */
	add: function (other) { //Suma de vectores
		this.x += other.x;
		this.y += other.y;
	},

	/**
	 * Resta a este vector los valores de otro
	 * @method XEngine.Vector#sub
	 * 
	 * @param {XEngine.Vector} other - Vector a restar
	 * @public
	 */
	sub: function (other) { //Resta de vectores
		this.x -= other.x;
		this.y -= other.y;
		return this;
	},

	/**
	 * Multiplica a este vector los valores de otro
	 * @method XEngine.Vector#multiply
	 * 
	 * @param {XEngine.Vector} other - Vector a multiplicar
	 * @public
	 */
	multiply: function (other) { //Multiplicación de vectores
		this.x *= other.x;
		this.y *= other.y;
		return this;
	},

	/**
	 * Rota el vector tantos angulos como se le indique (angulos en radianes)
	 * @method XEngine.Vector#rotate
	 * 
	 * @param {Number} angle - Angulos a rotar
	 * @public
	 */
	rotate: function (angle) { //Rotar el vector
		var x = this.x;
		var y = this.y;
		this.x = x * Math.cos(angle) - y * Math.sin(angle);
		this.y = x * Math.sin(angle) + y * Math.cos(angle);
		return this;
	},

	/**
	 * Normaliza el Vector (Ajusta las coordenadas para que la longitud del vector sea 1)
	 * @method XEngine.Vector#normalize
	 * @public
	 */
	normalize: function () { //Normalizar el vector
		var d = this.len();
		if (d > 0) {
			this.x = this.x / d;
			this.y = this.y / d;
		}
		return this;
	},

	/**
	 * Proyecta este vector en otro
	 * @method XEngine.Vector#project
	 * 
	 * @param {XEngine.Vector} other - Vector en el que proyectar
	 * @return {XEngine.Vector}
	 * @public
	 */
	project: function (other) { //Projectar el vector en otro
		var amt = this.dot(other) / other.len2();
		this.x = amt * other.x;
		this.y = amt * other.y;
		return this;
	},

	/**
	 * Retorna el producto escalar del vector con otro vector
	 * @method XEngine.Vector#dot
	 * 
	 * @param {XEngine.Vector} other - Vector con el que hacer la operación
	 * @return {Number}
	 * @public
	 */
	dot: function (other) { //Producto escalar
		return this.x * other.x + this.y * other.y;
	},

	/**
	 * Escala el vector
	 * @method XEngine.Vector#scale
	 * 
	 * @param {Number} x - Valor en la coordenada X
	 * @param {Number} [y=x] - Valor en la coordenada Y
	 * @public
	 */
	scale: function (x, y) { //Escala del vector
		this.x *= x;
		this.y *= y || x;
		return this;
	},

	/**
	 * Refleja el vector dado un eje
	 * @method XEngine.Vector#reflect
	 * 
	 * @param {XEngine.Vector} axis - Eje en el que refleja el vector
	 * @returns {XEngine.Vector}
	 * @public
	 */
	reflect: function (axis) { //Reflejar el vector en un eje (Vector)
		var x = this.x;
		var y = this.y;
		this.project(axis).scale(2);
		this.x -= x;
		this.y -= y;
		return this;
	},

	/**
	 * Longitud del vector
	 * @method XEngine.Vector#length
	 * 
	 * @returns {Number}
	 * @public
	 */
	length: function () { //Longitud de un vector
		return Math.sqrt(this.len2());
	},

	/**
	 * Devuelve el cuadrado de la longitud
	 * @method XEngine.Vector#len2
	 * 
	 * @returns {Number}
	 * @public
	 */
	len2: function () { //Cuadrado de la longitud de un vector
		return this.dot(this);
	}
};

XEngine.Vector.prototype.constructor = XEngine.Vector;
