namespace XEngine {
	export class ObjObject {
		public vertices: Array<number>;
		public normals: Array<number>;
		public uvs: Array<number>;
		public name: string;
		public fromDeclaration: boolean;
		public materials: Array<string>;
		public groups: Array<{materialIndex: number, start: number, end: number, count: number}>;

		private previusMat: any;

		constructor(name: string) {
			this.name = name;
			this.vertices = new Array();
			this.normals = new Array();
			this.uvs = new Array();
			this.materials = new Array();
			this.groups = new Array();
		}

		public addMaterial(materialName: string) {
			this.materials.push(materialName);
			if (this.previusMat !== undefined) {
				this.previusMat.end = this.vertices.length / 7;
				this.previusMat.count = this.previusMat.end  - this.previusMat.start;
			}
			this.previusMat = {
				materialIndex: this.groups.length,
				start: ( this.previusMat !== undefined ? this.previusMat.end : 0 ),
				end: -1,
				count: -1,
			};
			this.groups.push(this.previusMat);
		}

		public createGeometry(): Geometry {
			if (this.previusMat !== undefined) {
				this.previusMat.end = this.vertices.length / 7;
				this.previusMat.count = this.previusMat.end  - this.previusMat.start;
			}
			let geometry = new Geometry(this.vertices, null, this.uvs, this.normals, this.materials);
			for (let i = 0; i < this.groups.length; i++) {
				let group = this.groups[i];
				geometry.addGroup(group.start, group.count, group.materialIndex);
			}
			return geometry;
		}
	}
}
