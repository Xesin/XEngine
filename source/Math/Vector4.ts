namespace XEngine2 {

	export class Vector4 {

		private static readonly _zero = new Vector4(0);
		public zOffset = 0;

		private dirty = true;
		private _x: number;
		private _y: number;
		private _z: number;
		private _w: number;
		private arr: Array<number>;

		constructor (x = 1, y = x, z = x, w = x) {
			this.x = x;
			this.y = y;
			this.z = z;
			this.w = w;
			this.arr = new Array(3);

			this.zOffset = 0;
		}

		public get Dirty() : boolean {
			return this.dirty;
		}
		
		
		public set Dirty(v : boolean) {
			this.dirty = v;
		}

		
		public set x(v : number) {
			this.Dirty = true;
			this._x = v;
		}
		
		
		public get x() : number {
			return this._x;
		}

		public set y(v : number) {
			this.Dirty = true;
			this._y = v;
		}
		
		
		public get y() : number {
			return this._y;
		}

		public set z(v : number) 
		{
			this.Dirty = true;
			this._z = v;
		}
		
		
		public get z() : number {
			return this._z;
		}

		public set w(v : number) 
		{
			this.Dirty = true;
			this._w = v;
		}
		
		
		public get w() : number {
			return this._w;
		}

		public setTo(x: number, y = x, z = x, w = x): Vector4 {
			this.x = x;
			this.y = y;
			this.z = z;
			this.w = w;
			return this;
		}

		public sub(vector: Vector4): Vector4 {
			this.x -= vector.x;
			this.y -= vector.y;
			this.z -= vector.z;
			this.w -= vector.w;

			return this;
		}

		public add(vector: Vector4): Vector4 {
			this.x += vector.x;
			this.y += vector.y;
			this.z += vector.z;
			this.w += vector.w;

			return this;
		}

		public multiply(vector: Vector4): Vector4 {
			this.x *= vector.x;
			this.y *= vector.y;
			this.z *= vector.z;
			this.w *= vector.w;
			return this;
		}

		public multiplyMatrix(matrix: Mat4x4): Vector4 {
			let x = this.x, y = this.y, z = this.z, w = this.w;

			this.x = matrix.elements[0] * x + matrix.elements[4] * y + matrix.elements[8] * z +  matrix.elements[12] * w;
			this.y = matrix.elements[1] * x + matrix.elements[5] * y + matrix.elements[9] * z +  matrix.elements[13] * w;
			this.z = matrix.elements[2] * x + matrix.elements[6] * y + matrix.elements[10] * z + matrix.elements[14] * w;
			this.w = matrix.elements[3] * x + matrix.elements[7] * y + matrix.elements[11] * z + matrix.elements[15] * w;
			return this;
		}

		public normalize(): Vector4 {
			let d = this.length();
			if (d > 0) {
				this.x = this.x / d;
				this.y = this.y / d;
				this.z = this.z / d;
				this.w = this.w / d;
			}
			return this;
		}

		public project(vector: Vector4): Vector4 {
			let amt = this.dot(vector) / vector.len2();
			this.x = amt * vector.x;
			this.y = amt * vector.y;
			this.z = amt * vector.z;
			return this;
		}

		public scale(scalarNum: number): Vector4 {
			this.x *= scalarNum;
			this.y *= scalarNum;
			this.z *= scalarNum;
			this.w *= scalarNum;

			return this;
		}

		public reflect(axis: Vector4): Vector4 {
			let x = this.x;
			let y = this.y;
			let z = this.z;
			this.project(axis).scale(2);
			this.x -= x;
			this.y -= y;
			this.z -= z;
			return this;
		}

		public distance(vector: Vector4): number {
			let tmp = new Vector4(this.x, this.y, this.z, this.w);
			tmp.sub(vector);
			return tmp.length();
		}

		public len2(): number {
			return this.dot(this);
		}

		public length(): number {
			return Math.sqrt(this.len2());
		}

		public lengthSq(): number {
			return Math.sqrt(this.length());
		}

		public dot(vec: Vector4): number {
			return this.x * vec.x + this.y * vec.y + this.z * vec.z;
		}

		public crossVectors( a: Vector4, b: Vector4 ) {

			let ax = a.x, ay = a.y, az = a.z;
			let bx = b.x, by = b.y, bz = b.z;

			this.x = ay * bz - az * by;
			this.y = az * bx - ax * bz;
			this.z = ax * by - ay * bx;

			return this;
		}

		public subVectors( a: Vector4, b: Vector4) {
			this.x = a.x - b.x;
			this.y = a.y - b.y;
			this.z = a.z - b.z;
			this.w = a.w - b.w;

			return this;
		}

		public setFromMatrixColumn( m: Mat4x4, index: number ) {

			return this.fromArray( m.elements, index * 4 );
		}

		public fromArray(array: Array<number> | Float32Array, offset: number) {
			if ( offset === undefined ) { offset = 0; }

			this.x = array[ offset ];
			this.y = array[ offset + 1 ];
			this.z = array[ offset + 2 ];
			this.w = array[ offset + 3 ];

			return this;
		}

		public toArray(): Array<number> {
			this.arr[0] = this.x;
			this.arr[1] = this.y;
			this.arr[2] = this.z;
			this.arr[3] = this.w;
			return this.arr;
		}

		
		public get Zero() : Vector4 {
			Vector4._zero.setTo(0);
			return Vector4._zero;
		}
		
		public Equals(otherVect: Vector4): boolean
		{
			return otherVect != null && this.x == otherVect.x && this.y == otherVect.y && this.z == otherVect.z && this.w == otherVect.w;
		}
	}
}
