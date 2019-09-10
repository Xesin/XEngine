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

		public static fromMatrix(mat : Mat4x4): Mat4x4
		{
			let newMat = new Mat4x4;
			let te = mat.elements;
			newMat.set(
				te[ 0 ],  te[ 4 ],  te[ 8 ], te[ 12 ],
				te[ 1 ],  te[ 5 ],  te[ 9 ], te[ 13 ],
				te[ 2 ],  te[ 6 ],  te[ 10 ],  te[ 14 ],
				te[ 3 ],  te[ 7 ],  te[ 11 ],  te[ 15 ]
			);

			return newMat;
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
			te[ 4 ] = me[ 4 ] * scaleY;
			te[ 8 ] = me[ 8 ] * scaleZ;

			te[ 1 ] = me[ 1 ] * scaleX;
			te[ 5 ] = me[ 5 ] * scaleY;
			te[ 9 ] = me[ 9 ] * scaleZ;

			te[ 2 ] = me[ 2 ] * scaleX;
			te[ 6 ] = me[ 6 ] * scaleY;
			te[ 10 ] = me[ 10 ] * scaleZ;

			return this;
		}

		public rotateX()
		{

		}

		public rotateY()
		{

		}

		public rotateZ()
		{

		}

		public translate(vector: Vector3) : Mat4x4
		{
			let x = vector.x, y = vector.y, z = vector.z;

			let te = this.elements;
			te[12] = te[0] * x + te[1] * y + te[2] * z + te[3];
			te[13] = te[4] * x + te[5] * y + te[6] * z + te[7];
			te[14] = te[8] * x + te[9] * y + te[10] * z + te[11];
			te[15] = te[12] * x + te[13] * y + te[14] * z + te[15];
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

		public ortho(left, right, bottom, top, near, far) {
			let out = this.elements
			var lr = 1 / (left - right);
			var bt = 1 / (bottom - top);
			var nf = 1 / (near - far);
			out[0] = -2 * lr;
			out[1] = 0;
			out[2] = 0;
			out[3] = 0;
			out[4] = 0;
			out[5] = -2 * bt;
			out[6] = 0;
			out[7] = 0;
			out[8] = 0;
			out[9] = 0;
			out[10] = 2 * nf;
			out[11] = 0;
			out[12] = (left + right) * lr;
			out[13] = (top + bottom) * bt;
			out[14] = (far + near) * nf;
			out[15] = 1;
			return out;
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

		public transposed(): Mat4x4
		{
			let transposed = Mat4x4.fromMatrix(this);
			
			let a = transposed.elements;
			let a01 = a[4], a02 = a[8], a03 = a[12];
			let a12 = a[9], a13 = a[13];
			let a23 = a[14];

							a[4] = a[1];	a[8] = a[2];	a[12] = a[3];
			a[1] = a01;						a[9] = a[6];	a[13] = a[7];
			a[2] = a02;		a[6] = a12;						a[14] = a[11];
			a[3] = a03;		a[7] = a13;		a[11] = a23;

			return transposed;
		}

		public multiply(otherMat: Mat4x4) : Mat4x4
		{
			let te = this.elements;
			let ote = otherMat.elements

			let a00 = te[0], a01 = te[4], a02 = te[8], a03 = te[12];
			let a10 = te[1], a11 = te[5], a12 = te[9], a13 = te[13];
			let a20 = te[2], a21 = te[6], a22 = te[10], a23 =te[14];
			let a30 = te[3], a31 =te[7], a32 =te[11], a33 =te[15];

			// Cache only the current line of the second matrix
			let b0  = ote[0], b1 = ote[4], b2 = ote[8], b3 = ote[12];
			te[0] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
			te[4] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
			te[8] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
			te[12] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

			b0 = ote[1]; b1 = ote[5]; b2 = ote[9]; b3 = ote[13];
			te[1] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
			te[5] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
			te[9] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
			te[13] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

			b0 = ote[2]; b1 = ote[6]; b2 = ote[10]; b3 = ote[14];
			te[2] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
			te[6] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
			te[10] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
			te[14] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

			b0 = ote[3]; b1 = ote[7]; b2 = ote[11]; b3 = ote[15];
			te[3] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
			te[7] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
			te[11] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
			te[15] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

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
