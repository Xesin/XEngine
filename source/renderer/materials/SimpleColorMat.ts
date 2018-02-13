namespace XEngine {

	export class SimpleColorMat extends Material {
		public static shader = new SimpleColorMat();
		constructor() {
			super(ShaderLib.SimpleColorShader.vertexShader, ShaderLib.SimpleColorShader.fragmentShader);
		}
	}
}
