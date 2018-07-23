namespace XEngine {

	export class Transform {

		public position: Vector3;
		public worldPosition: Vector3;
		public scale: Vector3;
		public rotation: Vector3;
		public matrix: Mat4;
		public parent: Transform;

		public dirty: boolean;
		private _dirty = false;

		private _position: Vector3;
		private _scale: Vector3;
		private _rotation: Vector3;

		private vf = new Vector3();
		private readonly reflectV = new Vector3(1, 0, 0);

		private helperMatrix: Mat4;
		constructor() {
			this.position = new Vector3(0, 0, 0);
			this.scale = new Vector3(1);
			this.rotation = new Vector3(0, 0, 0);
			this.matrix = new Mat4();
			this.matrix.identity();
			this.helperMatrix = new Mat4();
			this.helperMatrix.identity();
			this.dirty = true;
			// this._position = this.position;
			// this._position = this.scale;
			// this._position = this.rotation;
		}

		public forward(): Vector3 {
			this.vf.setTo(0, 0, 1);
			this.helperMatrix.extractRotation(this.matrix);

			this.vf.multiplyMatrix(this.helperMatrix.elements);
			// this.vf.reflect(this.reflectV);
			return this.vf;
		}

		public calculateMatrix() {
			let translation =  this.position.toArray();
			mat4.identity(this.matrix.elements);
			mat4.translate(this.matrix.elements, this.matrix.elements, translation);
			mat4.rotateY(this.matrix.elements, this.matrix.elements, this.rotation.y * XEngine.Mathf.TO_RADIANS);
			mat4.rotateZ(this.matrix.elements, this.matrix.elements, this.rotation.z * XEngine.Mathf.TO_RADIANS);
			mat4.rotateX(this.matrix.elements, this.matrix.elements, this.rotation.x * XEngine.Mathf.TO_RADIANS);
			mat4.scale(this.matrix.elements, this.matrix.elements, this.scale.toArray());
		}

		public right(): Vector3 {
			this.vf.setTo(1, 0, 0);
			this.helperMatrix.extractRotation(this.matrix);

			this.vf.multiplyMatrix(this.helperMatrix.elements);
			// this.vf.reflect(this.reflectV);
			return this.vf;
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
