namespace XEngine {

	export class Transform {

		public worldPosition: Vector3;
		public matrix: Mat4;
		public parent: Transform;

		private _dirty = false;

		private _position: Vector3;
		private _scale: Vector3;
		private _rotation: Vector3;

		private vf = new Vector3();
		private readonly reflectV = new Vector3(1, 0, 0);

		private helperMatrix: Mat4;
		constructor() {
			this._position = new Vector3(0, 0, 0);
			this._scale = new Vector3(1);
			this._rotation = new Vector3(0, 0, 0);
			this.matrix = new Mat4();
			this.matrix.identity();
			this.helperMatrix = new Mat4();
			this.helperMatrix.identity();
			this._dirty = true;
		}

		public forward(): Vector3 {
			this.vf.setTo(0, 0, 1);
			this.helperMatrix.extractRotation(this.matrix);

			this.vf.multiplyMatrix(this.helperMatrix.elements);
			return this.vf;
		}

		public calculateMatrix() {
			let translation =  this.position.toArray();
			mat4.identity(this.matrix.elements);
			mat4.translate(this.matrix.elements, this.matrix.elements, translation);
			mat4.rotateY(this.matrix.elements, this.matrix.elements, this.rotation.y * XEngine.Mathf.TO_RADIANS);
			mat4.rotateX(this.matrix.elements, this.matrix.elements, this.rotation.x * XEngine.Mathf.TO_RADIANS);
			mat4.rotateZ(this.matrix.elements, this.matrix.elements, this.rotation.z * XEngine.Mathf.TO_RADIANS);
			mat4.scale(this.matrix.elements, this.matrix.elements, this.scale.toArray());
		}

		public right(): Vector3 {
			this.vf.setTo(1, 0, 0);
			this.helperMatrix.extractRotation(this.matrix);

			this.vf.multiplyMatrix(this.helperMatrix.elements);
			// this.vf.reflect(this.reflectV);
			return this.vf;
		}

		get position () : Vector3 {
			return this._position;
		}
	
		set position (value : Vector3) {
			this._position = value;
			this.dirty = true;
		}

		get scale (): Vector3 {
			return this._scale;
		}

		set scale(value : Vector3) {
			this._scale = value;
			this.dirty = true;
		}

		get rotation (): Vector3 {
			return this._rotation;
		}

		set rotation (value : Vector3) {
			this._rotation = value;
			this.dirty = true;
		}

		get dirty() :boolean {
			return this._dirty || this.position.dirty || this.scale.dirty || this.rotation.dirty;
		}

		set dirty(value: boolean) {
			this._dirty = this.position.dirty = this.scale.dirty = this.rotation.dirty = value;
		}
	}
}
