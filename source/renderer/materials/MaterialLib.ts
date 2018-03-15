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

				"in vec3 aNormal;",
				"out vec3 normal;",

				"void mainPass() {",
					"normal = normalize((normalMatrix * vec4(aNormal, 1.0)).xyz) ;",
				"}",
				];

				public static readonly fragmentShader = [
					"#version 300 es",
					"precision mediump float;",
					"#include DEFINES",
					"#XBaseParams",

					"#define saturate(a) clamp( a, 0.0, 1.0 )",
					"#define Square(a) ( a * a )",
					"#define RECIPROCAL_PI 0.31830988618",
					"#define PI 3.14159265358979323",

					"struct Light{",
						"highp float intensity;",
						"highp vec3 position;",
						"highp vec3 color;",
						"highp float range;",
						"int type;",
					"};",

					"uniform vec4 color;",
					"uniform float smoothness;",
					"uniform float glossiness;",
					"uniform float normalIntensity;",
					"uniform vec3 eyePos;",
					"uniform sampler2D albedoTex;",
					"uniform sampler2D normalTex;",
					"uniform sampler2D opacityMask;",
					"uniform sampler2D ambientMap;",
					"uniform sampler2D specularTex;",
					"uniform Light light[MAX_LIGHTS];",
					"in vec3 normal;",
					"mat3 TBN;",

					"vec3 decodeNormals(sampler2D normalSampler, vec2 uv){",
						"vec3 texCol = texture(normalTex, uv).xyz;",
					"	return texCol * 2.0 - 1.0;",
					"}",

					"vec3 perturbNormalPerPixel( vec3 worldPosition, vec3 surf_norm ) {",
						"vec3 q0 = vec3( dFdx( worldPosition.x ), dFdx( worldPosition.y ), dFdx( worldPosition.z ) );",
						"vec3 q1 = vec3( dFdy( worldPosition.x ), dFdy( worldPosition.y ), dFdy( worldPosition.z ) );",
						"vec2 st0 = dFdx( uv.st );",
						"vec2 st1 = dFdy( uv.st );",
						"vec3 S = normalize( q0 * st1.t - q1 * st0.t );",
						"vec3 T = normalize( -q0 * st1.s + q1 * st0.s );",
						"vec3 N = normalize( surf_norm );",
						"vec3 crs = cross(S, T);",
						"if(dot(crs, N) < 0.0) T *= -1.0;",
						"vec3 mapN = decodeNormals( normalTex, uv );",
						"mapN.xy = normalIntensity * mapN.xy;",
						"mapN.y *= -1.0;",
						"mat3 tsn = mat3( S, T, N );",
						"return normalize( tsn * mapN );",
					"}",

					"vec3 Fresnel_Schlick( const in vec3 specularColor, const in float dotLH ) {",
						"float fresnel = exp2( ( -5.55473 * dotLH - 6.98316 ) * dotLH );",
						"return ( 1.0 - specularColor ) * fresnel + specularColor;",
					"}",

					"float BlinnPhong( const in float shininess, const in float dotNH ) {",
						"return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );",
					"}",

					// tslint:disable-next-line:max-line-length
					"vec3 specular_BlinnPhong(const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess){",
						"vec3 halfDir = normalize(lightDir + viewDir);",
						"float NdH = saturate(dot(normal, halfDir));",
						"float NdL = saturate(dot(lightDir, normal)); //FOR PREVENTING ARTIFACTS",
						"float LdH = saturate(dot(lightDir, halfDir));",
						"vec3 F = Fresnel_Schlick(specularColor, LdH);",
						"float G = 0.25;",
						"float D = BlinnPhong(shininess, NdH);",
						"return F * (G * D) * NdL;",
					"}",

					"float diffuse_BlinnPhong(const in vec3 lightDir, const in vec3 surfaceNormal){",
						"float NdL = saturate(dot(surfaceNormal, lightDir));",
						"return NdL;",
					"}",

					// tslint:disable-next-line:max-line-length
					"float getAttenuation(const in vec3 lightPos, const in vec3 worldPos, const in float range, const in float lightIntensity){",
						"vec3 toLight = lightPos - worldPos;",
						"float att = dot(toLight, toLight);",
						"att = (1.0 / (att + range)) * range;",
						"return (1.0 - (1.0 / pow(att + 1.0, 2.2))) * lightIntensity;",
					"}",

					// tslint:disable-next-line:max-line-length
					"vec3 getLightContribution(const in vec3 viewDir, const in vec3 worldPos, const in vec3 worldNormal, const in vec3 diffuseColor, const in vec3 specularColor){",
						"vec3 diffuseDirect = vec3(0.0);",
						"vec3 specular = vec3(0.0);",
						"for(int i = 0; i < MAX_LIGHTS; i++){",
							"vec3 lightPos = light[i].position;",
							"vec3 lightColor = light[i].color;",
							"float lightRange = light[i].range;",
							"float lightIntensity = light[i].intensity;",
							"vec3 lightDir;",
							"float atten = lightIntensity;",
							"if(light[i].type == 0){ //DIRECTIONAL LIGHT",
								"lightDir = normalize(lightPos);",
							"} else{ //POINT LIGHT",
								"lightDir =normalize(lightPos - worldPos);",
								"atten = getAttenuation(lightPos, worldPos, lightRange, lightIntensity);",
							"}",
							"diffuseDirect += diffuse_BlinnPhong(lightDir, worldNormal) * lightColor * atten;",
							"specular += specular_BlinnPhong(lightDir, viewDir, worldNormal, specularColor.rgb, glossiness) * lightColor * atten;",
						"}",
						"vec3 finalColor = diffuseDirect * diffuseColor + specular;",
						"return finalColor;",
					"}",

					"void main(void) {",
						"fragColor.a = 1.0;",
						"vec3 fragNormal = normal;",
						"vec3 ambient = vec3(0.0);",
						"vec4 specularColor = vec4(1.0);",
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
						"	specularColor = texture(specularTex, uv, -1.0);",
						"#endif",
						"#ifdef NORMAL",
						"	fragNormal = perturbNormalPerPixel(vWorldPos.xyz, normal);",
						"#endif",
						"#ifdef MASKED",
						"	#ifdef OPACITY_MASK",
						"		vec4 mask = texture(opacityMask, uv, -1.0);",
						"	#else",
						"		vec4 mask = vec4(1.0);",
						"	#endif",
						"	bool clip = (texCol.a * color.a) - 0.1 < 0.0 || mask.r - 0.1 < 0.0;",
						"	if(clip){",
						"		discard;",
						"	}",
						"#endif",
						"vec4 diffuseColor = texCol * color;",
						"diffuseColor.rgb *= diffuseColor.a; //PREMULTIPLY ALPHA",
						"vec3 viewDir = normalize(eyePos - vWorldPos.xyz); //View space to world space",
						// tslint:disable-next-line:max-line-length
						"vec3 lightContribution = getLightContribution(viewDir, vWorldPos.xyz, fragNormal, diffuseColor.rgb, specularColor.rgb);",
						"fragColor.xyz = lightContribution;",
						// tslint:disable-next-line:max-line-length
						"fragColor.xyz = pow(fragColor.xyz, vec3(0.4545)); // GAMMA CORRECTION",
						"fragColor.a = diffuseColor.a;",
						// "fragColor.xyz = vec3(atten);", // GAMMA CORRECTION
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
