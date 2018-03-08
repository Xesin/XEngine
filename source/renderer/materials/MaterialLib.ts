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
					"gl_Position = pMatrix * modelMatrix * vObjectPos;",
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
				"in vec4 aTangent;",
				"out highp vec3 normal;",
				"out highp vec3 tangent;",
				"out highp vec3 bTangent;",

				"void mainPass() {",
					"uv = uv;",
					"normal = normalize((normalMatrix * vec4(aNormal, 1.0)).xyz);",
					"tangent = normalize(aTangent.xyz);",
					"bTangent = normalize(cross(aNormal, tangent) * aTangent.w);",
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
				"in vec3 tangent;",
				"in vec3 bTangent;",

				"void main(void) {",
					"mat3 TBN = mat3(tangent, bTangent, normal);",
					"fragColor.a = 1.0;",
					"vec3 fragNormal = normal;",
					"#ifdef ALBEDO",
					"	vec4 texCol = texture(albedoTex, uv, -1.0);",
					"#else",
					"	vec4 texCol = vec4(1.0);",
					"#endif",
					"#ifdef NORMAL",
					"	fragNormal = texture(normalTex, uv, -1.0).xyz;",
					"#endif",
					"#ifdef MASKED",
					"	#ifdef OPACITY_MASK",
					"		vec4 mask = texture(opacityMask, uv, -1.0);",
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
					"fragColor.xyz = pow(fragColor.xyz, vec3(0.4545));", // GAMMA CORRECTION
				"}",
			];
		}

		export class BlinnPhongShader extends ShaderLibObject {
			public static readonly vertexShader = [
				"#version 300 es",
				"#XBaseParams",

				"struct Light{",
					"highp float intensity;",
					"highp vec3 position;",
					"highp vec3 color;",
				"};",

				"in vec3 aNormal;",
				"in vec4 aTangent;",
				"uniform Light light[MAX_LIGHTS];",
				"out highp vec3 normal;",
				"out highp vec3 viewDir;",
				"out highp vec3 tangent;",
				"out highp vec3 bTangent;",

				"void mainPass() {",
					"uv = uv;",
					"tangent = (normalMatrix * vec4(aTangent.xyz, 0.0)).xyz;",
					"normal = normalize((normalMatrix * vec4(aNormal, 1.0)).xyz) ;",
					"bTangent = normalize(cross(normal, tangent.xyz) * aTangent.w);",
				"}",
				];

				public static readonly fragmentShader = [
					"#version 300 es",
					"precision mediump float;",
					"#include DEFINES",
					"#XBaseParams",

					"struct Light{",
						"highp float intensity;",
						"highp vec3 position;",
						"highp vec3 color;",
					"};",

					"uniform vec4 color;",
					"uniform float smoothness;",
					"uniform float glossiness;",
					"uniform sampler2D albedoTex;",
					"uniform sampler2D normalTex;",
					"uniform sampler2D opacityMask;",
					"uniform sampler2D ambientMap;",
					"uniform sampler2D specularTex;",
					"uniform Light light[MAX_LIGHTS];",
					"in vec3 normal;",
					"in vec3 tangent;",
					"in vec3 bTangent;",
					"vec3 viewDir;",
					"vec3 reflectDir;",
					"mat3 TBN;",

					"vec3 decodeNormals(sampler2D normalSampler, vec2 uv){",
					"	return texture(normalTex, uv, -1.0).xyz * 2.0 - 1.0;",
					"}",

					"void main(void) {",
						"TBN = mat3(tangent, bTangent, normal);",
						"fragColor.a = 1.0;",
						"vec3 fragNormal = normal;",
						"vec3 ambient = vec3(0.0);",
						"vec3 specularColor = vec3(1.0);",
						"#ifdef AMBIENT_MAP",
							"ambient = texture(ambientMap, uv, -1.0).xyz * 0.2;",
						"#endif",
						"#ifdef ALBEDO",
						"	vec4 texCol = texture(albedoTex, uv, -1.0);",
						"	ambient *= texCol.xyz;",
						"#else",
						"	vec4 texCol = vec4(1.0);",
						"#endif",

						"#ifdef SPECULAR_COLOR",
						"	specularColor = texture(specularTex, uv, -1.0).xyz;",
						"#endif",
						"#ifdef NORMAL",
						"	fragNormal = normalize(TBN * decodeNormals(normalTex, uv));",
						"#endif",
						"#ifdef MASKED",
						"	#ifdef OPACITY_MASK",
						"		vec4 mask = texture(opacityMask, uv, -1.0);",
						"	#else",
						"		vec4 mask = vec4(1.0);",
						"	#endif",
						"	bool clip = texCol.a - 0.1 < 0.0 || mask.r - 0.1 < 0.0;",
						"	if(clip){",
						"		discard;",
						"	}",
						"#endif",
						"viewDir = normalize(mat3(viewMatrix) * vWorldPos.xyz);",
						"reflectDir = normalize(light[0].position + viewDir);",
						"vec3 lightDir = normalize((mat3(modelMatrix) * light[0].position) - vWorldPos.xyz);",
						"float lightColor = clamp(dot(fragNormal, lightDir), 0.0, 1.0) * light[0].intensity;",
						"vec3 specular = pow(max(dot(reflectDir, fragNormal), 0.0), glossiness) * specularColor * light[0].intensity;",
						"vec4 matColor = mix(vec4(1.0), texCol, texCol.a) * color;",
						"texCol.xyz = texCol.xyz * texCol.a;",
						"fragColor.xyz = ambient + matColor.xyz * lightColor + specular;",
						"fragColor.xyz = pow(fragColor.xyz, vec3(0.4545));", // GAMMA CORRECTION
						// tslint:disable-next-line:max-line-length
						"fragColor.xyz = vec3(lightColor);", // GAMMA CORRECTION
					"}",
			];
		}

		export class SimpleColorShader extends ShaderLibObject {
			public static readonly vertexShader = [
				"#version 300 es",
				"#XBaseParams",
				"void mainPass() {",
					"gl_Position = pMatrix * modelMatrix * vObjectPos;",
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
					"gl_Position = pMatrix * modelMatrix * vObjectPos;",
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
