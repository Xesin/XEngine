namespace XEngine {

	export enum Uniforms {
		FLOAT = 0,
		INTEGER = 1,
		MAT2X2 = 2,
		MAT3X3 = 3,
		MAT4X4 = 4,
		VECTOR2 = 5,
		VECTOR3 = 6,
		VECTOR4 = 7,
		SAMPLER = 8,
	}

	export class ShaderCompiler {

		public static readonly vertexBaseParams = [
			"in vec3 aVertexPosition;",
			"in vec2 vUv;",
			"in vec3 aVertexColor;",
			"in float in_alpha;",
			"uniform mat4 pMatrix;",
			"uniform mat4 mvMatrix;",
			"uniform mat4 normalMatrix;",
			"out highp vec2 uv;",
			"vec4 vertPos;",
			"out vec4 vertexPos;",
			"out highp vec3 vColor;",
			"out highp float alpha;",
			"mat4 mvpMatrix;",
		];

		public static readonly fragmentBaseParams = [
			"in lowp vec3 vColor;",
			"in highp vec2 uv;",
			"in float alpha;",
			"in vec4 vertexPos;",
			"out vec4 fragColor;",
		];

		public static readonly vertexMain = [
			"void main(void) {",
				"vertPos = vec4(aVertexPosition, 1.0);",
				"mvpMatrix = pMatrix * mvMatrix;",
				"mainPass();",
				"uv = vUv;",
				"vColor = aVertexColor;",
				"alpha = in_alpha;",
				"vertexPos = vertPos;",
				"gl_Position = vertPos;",
			"}",
		];

		public static compileVertexShader(verxtexString: string) {
			verxtexString = verxtexString.replace("#XBaseParams", this.vertexBaseParams.join("\n"));
			verxtexString += this.vertexMain.join("\n");
			return verxtexString;
		}

		public static compileFragmentShader(fragmentString: string) {
			fragmentString = fragmentString.replace("#XBaseParams", this.fragmentBaseParams.join("\n"));
			return fragmentString;
		}
	}
}
