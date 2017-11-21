/**
 * @callback easingFunction
 * @param {Number} t - tiempo en el que se encuentra el tween (valores entre 0 y 1)
 */

/**
 * Enum Para las distintas funciones de Easing
 * @enum {easingFunction}
 * 
 */
XEngine.Easing = { //Todas las funciones de Easing
	Linear: function (t) {
		return t
	},
	QuadIn: function (t) {
		return t * t
	},
	QuadOut: function (t) {
		return t * (2 - t)
	},
	QuadInOut: function (t) {
		return t < .5 ? 2 * t * t : -1 + (4 - 2 * t) * t
	},
	CubicIn: function (t) {
		return t * t * t
	},
	CubicOut: function (t) {
		return (--t) * t * t + 1
	},
	CubicInOut: function (t) {
		return t < .5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1
	},
	QuartIn: function (t) {
		return t * t * t * t
	},
	QuartOut: function (t) {
		return 1 - (--t) * t * t * t
	},
	QuartInOut: function (t) {
		return t < .5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t
	},
	QuintIn: function (t) {
		return t * t * t * t * t
	},
	QuintOut: function (t) {
		return 1 + (--t) * t * t * t * t
	},
	QuintInOut: function (t) {
		return t < .5 ? 16 * t * t * t * t * t : 1 + 16 * (--t) * t * t * t * t
	},
	SinIn: function (t) {
		if (t === 0) return 0;
		if (t === 1) return 1;
		return Math.cos(t * Math.PI / 2);
	},
	SinOut: function (t) {
		if (t === 0) return 0;
		if (t === 1) return 1;
		return Math.sin(t * Math.PI / 2);
	},
	SinInOut: function (t) {
		if (t === 0) return 0;
		if (t === 1) return 1;
		return 0.5 * (1 - Math.cos(Math.PI * t))
	},
	ExpoIn: function (t) {
		return t === 0 ? 0 : Math.pow(1024, t - 1)
	},
	ExpoOut: function (t) {
		return t === 1 ? 1 : 1 - Math.pow(2, -10 * t)
	},
	ExpoInOut: function (t) {

		if (t === 0) return 0;
		if (t === 1) return 1;
		if ((t *= 2) < 1) return 0.5 * Math.pow(1024, t - 1);
		return 0.5 * (-Math.pow(2, -10 * (t - 1)) + 2);

	},
	CircularIn: function (t) {
		return 1 - Math.sqrt(1 - t * t)
	},
	CircularOut: function (t) {
		return Math.sqrt(1 - (--t * t))
	},
	CircularInOut: function (t) {
		if ((t *= 2) < 1) return -0.5 * (Math.sqrt(1 - t * t) - 1);
		return 0.5 * (Math.sqrt(1 - (t -= 2) * t) + 1);
	},
	/*ElasticIn: function (t) {
		var s, a = 0.1,
			p = 0.4;
		if (t === 0) return 0;
		if (t === 1) return 1;
		if (!a || a < 1) {
			a = 1;
			s = p / 4;
		}
		else s = p * Math.asin(1 / a) / (2 * Math.PI);
		return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t - s) * (2 * Math.PI) / p));
	},
	ElasticOut: function (t) {
		var s, a = 0.1,
			p = 0.4;
		if (t === 0) return 0;
		if (t === 1) return 1;
		if (!a || a < 1) {
			a = 1;
			s = p / 4;
		}
		else s = p * Math.asin(1 / a) / (2 * Math.PI);
		return (a * Math.pow(2, -10 * t) * Math.sin((t - s) * (2 * Math.PI) / p) + 1);
	},
	ElasticInOut: function (t) {
		var s, a = 0.1,
			p = 0.4;
		if (t === 0) return 0;
		if (t === 1) return 1;
		if (!a || a < 1) {
			a = 1;
			s = p / 4;
		}
		else s = p * Math.asin(1 / a) / (2 * Math.PI);
		if ((t *= 2) < 1) return -0.5 * (a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t - s) * (2 * Math.PI) / p));
		return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t - s) * (2 * Math.PI) / p) * 0.5 + 1;
	},*/
	BackIn: function (t) {
		var s = 1.70158;
		return t * t * ((s + 1) * t - s);
	},
	BackOut: function (t) {
		var s = 1.70158;
		return --t * t * ((s + 1) * t + s) + 1;
	},
	BackInOut: function (t) {
		var s = 1.70158 * 1.525;
		if ((t *= 2) < 1) return 0.5 * (t * t * ((s + 1) * t - s));
		return 0.5 * ((t -= 2) * t * ((s + 1) * t + s) + 2);
	},
	BounceIn: function (t) {
		return 1 - XEngine.Easing.BounceOut(1 - t);
	},
	BounceOut: function (t) {
		if (t < (1 / 2.75)) {
			return 7.5625 * t * t;
		}
		else if (t < (2 / 2.75)) {
			return 7.5625 * (t -= (1.5 / 2.75)) * t + 0.75;
		}
		else if (t < (2.5 / 2.75)) {
			return 7.5625 * (t -= (2.25 / 2.75)) * t + 0.9375;
		}
		else {
			return 7.5625 * (t -= (2.625 / 2.75)) * t + 0.984375;
		}
	},
	BounceInOut: function (t) {
		if (t < 0.5) return XEngine.Easing.BounceIn(t * 2) * 0.5;
		return XEngine.Easing.BounceOut(t * 2 - 1) * 0.5 + 0.5;
	},
};