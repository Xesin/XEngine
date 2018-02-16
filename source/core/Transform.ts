namespace XEngine {

	export class Transform {

		public position: Vector;
		public scale: Vector;
		public rotation: Vector;

		public dirty: boolean;
		private _dirty = false;

		private _position: Vector;
		private _scale: Vector;
		private _rotation: Vector;

		constructor() {
			this.position = new Vector(0);
			this.scale = new Vector(1);
			this.rotation = new Vector(0, 0, 0);

			// this._position = this.position;
			// this._position = this.scale;
			// this._position = this.rotation;
		}
	}

	Object.defineProperties(Transform.prototype, {
		position: {
			enumerable: false,

			get: function () {
				return this._position;
			},

			set: function (value) {
				this._position = value;
				this._dirty = true;
			},
		},
		scale: {
			enumerable: false,

			get: function () {
				return this._scale;
			},

			set: function (value) {
				this._scale = value;
				this._dirty = true;
			},
		},
		// tslint:disable-next-line:object-literal-sort-keys
		rotation: {
			enumerable: false,

			get: function () {
				return this._rotation;
			},

			set: function (value) {
				this._rotation = value;
				this._dirty = true;
			},
		},
		dirty: {
			get: function() {
				return this._dirty || this.position.dirty || this.scale.dirty || this.rotation.dirty;
			},

			set: function(value) {
				this._dirty = this.position.dirty = this.scale.dirty = this.rotation.dirty = value;
			},
		},
	});
}
