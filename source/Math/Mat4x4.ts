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
		public set(n00: number, n01: number, n02: number, n03: number, n10: number, n11: number, n12: number, n13: number, n20: number, n21: number, n22: number, n23: number, n30: number, n31: number, n32: number, n33: number): Mat4x4 {
			let te = this.elements;

			te[ 0 ] = n00;  te[ 4 ] = n10;  te[ 8 ] =  n20;  te[ 12 ] = n30;
			te[ 1 ] = n01;  te[ 5 ] = n11;  te[ 9 ] =  n21;  te[ 13 ] = n31;
			te[ 2 ] = n02;  te[ 6 ] = n12;  te[ 10 ] = n22;  te[ 14 ] = n32;
			te[ 3 ] = n03;  te[ 7 ] = n13;  te[ 11 ] = n23;  te[ 15 ] = n33;
			  
			return this;
		}

		public clone(): Mat4x4
		{
			return Mat4x4.fromMatrix(this);
		}

		public static fromMatrix(mat : Mat4x4): Mat4x4
		{
			let newMat = new Mat4x4;
			let te = mat.elements;
			newMat.set(
				te[ 0 ],  te[ 1 ],  te[ 2 ], te[ 3 ],
				te[ 4 ],  te[ 5 ],  te[ 6 ], te[ 7 ],
				te[ 8 ],  te[ 9 ],  te[ 10 ],  te[ 11 ],
				te[ 12 ],  te[ 13 ],  te[ 14 ],  te[ 15 ]
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

		public invert(): Mat4x4{
			let a00 = this.elements[0], a01 = this.elements[1], a02 = this.elements[2], a03 = this.elements[3];
			let a10 = this.elements[4], a11 = this.elements[5], a12 = this.elements[6], a13 = this.elements[7];
			let a20 = this.elements[8], a21 = this.elements[9], a22 = this.elements[10], a23 = this.elements[11];
			let a30 = this.elements[12], a31 = this.elements[13], a32 = this.elements[14], a33 = this.elements[15];

			let b00 = a00 * a11 - a01 * a10;
			let b01 = a00 * a12 - a02 * a10;
			let b02 = a00 * a13 - a03 * a10;
			let b03 = a01 * a12 - a02 * a11;
			let b04 = a01 * a13 - a03 * a11;
			let b05 = a02 * a13 - a03 * a12;
			let b06 = a20 * a31 - a21 * a30;
			let b07 = a20 * a32 - a22 * a30;
			let b08 = a20 * a33 - a23 * a30;
			let b09 = a21 * a32 - a22 * a31;
			let b10 = a21 * a33 - a23 * a31;
			let b11 = a22 * a33 - a23 * a32;

			// Calculate the determinant
			let det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

			if (!det) {
				return null;
			}
			det = 1.0 / det;

			this.elements[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
			this.elements[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
			this.elements[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
			this.elements[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
			this.elements[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
			this.elements[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
			this.elements[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
			this.elements[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
			this.elements[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
			this.elements[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
			this.elements[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
			this.elements[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
			this.elements[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
			this.elements[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
			this.elements[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
			this.elements[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;

			return this;
		}

		public transpose() : Mat4x4
		{
			let a = this.elements;
			let a01 = a[1], a02 = a[2], a03 = a[3];
			let a12 = a[6], a13 = a[7];
			let a23 = a[11];

			a[1] = a[4];
			a[2] = a[8];
			a[3] = a[12];
			a[4] = a01;
			a[6] = a[9];
			a[7] = a[13];
			a[8] = a02;
			a[9] = a12;
			a[11] = a[14];
			a[12] = a03;
			a[13] = a13;
			a[14] = a23;

			return this
		}

		public extractRotation(rotMat: Mat4x4) {
			this.v0.setTo(0, 0, 0);

			let te = this.elements;
			let me = rotMat.elements;

			let scaleX = 1 / this.v0.setTo(rotMat.elements[0], rotMat.elements[1], rotMat.elements[2]).length();
			let scaleY = 1 / this.v0.setTo(rotMat.elements[4], rotMat.elements[5], rotMat.elements[6]).length();
			let scaleZ = 1 / this.v0.setTo(rotMat.elements[8], rotMat.elements[9], rotMat.elements[10]).length();

			te[ 0 ] = me[ 0 ] / scaleX;
			te[ 1 ] = me[ 1 ] / scaleX;
			te[ 2 ] = me[ 2 ] / scaleX;
			te[ 3 ] = 0;

			te[ 4 ] = me[ 4 ] / scaleY;
			te[ 5 ] = me[ 5 ] / scaleY;
			te[ 6 ] = me[ 6 ] / scaleY;
			te[ 7 ] = 0;

			te[ 8 ] = me[ 8 ] / scaleZ;
			te[ 9 ] = me[ 9 ] / scaleZ;
			te[ 10 ] = me[ 10 ] / scaleZ;
			te[ 11 ] = 0;

			te[ 12 ] = 0;
			te[ 13 ] = 0;
			te[ 14 ] = 0;
			te[ 15 ] = 1;

			return this;
		}

		public getColumn(columnIndex) : Vector4 
		{
			let te = this.elements;
			return new Vector4 (
				te[ 0 + 4 * columnIndex],
				te[ 1 + 4 * columnIndex],
				te[ 2 + 4 * columnIndex],
				te[ 3 + 4 * columnIndex]
			)
		}

		public getValue(column: number, row: number) : number
		{
			return this.elements[ row + 4 * column];
		}

		public rotateX(radians: number)
		{
			let a = this.elements;
			let s = Math.sin(radians);
			let c = Math.cos(radians);
			let a10 = a[4];
			let a11 = a[5];
			let a12 = a[6];
			let a13 = a[7];
			let a20 = a[8];
			let a21 = a[9];
			let a22 = a[10];
			let a23 = a[11];


			a[4] = a10 * c + a20 * s;
			a[5] = a11 * c + a21 * s;
			a[6] = a12 * c + a22 * s;
			a[7] = a13 * c + a23 * s;
			a[8] = a20 * c - a10 * s;
			a[9] = a21 * c - a11 * s;
			a[10] = a22 * c - a12 * s;
			a[11] = a23 * c - a13 * s;
		}

		public rotateY(radians: number)
		{
			let a = this.elements;
			let s = Math.sin(radians);
			let c = Math.cos(radians);
			let a00 = a[0];
			let a01 = a[1];
			let a02 = a[2];
			let a03 = a[3];
			let a20 = a[8];
			let a21 = a[9];
			let a22 = a[10];
			let a23 = a[11];

			// Perform axis-specific matrix multiplication
			a[0] = a00 * c - a20 * s;
			a[1] = a01 * c - a21 * s;
			a[2] = a02 * c - a22 * s;
			a[3] = a03 * c - a23 * s;
			a[8] = a00 * s + a20 * c;
			a[9] = a01 * s + a21 * c;
			a[10] = a02 * s + a22 * c;
			a[11] = a03 * s + a23 * c;
		}

		public rotateZ(radians: number)
		{
			let a = this.elements;
			let s = Math.sin(radians);
			let c = Math.cos(radians);
			let a00 = a[0];
			let a01 = a[1];
			let a02 = a[2];
			let a03 = a[3];
			let a10 = a[4];
			let a11 = a[5];
			let a12 = a[6];
			let a13 = a[7];

			a[0] = a00 * c + a10 * s;
			a[1] = a01 * c + a11 * s;
			a[2] = a02 * c + a12 * s;
			a[3] = a03 * c + a13 * s;
			a[4] = a10 * c - a00 * s;
			a[5] = a11 * c - a01 * s;
			a[6] = a12 * c - a02 * s;
			a[7] = a13 * c - a03 * s;
		}

		public translate(vector: Vector3) : Mat4x4
		{
			let x = vector.x, y = vector.y, z = vector.z;

			let te = this.elements;
			te[12] = te[0] * x + te[4] * y + te[8] * z + te[12];
			te[13] = te[1] * x + te[5] * y + te[9] * z + te[13];
			te[14] = te[2] * x + te[6] * y + te[10] * z + te[14];
			te[15] = te[3] * x + te[7] * y + te[11] * z + te[15];
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

		public ortho(left, right, bottom, top, near, far) : Mat4x4 {
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
			return this;
		}

		public lookAt (eye: Vector3, target: Vector3, up: Vector3) {
			let te = this.elements;

			let x0, x1, x2, y0, y1, y2, z0, z1, z2, len;
			let eyex = eye.x;
			let eyey = eye.y;
			let eyez = eye.z;
			let upx = up.x;
			let upy = up.y;
			let upz = up.z;
			let centerx = target.x;
			let centery = target.y;
			let centerz = target.z;

			if (Math.abs(eyex - centerx) < 0.000001 &&
				Math.abs(eyey - centery) < 0.000001 &&
				Math.abs(eyez - centerz) < 0.000001) {
				return this.identity();
			}

			z0 = eyex - centerx;
			z1 = eyey - centery;
			z2 = eyez - centerz;

			len = 1 / Mathf.hypot(z0, z1, z2);
			z0 *= len;
			z1 *= len;
			z2 *= len;

			x0 = upy * z2 - upz * z1;
			x1 = upz * z0 - upx * z2;
			x2 = upx * z1 - upy * z0;
			len = Mathf.hypot(x0, x1, x2);
			if (!len) {
				x0 = 0;
				x1 = 0;
				x2 = 0;
			} else {
				len = 1 / len;
				x0 *= len;
				x1 *= len;
				x2 *= len;
			}

			y0 = z1 * x2 - z2 * x1;
			y1 = z2 * x0 - z0 * x2;
			y2 = z0 * x1 - z1 * x0;

			len = Mathf.hypot(y0, y1, y2);
			if (!len) {
				y0 = 0;
				y1 = 0;
				y2 = 0;
			} else {
				len = 1 / len;
				y0 *= len;
				y1 *= len;
				y2 *= len;
			}

			te[0] = x0;
			te[1] = y0;
			te[2] = z0;
			te[3] = 0;
			te[4] = x1;
			te[5] = y1;
			te[6] = z1;
			te[7] = 0;
			te[8] = x2;
			te[9] = y2;
			te[10] = z2;
			te[11] = 0;
			te[12] = -(x0 * eyex + x1 * eyey + x2 * eyez);
			te[13] = -(y0 * eyex + y1 * eyey + y2 * eyez);
			te[14] = -(z0 * eyex + z1 * eyey + z2 * eyez);
			te[15] = 1;

			return this;

		}

		public multiply(otherMat: Mat4x4) : Mat4x4
		{
			let te = this.elements;
			let ote = otherMat.elements

			let a00 = te[0], a01 = te[1], a02 = te[2], a03 = te[3];
			let a10 = te[4], a11 = te[5], a12 = te[6], a13 = te[7];
			let a20 = te[8], a21 = te[9], a22 = te[10], a23 = te[11];
			let a30 = te[12], a31 = te[13], a32 = te[14], a33 = te[15];

			// Cache only the current line of the second matrix
			let b0  = ote[0], b1 = ote[1], b2 = ote[2], b3 = ote[3];
			te[0] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
			te[1] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
			te[2] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
			te[3] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

			b0 = ote[4]; b1 = ote[5]; b2 = ote[6]; b3 = ote[7];
			te[4] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
			te[5] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
			te[6] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
			te[7] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

			b0 = ote[8]; b1 = ote[9]; b2 = ote[10]; b3 = ote[11];
			te[8] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
			te[9] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
			te[10] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
			te[11] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

			b0 = ote[12]; b1 = ote[13]; b2 = ote[14]; b3 = ote[15];
			te[12] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
			te[13] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
			te[14] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
			te[15] = b0*a03 + b1*a13 + b2*a23 + b3*a33;
			return this;
		}

		public rotateAndTranslate(q: Quaternion, v: Vector3): Mat4x4
		{
			let x = q.x, y = q.y, z = q.z, w = q.w;
			let x2 = x + x;
			let y2 = y + y;
			let z2 = z + z;

			let xx = x * x2;
			let xy = x * y2;
			let xz = x * z2;
			let yy = y * y2;
			let yz = y * z2;
			let zz = z * z2;
			let wx = w * x2;
			let wy = w * y2;
			let wz = w * z2;

			this.elements[0] = 1 - (yy + zz);
			this.elements[1] = xy + wz;
			this.elements[2] = xz - wy;
			this.elements[3] = 0;
			this.elements[4] = xy - wz;
			this.elements[5] = 1 - (xx + zz);
			this.elements[6] = yz + wx;
			this.elements[7] = 0;
			this.elements[8] = xz + wy;
			this.elements[9] = yz - wx;
			this.elements[10] = 1 - (xx + yy);
			this.elements[11] = 0;
			this.elements[12] = v.x;
			this.elements[13] = v.y;
			this.elements[14] = v.z;
			this.elements[15] = 1;

			return this;
		}

		public rotateTranslateAndScale(q: Quaternion, v: Vector3, s: Vector3): Mat4x4
		{
			let x = q.x, y = q.y, z = q.z, w = q.w;
			let x2 = x + x;
			let y2 = y + y;
			let z2 = z + z;

			let xx = x * x2;
			let xy = x * y2;
			let xz = x * z2;
			let yy = y * y2;
			let yz = y * z2;
			let zz = z * z2;
			let wx = w * x2;
			let wy = w * y2;
			let wz = w * z2;
			let sx = s.x;
			let sy = s.y;
			let sz = s.z;

			this.elements[0] = (1 - (yy + zz)) * sx;
			this.elements[1] = (xy + wz) * sx;
			this.elements[2] = (xz - wy) * sx;
			this.elements[3] = 0;
			this.elements[4] = (xy - wz) * sy;
			this.elements[5] = (1 - (xx + zz)) * sy;
			this.elements[6] = (yz + wx) * sy;
			this.elements[7] = 0;
			this.elements[8] = (xz + wy) * sz;
			this.elements[9] = (yz - wx) * sz;
			this.elements[10] = (1 - (xx + yy)) * sz;
			this.elements[11] = 0;
			this.elements[12] = v.x;
			this.elements[13] = v.y;
			this.elements[14] = v.z;
			this.elements[15] = 1;

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
