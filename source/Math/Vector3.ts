namespace XEngine2 {

	export class Vector3 {

		private static readonly _zero = new Vector3(0);
		public zOffset = 0;

		private dirty = true;
		public _x: number;
		public _y: number;
		public _z: number;
		private arr: Array<number>;

		constructor (x = 1, y = x, z = 1) {
			this.x = x;
			this.y = y;
			this.z = z;
			this.arr = new Array(3);

			this.zOffset = 0;
		}

		public setTo(x: number, y = x, z = x): Vector3 {
			this.x = x;
			this.y = y;
			this.z = z;
			return this;
		}

		public sub(vector: Vector3): Vector3 {
			this.x -= vector.x;
			this.y -= vector.y;
			this.z -= vector.z;

			return this;
		}

		public add(vector: Vector3): Vector3 {
			this.x += vector.x;
			this.y += vector.y;
			this.z += vector.z;

			return this;
		}

		public multiply(vector: Vector3): Vector3 {
			this.x *= vector.x;
			this.y *= vector.y;
			this.z *= vector.z;
			return this;
		}

		public multiplyMatrix(matrix: Array<number> | Float32Array): Vector3 {
			let x = this.x,
			y = this.y;
			let z = this.z;

			let out = new Array(3);
			this.x = x * matrix[0] + y * matrix[1] + z * matrix[2] + matrix[3];
			this.y = x * matrix[4] + y * matrix[5] + z * matrix[6] + matrix[7];
			this.z = x * matrix[8] + y * matrix[9] + z * matrix[10] + matrix[11];
			return this;
		}

		public rotate(angle: number): Vector3 {
			let x = this.x;
			let y = this.y;
			this.x = x * Math.cos(angle) - y * Math.sin(angle);
			this.y = x * Math.sin(angle) + y * Math.cos(angle);
			return this;
		}

		public normalize(): Vector3 {
			let d = this.length();
			if (d > 0) {
				this.x = this.x / d;
				this.y = this.y / d;
				this.z = this.z / d;
			}
			return this;
		}

		public project(vector: Vector3): Vector3 {
			let amt = this.dot(vector) / vector.len2();
			this.x = amt * vector.x;
			this.y = amt * vector.y;
			this.z = amt * vector.z;
			return this;
		}

		public scalar(scalarNum: number): Vector3 {
			this.x *= scalarNum;
			this.y *= scalarNum;
			this.z *= scalarNum;

			return this;
		}

		public scale(x, y = x): Vector3 {
			this.x *= x;
			this.y *= y;
			return this;
		}

		public reflect(axis: Vector3): Vector3 {
			let x = this.x;
			let y = this.y;
			let z = this.z;
			this.project(axis).scale(2);
			this.x -= x;
			this.y -= y;
			this.z -= z;
			return this;
		}

		public distance(vector: Vector3): number {
			let tmp = new Vector3(this.x, this.y, this.z);
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

		public dot(vec: Vector3): number {
			return this.x * vec.x + this.y * vec.y + this.z * vec.z;
		}

		public crossVectors( a: Vector3, b: Vector3 ) {

			let ax = a.x, ay = a.y, az = a.z;
			let bx = b.x, by = b.y, bz = b.z;

			this.x = ay * bz - az * by;
			this.y = az * bx - ax * bz;
			this.z = ax * by - ay * bx;

			return this;
		}

		public subVectors( a: Vector3, b: Vector3) {
			this.x = a.x - b.x;
			this.y = a.y - b.y;
			this.z = a.z - b.z;

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

			return this;
		}

		public toArray(): Array<number> {
			this.arr[0] = this.x;
			this.arr[1] = this.y;
			this.arr[2] = this.z;
			return this.arr;
		}

		public get Zero() : Vector3 {
			Vector3._zero.setTo(0);
			return Vector3._zero;
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
		
		public Equals(otherVect: Vector3): boolean
		{
			return this.x == otherVect.x && this.y == otherVect.y && this.z == otherVect.z;
		}
	}
}