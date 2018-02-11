namespace XEngine {
	export namespace MaterialLib {
		export class MaterialLibObject {
			public static readonly vertexShader: Array<string>;
			public static readonly fragmentShader: Array<string>;
			public static readonly uniforms: any;
		}

		export class Sprite extends MaterialLibObject {
			public static readonly vertexShader = [
				"#version 300 es",
				"#XBaseParams",
				"void mainPass() {",
				"}",
			];

			public static readonly fragmentShader = [
				"#version 300 es",
				"precision mediump float;",
				"uniform sampler2D texSampler;",
				"#XBaseParams",

				"void main(void) {",
					"vec4 texCol = texture(texSampler, uv);",
					"texCol.rgb *= texCol.w;",
					// "if(texCol.a >= 0.8){",
					// "if(texCol.a <= 0.05) discard;",
					"texCol.xyz *= vColor;",
					"fragColor = texCol*alpha;",
					// "}else{",
					// "fragColor = vec4(uv.x, uv.y, 0.0, 1.0);",
					// "}",
				"}",
			];
		}

		export class SimpleMaterial extends MaterialLibObject {
			public static readonly vertexShader = [
				"#version 300 es",
				"#XBaseParams",
				"uniform mat4 mvpMatrix;",

				"void mainPass() {",
					"mat4 matrix = pMatrix * mvpMatrix;",
					"vertPos = matrix * vertPos;",
					// "vertPos = pMatrix * vertPos;",
				"}",
			];

			public static readonly fragmentShader = [
				"#version 300 es",
				"precision mediump float;",
				"#XBaseParams",
				"uniform sampler2D texSampler;",

				"void main(void) {",
					"vec4 texCol = texture(texSampler, uv);",
					"fragColor = vec4(texCol.rgb * texCol.a, 1.0);",
				"}",
			];
		}

		export class SimpleColor extends MaterialLibObject {
			public static readonly vertexShader = [
				"#version 300 es",
				"#XBaseParams",
				"void mainPass() {",
				"}",
			];

			public static readonly fragmentShader = [
				"#version 300 es",
				"precision mediump float;",
				"#XBaseParams",

				"void main(void) {",
					"fragColor = vec4(vColor, alpha) * alpha;",
				"}",
			];
		}

		export class CircleColor extends MaterialLibObject {
			public static readonly vertexShader = [
				"#version 300 es",
				"#XBaseParams",
				"void mainPass() {",
				"}",
			];

			public static readonly fragmentShader = [
				"#version 300 es",
				"precision mediump float;",
				"#XBaseParams",

				"void main(void) {",
					"vec2 uvOffset = uv - 0.5;",
					"float distance = length(uvOffset);",
					"float res = smoothstep(distance,distance+0.04,0.5);",
					"if(res < 0.1) discard;",
					"fragColor = vec4(1.0, 1.0, 1.0, res) * res * alpha;",
					"fragColor.xyz *= vColor;",
				"}",
			];
		}
	}
}
