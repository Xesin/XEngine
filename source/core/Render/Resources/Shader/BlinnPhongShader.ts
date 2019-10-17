/// <reference path="./ShaderBlocks.ts"/>

namespace XEngine2.ShaderMaterialLib{


    export class BlinnPhongShader {
		public static readonly vertexShader = 
		ShaderBlocks.glVersion300
		.concat(ShaderBlocks.VertexInput)
		.concat(ShaderBlocks.BlinnPhongVertexOutputs)
		.concat(ShaderBlocks.MVPUniforms)
		.concat(ShaderBlocks.VertexLightning)
		.concat(
		[
            "void main(void) {",
		]
		)
		.concat(ShaderBlocks.mvpAndPosCalc)
		.concat(
		[
				"vWorldPos = modelMatrix * aVertexPosition;",
	   			"uv = aUV;",
				"vColor = aVertexColor;",
				"mat4 viewInverted = inverse(viewMatrix);",
				"viewPos = -transpose(mat3(viewMatrix)) * viewMatrix[3].xyz;",
			"}"
        ]);

		public static readonly fragmentShader =
		ShaderBlocks.glVersion300
		.concat(["precision mediump float;"])
		.concat(ShaderBlocks.perturbNormals)
		.concat(ShaderBlocks.BlinnPhongFragmentInputs)
		.concat(ShaderBlocks.MVPUniforms)
		.concat(ShaderBlocks.Lightning)
		.concat([
			"layout(location = 0) out vec4 fragColor;",
			"layout(location = 1) out vec4 fragNormals;",
			"uniform highp float smoothness;",
			"uniform highp vec4 specularColor;",

			"float random(vec4 seed4){",
				"float dot_product = dot(seed4, vec4(12.9898,78.233,45.164,94.673));",
				"return fract(sin(dot_product) * 43758.5453);",
			"}",

			"void main(void) {",

				"vec4 albedo = texture(albedoTex, uv) * color;",
				"vec4 opacity = texture(opacityTex, uv);",
				"float alpha = min(albedo.a, opacity.x);",

				"if(alpha < alphaClip) discard;",
				"vec3 finalColor = albedo.xyz;",

				"vec3 lightsColor = vec3(0.0);",
				"vec3 surfaceNormal = perturbNormalPerPixel(vWorldPos.xyz, vNormal, uv);",
				"vec3 viewDir = normalize(viewPos - vWorldPos.xyz);",
				"for(int i = 0; i < MAX_LIGHTS; i++)",
				"{",
					"Light curLight = light[i];",
					"vec3 DiffuseLightColor = BlinnPhongLightning(i, surfaceNormal, vWorldPos.xyz, viewDir, smoothness, specularColor, albedo.xyz);",

					"DiffuseLightColor =DiffuseLightColor *ShadowAttenuation(curLight, vWorldPos);",

					"lightsColor += DiffuseLightColor; ",
				"}",

				"vec3 ambientColor = ambient.xyz * ambient.w;",

				"finalColor = lightsColor + ambientColor * albedo.xyz;",

				"fragColor.xyz =finalColor;",
				"fragColor.a = alpha;",
				"fragColor.rgb *= fragColor.a;",
				"fragNormals = vec4(surfaceNormal, 1.0);",
            "}",
        ]);
    }

}