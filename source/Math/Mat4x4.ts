namespace XEngine2 {

	export class Mat4x4 {

		public elements: Float32Array;
		private v0 = new Vector3();
		private vX = new Vector3();
		private vY = new Vector3();
		private vZ = new Vector3();

		constructor() {
			this.elements = new Float32Array(4 * 4);
			this.identity();
		}

		// tslint:disable-next-line:max-line-length
		public set(n11: number, n12: number, n13: number, n14: number, n21: number, n22: number, n23: number, n24: number, n31: number, n32: number, n33: number, n34: number, n41: number, n42: number, n43: number, n44: number): Mat4x4 {
			let te = this.elements;

			te[ 0 ] = n11; te[ 4 ] = n12; te[ 8 ] = n13; te[ 12 ] = n14;
			te[ 1 ] = n21; te[ 5 ] = n22; te[ 9 ] = n23; te[ 13 ] = n24;
			te[ 2 ] = n31; te[ 6 ] = n32; te[ 10 ] = n33; te[ 14 ] = n34;
			te[ 3 ] = n41; te[ 7 ] = n42; te[ 11 ] = n43; te[ 15 ] = n44;

			return this;
		}

		public identity(): Mat4x4 {
			this.set(
				1, 0, 0, 0,
				0, 1, 0, 0,
				0, 0, 1, 0,
				0, 0, 0, 1);
			return this;
		}

		public extractRotation(rotMat: Mat4x4) {
			this.v0.setTo(0, 0, 0);

			let te = this.elements;
			let me = rotMat.elements;

			let scaleX = 1 / this.v0.setTo(rotMat.elements[0], rotMat.elements[4], rotMat.elements[8]).length();
			let scaleY = 1 / this.v0.setTo(rotMat.elements[1], rotMat.elements[5], rotMat.elements[9]).length();
			let scaleZ = 1 / this.v0.setTo(rotMat.elements[2], rotMat.elements[6], rotMat.elements[10]).length();

			te[ 0 ] = me[ 0 ] * scaleX;
			te[ 4 ] = me[ 4 ] * scaleX;
			te[ 8 ] = me[ 8 ] * scaleX;

			te[ 1 ] = me[ 1 ] * scaleY;
			te[ 5 ] = me[ 5 ] * scaleY;
			te[ 9 ] = me[ 9 ] * scaleY;

			te[ 2 ] = me[ 2 ] * scaleZ;
			te[ 6 ] = me[ 6 ] * scaleZ;
			te[ 10 ] = me[ 10 ] * scaleZ;

			return this;
		}

		public perspective(fov: number, aspect: number, near: number, far: number) {
			let out = this.elements
			let f = 1.0 / Math.tan(fov / 2), nf: number;
			out[0] = f / aspect;
			out[1] = 0;
			out[2] = 0;
			out[3] = 0;
			out[4] = 0;
			out[5] = f;
			out[6] = 0;
			out[7] = 0;
			out[8] = 0;
			out[9] = 0;
			out[11] = -1;
			out[12] = 0;
			out[13] = 0;
			out[15] = 0;
			if (far != null && far !== Infinity) {
			  nf = 1 / (near - far);
			  out[10] = (far + near) * nf;
			  out[14] = (2 * far * near) * nf;
			} else {
			  out[10] = -1;
			  out[14] = -2 * near;
			}
			return this;
		  }

		public lookAt (eye: Vector3, target: Vector3, up: Vector3) {
			let te = this.elements;

			this.vZ.subVectors( eye, target );

			if ( this.vZ.lengthSq() === 0 ) {

				// eye and target are in the same position

				this.vZ.z = 1;

			}

			this.vZ.normalize();
			this.vX.crossVectors( up, this.vZ );

			if ( this.vX.lengthSq() === 0 ) {
				// up and z are parallel

				if ( Math.abs( up.z ) === 1 ) {

					this.vZ.x += 0.0001;

				} else {

					this.vZ.z += 0.0001;

				}

				this.vZ.normalize();
				this.vX.crossVectors( up, this.vZ );

			}

			this.vX.normalize();
			this.vY.crossVectors( this.vZ, this.vX );

			te[ 0 ] = this.vX.x; te[ 1 ] = this.vY.x; te[ 2 ] = this.vZ.x;
			te[ 4 ] = this.vX.y; te[ 5 ] = this.vY.y; te[ 6 ] = this.vZ.y;
			te[ 8 ] = this.vX.z; te[ 9 ] = this.vY.z; te[ 10 ] = this.vZ.z;
			te[ 12 ] = -this.vX.dot(eye); te[ 13 ] = -this.vY.dot(eye); te[ 14 ] = -this.vZ.dot(eye);
			te[ 15 ] = 1;


			return this;

		}

		public FPSView( eye: Vector3, pitch: number, yaw: number, roll: number) {
			let te = this.elements;

			let cosPitch = Math.cos(pitch);
			let sinPitch = Math.sin(pitch);
			let cosYaw = Math.cos(yaw);
			let sinYaw = Math.sin(yaw);
			let cosRoll = Math.cos(roll);
			let sinRoll = Math.sin(roll);

			this.vX.setTo(cosYaw, 0, -sinYaw);
			this.vY.setTo(sinYaw * sinPitch, cosPitch, cosYaw * sinPitch);
			this.vZ.setTo(sinYaw * cosPitch, -sinPitch, cosPitch * cosYaw);

			te[ 0 ] = this.vX.x; te[ 1 ] = this.vY.x; te[ 2 ] = this.vZ.x;
			te[ 4 ] = this.vX.y; te[ 5 ] = this.vY.y; te[ 6 ] = this.vZ.y;
			te[ 8 ] = this.vX.z; te[ 9 ] = this.vY.z; te[ 10 ] = this.vZ.z;
			te[ 12 ] = -this.vX.dot(eye); te[ 13 ] = -this.vY.dot(eye); te[ 14 ] = -this.vZ.dot(eye);
			te[ 15 ] = 1;

			return this;
		}

		public Equals(otherMat: Mat4x4): boolean
		{
			if(otherMat == null) return false;
			let el = this.elements;
			let otherEl = otherMat.elements;

			for (let i = 0; i < el.length; i++) {
				const element = el[i];
				if(element != otherEl[i]) return false;
			}

			return true;
		}
	}
}
