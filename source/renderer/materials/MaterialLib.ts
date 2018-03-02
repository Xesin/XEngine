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
					"vertPos = modelMatrix * vertPos;",
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

		export class LambertShader extends ShaderLibObject {
			public static readonly vertexShader = [
				"#version 300 es",
				"#XBaseParams",
				"in vec3 aNormal;",
				"out highp vec3 normal;",

				"void mainPass() {",
					"vertPos = mvMatrix * vertPos;",
					"uv = uv;",
					"normal = normalize((normalMatrix * vec4(aNormal, 1.0)).xyz);",
				"}",
			];

			public static readonly fragmentShader = [
				"#version 300 es",
				"precision mediump float;",
				"#include DEFINES",
				"#XBaseParams",
				"uniform vec4 color;",
				"uniform float smoothness;",
				"uniform float glossiness;",
				"uniform sampler2D albedoTex;",
				"uniform sampler2D normalTex;",
				"uniform sampler2D opacityMask;",
				"in vec3 normal;",

				"void main(void) {",
					"fragColor.a = 1.0;",
					"vec3 fragNormal = normal;",
					"#ifdef ALBEDO",
					"	vec4 texCol = texture(albedoTex, uv);",
					"#else",
					"	vec4 texCol = vec4(1.0);",
					"#endif",
					"#ifdef NORMAL",
					"	fragNormal = texture(normalTex, uv).xyz;",
					"#endif",
					"#ifdef MASKED",
					"	#ifdef OPACITY_MASK",
					"		vec4 mask = texture(opacityMask, uv);",
					"	#else",
					"		vec4 mask = vec4(1.0);",
					"	#endif",
					"	bool clip = texCol.a - 0.1 < 0.0 || mask.r - 0.1 < 0.0;",
					"	if(clip){",
					"		discard;",
					"	}",
					"#endif",
					"texCol.xyz = texCol.xyz * texCol.a;",
					"vec4 matColor = mix(vec4(1.0), texCol, texCol.a) * color;",
					"float lightColor = clamp(dot(normal, vec3(0.3, 0.7, 0.8)), 0.0, 1.0);",
					"fragColor.xyz = matColor.xyz * lightColor;",
				"}",
			];
		}

		export class BlinnPhongShader extends ShaderLibObject {
			public static readonly vertexShader = [
				"#version 300 es",
				"#XBaseParams",
				"in vec3 aNormal;",
				"in vec3 aTangent;",
				"in vec3 eyePos;",
				"out highp vec3 normal;",
				"out highp vec3 cameraPos;",
				"out highp vec3 lightDir;",
				"out highp vec3 tangent;",
				"out highp vec3 bTangent;",

				"void mainPass() {",
					"cameraPos = normalize(mvpMatrix * vec4(eyePos, 1.0)).xyz;",
					"vertPos = mvMatrix * vertPos;",
					"lightDir = normalize(vec3(0.5, 0.5, 0.5));",
					"uv = uv;",
					"tangent = normalize(aTangent);",
					"bTangent = normalize(cross(aNormal, tangent));",
					"normal = normalize((normalMatrix * vec4(aNormal, 1.0)).xyz);",
					"}",
				];

				public static readonly fragmentShader = [
					"#version 300 es",
					"precision mediump float;",
					"#include DEFINES",
					"#XBaseParams",
					"uniform vec4 color;",
					"uniform float smoothness;",
					"uniform float glossiness;",
					"uniform sampler2D albedoTex;",
					"uniform sampler2D normalTex;",
					"uniform sampler2D opacityMask;",
					"in vec3 normal;",
					"in vec3 cameraPos;",
					"in vec3 lightDir;",
					"in vec3 tangent;",
					"in vec3 bTangent;",
					"in mat4 objectToWorldNormal;",
					"vec3 viewDir;",
					"vec3 reflectDir;",
					"mat3 TBN;",

					"vec3 decodeNormals(sampler2D normalSampler, vec2 uv){",
					"	return texture(normalTex, uv).xyz * 2.0 - 1.0;",
					"}",

					"void main(void) {",
						"TBN = mat3(tangent, bTangent, normal);",
						"fragColor.a = 1.0;",
						"vec3 fragNormal = normal;",
						"vec3 ambient = vec3(0.2);",
						"#ifdef ALBEDO",
						"	vec4 texCol = texture(albedoTex, uv);",
						"	ambient *= texCol.xyz;",
						"#else",
						"	vec4 texCol = vec4(1.0);",
						"#endif",
						"#ifdef NORMAL",
						"	fragNormal = TBN * decodeNormals(normalTex, uv);",
						"#endif",
						"#ifdef MASKED",
						"	#ifdef OPACITY_MASK",
						"		vec4 mask = texture(opacityMask, uv);",
						"	#else",
						"		vec4 mask = vec4(1.0);",
						"	#endif",
						"	bool clip = texCol.a - 0.1 < 0.0 || mask.r - 0.1 < 0.0;",
						"	if(clip){",
						"		discard;",
						"	}",
						"#endif",
						"viewDir = normalize(cameraPos - vertexPos.xyz);",
						"reflectDir = normalize(lightDir + cameraPos);",
						"texCol.xyz = texCol.xyz * texCol.a;",
						"vec4 matColor = mix(vec4(1.0), texCol, texCol.a) * color;",
						"float lightColor = clamp(dot(fragNormal, lightDir), 0.0, 1.0);",
						"float specular = pow(max(dot(reflectDir, fragNormal), 0.0), glossiness) * 0.5;",
						"fragColor.xyz = ambient + matColor.xyz * lightColor + specular;",
					"}",
			];
		}

		export class SimpleColorShader extends ShaderLibObject {
			public static readonly vertexShader = [
				"#version 300 es",
				"#XBaseParams",
				"void mainPass() {",
					"vertPos = mvMatrix * vertPos;",
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
					"vertPos = mvMatrix * vertPos;",
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
