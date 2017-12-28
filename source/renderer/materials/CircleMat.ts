/// <reference path="Material.ts"/>
/// <reference path="MaterialLib.ts"/>
namespace XEngine {
	export class CircleMat extends Material {
		public static shader = new CircleMat();
		constructor() {
			super(MaterialLib.CircleColor.vertexShader, MaterialLib.CircleColor.fragmentShader);
		}
	}
}
