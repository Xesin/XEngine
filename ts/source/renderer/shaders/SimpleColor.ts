namespace XEngine {

	export class SimpleColor extends Shader {
		public static shader = new SimpleColor();
		constructor() {
			super(ShaderLib.SimpleColor.vertexShader, ShaderLib.SimpleColor.fragmentShader);
		}
	}
}
