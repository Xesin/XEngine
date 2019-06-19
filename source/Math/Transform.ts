namespace XEngine2 {

	export class Transform {

		public parent: Transform;
		public position: Vector3;
		public scale: Vector3;
		public rotation: Vector3;

		constructor () {
		}

		
		public get Matrix() : Mat4x4 {
			let translation =  this.position.toArray();
			let matrix = new Mat4x4();
			matrix.identity();
			mat4.translate(matrix.elements, matrix.elements, translation);
			mat4.rotateY(matrix.elements, matrix.elements, this.rotation.y * XEngine.Mathf.TO_RADIANS);
			mat4.rotateX(matrix.elements, matrix.elements, this.rotation.x * XEngine.Mathf.TO_RADIANS);
			mat4.rotateZ(matrix.elements, matrix.elements, this.rotation.z * XEngine.Mathf.TO_RADIANS);
			mat4.scale(matrix.elements, matrix.elements, this.scale.toArray());

			return matrix;
		}
		
	}
}
