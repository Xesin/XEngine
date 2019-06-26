namespace XEngine2 {

	export class Transform {

		public parent: Transform;
		public position: Vector3;
		public scale: Vector3;
		public rotation: Vector3;

		private dirty: boolean;
		private cachedMatrix: Mat4x4;

		private helperMatrix: Mat4x4;

		constructor () {
			this.dirty = true;
			this.position = new Vector3(0,0,0);
			this.scale = new Vector3();
			this.rotation = new Vector3(0,0,0);
			this.helperMatrix = new Mat4x4();
		}

		public get Matrix() : Mat4x4 {
			if(this.Dirty){
				let translation =  this.position.toArray();
				let matrix = new Mat4x4();
				matrix.identity();
				mat4.translate(matrix.elements, matrix.elements, translation);
				mat4.rotateY(matrix.elements, matrix.elements, this.rotation.y * XEngine.Mathf.TO_RADIANS);
				mat4.rotateX(matrix.elements, matrix.elements, this.rotation.x * XEngine.Mathf.TO_RADIANS);
				mat4.rotateZ(matrix.elements, matrix.elements, this.rotation.z * XEngine.Mathf.TO_RADIANS);
				mat4.scale(matrix.elements, matrix.elements, this.scale.toArray());

				this.cachedMatrix = matrix;
			}

			this.Dirty = false;

			return this.cachedMatrix;
		}

		
		public get Dirty() : boolean {
			return this.dirty 
			|| this.position.Dirty 
			|| this.rotation.Dirty 
			|| this.scale.Dirty 
			|| this.cachedMatrix === undefined 
			|| this.cachedMatrix === null;
		}

		public forward(): Vector3 {
			let forwardVector = new Vector3(0,0,1);
			this.helperMatrix.identity();
			if(this.Dirty){
				this.helperMatrix.extractRotation(this.Matrix);
				this.Dirty = true;
			}
			else
			{
				this.helperMatrix.extractRotation(this.Matrix);
			}

			forwardVector.multiplyMatrix(this.helperMatrix.elements);
			return forwardVector;
		}

		public right(): Vector3 {
			let rightVector = new Vector3(1, 0, 0);
			this.helperMatrix.identity();

			if(this.Dirty){
				this.helperMatrix.extractRotation(this.Matrix);
				this.Dirty = true;
			}
			else
			{
				this.helperMatrix.extractRotation(this.Matrix);
			}

			rightVector.multiplyMatrix(this.helperMatrix.elements);
			// this.vf.reflect(this.reflectV);
			return rightVector;
		}
		
		
		public set Dirty(v : boolean) {
			this.position.Dirty = v;
			this.rotation.Dirty = v;
			this.scale.Dirty = v;
			this.dirty = v;
		}
		
	}
}
