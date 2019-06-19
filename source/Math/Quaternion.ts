namespace XEngine2 {

	export class Quaternion {

		public static readonly Zero = new Quaternion(0);
		public zOffset = 0;

		public x: number;
		public y: number;
		public z: number;
		public w: number;
		private arr: Array<number>;

		constructor (x = 1, y = x, z = x, w = x) {
			this.x = x;
			this.y = y;
			this.z = z;
			this.w = w;
			this.arr = new Array(3);

			this.zOffset = 0;
		}

		public setTo(x: number, y = x, z = x, w = x): Quaternion {
			this.x = x;
			this.y = y;
			this.z = z;
			this.w = w;
			return this;
		}
	}
}
