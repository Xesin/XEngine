namespace XEngine {

	export class Mat4 {

		public elements: Float32Array;

		constructor() {
			this.elements = new Float32Array(4 * 4);
		}

		// tslint:disable-next-line:max-line-length
		public set(n11: number, n12: number, n13: number, n14: number, n21: number, n22: number, n23: number, n24: number, n31: number, n32: number, n33: number, n34: number, n41: number, n42: number, n43: number, n44: number): Mat4 {
			let te = this.elements;

			te[ 0 ] = n11; te[ 4 ] = n12; te[ 8 ] = n13; te[ 12 ] = n14;
			te[ 1 ] = n21; te[ 5 ] = n22; te[ 9 ] = n23; te[ 13 ] = n24;
			te[ 2 ] = n31; te[ 6 ] = n32; te[ 10 ] = n33; te[ 14 ] = n34;
			te[ 3 ] = n41; te[ 7 ] = n42; te[ 11 ] = n43; te[ 15 ] = n44;

			return this;
		}

		public identity(): Mat4 {
			this.set(
				1, 0, 0, 0,
				0, 1, 0, 0,
				0, 0, 1, 0,
				0, 0, 0, 1);
			return this;
		}

		public extractRotation(rotMat: Mat4) {
			let v1 = new Vector3(0);

			let te = this.elements;
			let me = rotMat.elements;

			let scaleX = 1 / v1.setFromMatrixColumn(rotMat, 0).length();
			let scaleY = 1 / v1.setFromMatrixColumn(rotMat, 1).length();
			let scaleZ = 1 / v1.setFromMatrixColumn(rotMat, 2).length();

			te[ 0 ] = me[ 0 ] * scaleX;
			te[ 1 ] = me[ 1 ] * scaleX;
			te[ 2 ] = me[ 2 ] * scaleX;

			te[ 4 ] = me[ 4 ] * scaleY;
			te[ 5 ] = me[ 5 ] * scaleY;
			te[ 6 ] = me[ 6 ] * scaleY;

			te[ 8 ] = me[ 8 ] * scaleZ;
			te[ 9 ] = me[ 9 ] * scaleZ;
			te[ 10 ] = me[ 10 ] * scaleZ;

			return this;
		}

		public lookAt (eye: Vector3, target: Vector3, up: Vector3) {

			let x = new Vector3();
			let y = new Vector3();
			let z = new Vector3();

			let te = this.elements;

			z.subVectors( eye, target );

			if ( z.lengthSq() === 0 ) {

				// eye and target are in the same position

				z.z = 1;

			}

			z.normalize();
			x.crossVectors( up, z );

			if ( x.lengthSq() === 0 ) {
				// up and z are parallel

				if ( Math.abs( up.z ) === 1 ) {

					z.x += 0.0001;

				} else {

					z.z += 0.0001;

				}

				z.normalize();
				x.crossVectors( up, z );

			}

			x.normalize();
			y.crossVectors( z, x );

			te[ 0 ] = x.x; te[ 1 ] = y.x; te[ 2 ] = z.x;
			te[ 4 ] = x.y; te[ 5 ] = y.y; te[ 6 ] = z.y;
			te[ 8 ] = x.z; te[ 9 ] = y.z; te[ 10 ] = z.z;
			te[ 12 ] = -x.dot(eye); te[ 13 ] = -y.dot(eye); te[ 14 ] = -z.dot(eye);
			te[ 15 ] = 1;


			return this;

		}
	}
}
