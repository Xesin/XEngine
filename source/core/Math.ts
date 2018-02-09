namespace XEngine {

	export class Mathf {

		public static readonly TO_RADIANS = 0.0174532925199432957;
		public static readonly TO_DEGREES = 57.2957795130823208767;

		public static randomRange(min: number, max: number): number {
			return min + (Math.random() * (max - min));
		}

		public static randomIntRange(min: number, max: number): number {
			return Math.round(min + Math.random() * (max - min));
		}

		public static clamp(number: number, min: number, max: number) {
			return Math.max(Math.min(number, max), min);
		}

		public static lerp(a: number, b: number, t: number) {
			t = XEngine.Mathf.clamp(t, 0, 1);
			return (1 - t) * a + t * b;
		}

		public static lerpColor(a: string, b: string, amount: number) {
			let ah = parseInt(a.replace(/#/g, ""), 16),
				ar = ah >> 16,
				ag = ah >> 8 & 0xff,
				ab = ah & 0xff,
				bh = parseInt(b.replace(/#/g, ""), 16),
				br = bh >> 16,
				bg = bh >> 8 & 0xff,
				bb = bh & 0xff,
				rr = ar + amount * (br - ar),
				rg = ag + amount * (bg - ag),
				rb = ab + amount * (bb - ab);

			return "#" + ((1 << 24) + (rr << 16) + (rg << 8) + rb | 0).toString(16).slice(1);
		}

		public static angleBetween(originX: number, originY: number, targetX: number, targetY: number) {
			let x = targetX - originX;
			let y = targetY - originY;

			return (Math.atan2(y, x));
		}
	}

	export class Vector {

		public static readonly Zero = new Vector(0);

		public x: number;
		public y: number;
		public z: number;

		public zOffset = 0;


		constructor (x: number, y = x, z = 1.0) {
			this.x = x;
			this.y = y;
			this.z = z;

			this.zOffset = 0;
		}

		public setTo(x: number, y = x, z?) {
			this.x = x;
			this.y = y;
			if (z) {
				this.z = z;
			}
		}

		public sub(vector: Vector): Vector {
			this.x -= vector.x;
			this.y -= vector.y;
			this.z -= vector.z;

			return this;
		}

		public add(vector: Vector): Vector {
			this.x += vector.x;
			this.y += vector.y;
			this.z += vector.z;

			return this;
		}

		public multiply(vector: Vector): Vector {
			this.x *= vector.x;
			this.y *= vector.y;
			this.z *= vector.z
			return this;
		}

		public multiplyMatrix(matrix: Array<number>): Vector {
			let x = this.x,
			y = this.y;
			let z = this.z;

			let out = new Array(3);
			this.x = x * matrix[0] + y * matrix[4] + z * matrix[8] + matrix[12];
			this.y = x * matrix[1] + y * matrix[5] + z * matrix[9] + matrix[13];
			this.z = x * matrix[2] + y * matrix[6] + z * matrix[10] + matrix[14];
			return this;
		}

		public rotate(angle: number): Vector {
			let x = this.x;
			let y = this.y;
			this.x = x * Math.cos(angle) - y * Math.sin(angle);
			this.y = x * Math.sin(angle) + y * Math.cos(angle);
			return this;
		}

		public normalize(): Vector {
			let d = this.length();
			if (d > 0) {
				this.x = this.x / d;
				this.y = this.y / d;
			}
			return this;
		}

		public project(vector: Vector): Vector {
			let amt = this.dot(vector) / vector.len2();
			this.x = amt * vector.x;
			this.y = amt * vector.y;
			return this;
		}

		public scale(x, y = x): Vector {
			this.x *= x;
			this.y *= y;
			return this;
		}

		public reflect(axis: Vector): Vector {
			let x = this.x;
			let y = this.y;
			this.project(axis).scale(2);
			this.x -= x;
			this.y -= y;
			return this;
		}

		public distance(vector: Vector): number {
			let tmp = new XEngine.Vector(this.x, this.y, this.z);
			tmp.sub(vector);
			return tmp.length();
		}

		public len2(): number {
			return this.dot(this);
		}

		public length(): number {
			return Math.sqrt(this.len2());
		}

		public dot(vec: Vector): number {
			return this.x * vec.x + this.y * vec.y;
		}
	}
}
