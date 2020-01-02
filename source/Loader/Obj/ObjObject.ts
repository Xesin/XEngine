import {Game} from "../../core/Game"
import {Material} from "../../core/Render/Resources/Materials/_module/Materials"
import {StaticMesh} from "../../core/Render/Resources/Mesh/StaticMesh"
import {Topology} from "../../core/Render/Resources/Enums/_module/Enums"

export class ObjObject {
	public vertices: Array<number>;
	public colors: Array<number>;
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
		this.colors = new Array();
		this.normals = new Array();
		this.uvs = new Array();
		this.materials = new Array();
		this.groups = new Array();
	}

	public addMaterial(materialName: string) {
		this.materials.push(materialName);
		if (this.previusMat !== undefined) {
			this.previusMat.end = this.vertices.length / 3;
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

	public createGeometry(game: Game): StaticMesh {
		if (this.previusMat !== undefined) {
			this.previusMat.end = this.vertices.length / 3;
			this.previusMat.count = this.previusMat.end  - this.previusMat.start;
		}
		let materials = new Array<Material>();

		for (let i = 0; i < this.materials.length; i++) {
			const material = this.materials[i];
			materials.push(game.cache.materials[material]);
		}
		let geometry = new StaticMesh(this.vertices, null, this.uvs, this.normals, this.colors, materials, Topology.TRIANGLES, this.name);
		for (let i = 0; i < this.groups.length; i++) {
			let group = this.groups[i];
			geometry.addGroup(group.start, group.count, group.materialIndex);
		}
		return geometry;
	}
}
