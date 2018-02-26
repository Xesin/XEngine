namespace XEngine {

	export class Transform {

		public position: Vector3;
		public scale: Vector3;
		public rotation: Vector3;
		public  matrix: Mat4;

		public dirty: boolean;
		private _dirty = false;

		private _position: Vector3;
		private _scale: Vector3;
		private _rotation: Vector3;

		private helperMatrix: Mat4;
		constructor() {
			this.position = new Vector3(0, 0, 0);
			this.scale = new Vector3(1);
			this.rotation = new Vector3(0, 0, 0);
			this.matrix = new Mat4();
			this.matrix.identity();
			this.helperMatrix = new Mat4();
			this.helperMatrix.identity();
			// this._position = this.position;
			// this._position = this.scale;
			// this._position = this.rotation;
		}

		public forward(): Vector3 {
			let vf = new Vector3(0, 0, 1);
			this.helperMatrix.extractRotation(this.matrix);

			vf.multiplyMatrix(this.helperMatrix.elements);
			vf.reflect(new Vector3(1, 0, 0));
			return vf;
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
