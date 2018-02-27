namespace XEngine {
	export class ObjData {
		public vertices: Array<number>;
		public normals: Array<number>;
		public colors: Array<number>;
		public uvs: Array<number>;

		public objects: Array<ObjObject>;
		public materials: IDict<ObjMaterial>;
		public currentMaterial: ObjMaterial;
		private currentObject: ObjObject;

		constructor() {
			this.vertices = new Array();
			this.normals = new Array();
			this.colors = new Array();
			this.uvs = new Array();
			this.objects = new Array();
			this.materials = new IDict();
		}

		public startObject(name: string, fromDeclaration) {
			this.currentObject = new ObjObject(name);
			this.objects.push(this.currentObject);
		}

		public startMaterial(name: string) {
			this.currentMaterial = new ObjMaterial(name);
			this.materials[name] = this.currentMaterial;
		}

		public parseVertexIndex( value, len ) {
			let index = parseInt( value, 10 );
			return ( index >= 0 ? index - 1 : index + len / 3 ) * 3;
		}

		public parseNormalIndex( value, len ) {
			let index = parseInt( value, 10 );
			return ( index >= 0 ? index - 1 : index + len / 3 ) * 3;
		}

		public parseUVIndex( value, len ) {
			let index = parseInt( value, 10 );
			return ( index >= 0 ? index - 1 : index + len / 2 ) * 2;
		}

		public addMaterial(name: string) {
			this.currentObject.materials.push(name);
		}

		public addVertexFace(a: number, b: number, c: number ) {

			let src = this.vertices;
			let dst = this.currentObject.vertices;

			dst.push( src[ a + 0 ], src[ a + 1 ], src[ a + 2 ] );
			dst.push(0, 0, 0, 1);
			dst.push( src[ b + 0 ], src[ b + 1 ], src[ b + 2 ] );
			dst.push(0, 0, 0, 1);
			dst.push( src[ c + 0 ], src[ c + 1 ], src[ c + 2 ] );
			dst.push(0, 0, 0, 1);
		}

		public addFaceNormal(a: number, b: number, c: number ) {

			let src = this.normals;
			let dst = this.currentObject.normals;

			dst.push( src[ a + 0 ], src[ a + 1 ], src[ a + 2 ] );
			dst.push( src[ b + 0 ], src[ b + 1 ], src[ b + 2 ] );
			dst.push( src[ c + 0 ], src[ c + 1 ], src[ c + 2 ] );

		}

		public addFaceUV(a: number, b: number, c: number ) {

			let src = this.uvs;
			let dst = this.currentObject.uvs;

			dst.push( src[ a + 0 ], src[ a + 1 ]);
			dst.push( src[ b + 0 ], src[ b + 1 ]);
			dst.push( src[ c + 0 ], src[ c + 1 ]);

		}

		public addFace( a: number, b: number, c: number, ua: number, ub: number, uc: number, na: number, nb: number, nc: number ) {

			let vLen = this.vertices.length;

			let ia = this.parseVertexIndex( a, vLen );
			let ib = this.parseVertexIndex( b, vLen );
			let ic = this.parseVertexIndex( c, vLen );

			this.addVertexFace( ia, ib, ic );

			if ( ua !== undefined ) {

				let uvLen = this.uvs.length;

				ia = this.parseUVIndex( ua, uvLen );
				ib = this.parseUVIndex( ub, uvLen );
				ic = this.parseUVIndex( uc, uvLen );

				this.addFaceUV( ia, ib, ic );

			}

			if ( na !== undefined ) {

				// Normals are many times the same. If so, skip function call and parseInt.
				let nLen = this.normals.length;
				ia = this.parseNormalIndex( na, nLen );

				ib = na === nb ? ia : this.parseNormalIndex( nb, nLen );
				ic = na === nc ? ia : this.parseNormalIndex( nc, nLen );

				this.addFaceNormal( ia, ib, ic );

			}

			// if ( this.colors.length > 0 ) {

			// 	this.addColor( ia, ib, ic );

			// }

		}
	}
}
