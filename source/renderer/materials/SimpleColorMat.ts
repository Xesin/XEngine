namespace XEngine {

	export class SimpleColorMat extends Material {
		public static shader = new SimpleColorMat();
		constructor() {
			super(MaterialLib.SimpleColor.vertexShader, MaterialLib.SimpleColor.fragmentShader);
		}
	}
}
