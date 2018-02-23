namespace XEngine {
	export namespace ShaderLib {
		export class ShaderLibObject {
			public static readonly vertexShader: Array<string>;
			public static readonly fragmentShader: Array<string>;
			public static readonly uniforms: any;
		}

		export class SpriteShader extends ShaderLibObject {
			public static readonly vertexShader = [
				"#version 300 es",
				"#XBaseParams",
				"void mainPass() {",
					"vertPos = pMatrix * modelMatrix * vertPos;",
				"}",
			];

			public static readonly fragmentShader = [
				"#version 300 es",
				"precision mediump float;",
				"uniform sampler2D texSampler;",
				"#XBaseParams",

				"void main(void) {",
					"vec4 texCol = textureLod(texSampler, uv, 0.0);",
					"texCol.rgb *= texCol.w;",
					// "if(texCol.a >= 0.8){",
					// "if(texCol.a <= 0.05) discard;",
					"texCol *= vColor;",
					"texCol.xyz *= vColor.a;",
					"fragColor = texCol;",
					// "}else{",
					// "}",
				"}",
			];
		}

		export class SimpleShader extends ShaderLibObject {
			public static readonly vertexShader = [
				"#version 300 es",
				"#XBaseParams",
				"in vec3 aNormal;",
				"out highp vec3 normal;",

				"void mainPass() {",
					"vertPos = mvpMatrix * vertPos;",
					"uv = uv;",
					"normal = normalize((normalMatrix * vec4(aNormal, 1.0)).xyz);",
				"}",
			];

			public static readonly fragmentShader = [
				"#version 300 es",
				"precision mediump float;",
				"#XBaseParams",
				// "uniform sampler2D texSampler;",
				"in vec3 normal;",

				"void main(void) {",
					"fragColor.a = 1.0;",
					"vec4 texCol = vec4(1.0);//texture(texSampler, uv);",
					"texCol.xyz = texCol.xyz * texCol.a;",
					"vec3 matColor = mix(vec3(1.0), texCol.xyz * vec3(1.0), texCol.a);",
					"float lightColor = pow((dot(normal, vec3(0.3, 0.7, 0.8)) + 1.0) * 0.5, 3.0);",
					"fragColor.xyz = matColor * lightColor;",
				"}",
			];
		}

		export class SimpleColorShader extends ShaderLibObject {
			public static readonly vertexShader = [
				"#version 300 es",
				"#XBaseParams",
				"void mainPass() {",
					"vertPos = mvpMatrix * vertPos;",
				"}",
			];

			public static readonly fragmentShader = [
				"#version 300 es",
				"precision mediump float;",
				"#XBaseParams",

				"void main(void) {",
					"fragColor = vColor * alpha;",
				"}",
			];
		}

		export class CircleShader extends ShaderLibObject {
			public static readonly vertexShader = [
				"#version 300 es",
				"#XBaseParams",
				"void mainPass() {",
					"vertPos = mvpMatrix * vertPos;",
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
					"fragColor.xyz *= vColor.xyz;",
				"}",
			];
		}
	}
}
