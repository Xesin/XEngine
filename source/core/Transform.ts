namespace XEngine {

	export class Transform {

		public position: Vector;
		public scale: Vector;
		public rotation: Vector;

		constructor() {
			this.position = new Vector(0);
			this.scale = new Vector(1);
			this.rotation = new Vector(0, 0, 0);
		}
	}
}
