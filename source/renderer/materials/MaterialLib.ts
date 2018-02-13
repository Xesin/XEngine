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
					"vertPos = mvpMatrix * vertPos;",
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
					"uv = uv * 2.0;",
					"normal = (normalMatrix * vec4(aNormal, 1.0)).xyz;",
				"}",
			];

			public static readonly fragmentShader = [
				"#version 300 es",
				"precision mediump float;",
				"#XBaseParams",
				"uniform sampler2D texSampler;",
				"in vec3 normal;",

				"void main(void) {",
					"fragColor.a = 1.0;",
					"vec4 texCol = texture(texSampler, uv);",
					"texCol.xyz = texCol.xyz * texCol.a;",
					// "fragColor = vec4(texCol.rgb * texCol.a, 1.0);",
					"vec3 matColor = mix(vColor, texCol.xyz * vColor.xyz, texCol.a);",
					"float lightColor = pow((dot(normal, vec3(0.3, 0.7, 0.8)) + 1.0) * 0.5, 3.0) * 1.5;",
					"fragColor.xyz = matColor * lightColor;",
					// "fragColor = vec4(vec3(dot(normal, vec3(0.3, 0.3, 1.0))), 1.0) * fragColor;",
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
					"fragColor = vec4(vColor, alpha) * alpha;",
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
					"fragColor.xyz *= vColor;",
				"}",
			];
		}
	}
}
