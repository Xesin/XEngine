namespace XEngine {
	export class ObjObject {
		public vertices: Array<number>;
		public normals: Array<number>;
		public uvs: Array<number>;
		public name: string;
		public fromDeclaration: boolean;
		public materials: Array<string>;

		constructor(name: string) {
			this.name = name;
			this.vertices = new Array();
			this.normals = new Array();
			this.uvs = new Array();
			this.materials = new Array();
		}

		public createGeometry(): Geometry {
			return new Geometry(this.vertices, null, this.uvs, this.normals, this.materials);
		}
	}
}
