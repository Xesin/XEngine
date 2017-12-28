/// <reference path="Shader.ts"/>
/// <reference path="ShaderLib.ts"/>
namespace XEngine {
	export class CircleColor extends Shader {
		public static shader = new CircleColor();
		constructor() {
			super(ShaderLib.CircleColor.vertexShader, ShaderLib.CircleColor.fragmentShader);
		}
	}
}
