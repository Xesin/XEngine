/// <reference path="../Shader/ShaderBlocks.ts"/>

namespace XEngine2.ShaderMaterialLib{


    export class BlinnPhongShader {
		public static readonly vertexShader = 
		ShaderBlocks.glVersion300
		.concat(ShaderBlocks.VertexInput)
		.concat(ShaderBlocks.BlinnPhongVertexOutputs)
		.concat(ShaderBlocks.MVPUniforms)
		.concat(
		[
            "void main(void) {",
		]
		)
		.concat(ShaderBlocks.mvpAndPosCalc)
		.concat(
		[
				"vWorldPos = (modelMatrix * aVertexPosition).xyz;",
	   			"uv = aUV;",
				"vColor = aVertexColor;",
				"mat4 viewInverted = inverse(viewMatrix);",
				"viewPos = -transpose(mat3(viewMatrix)) * viewMatrix[3].xyz;",
			"}"
        ]);

		public static readonly fragmentShader =
		ShaderBlocks.glVersion300
		.concat(["precision mediump float;"])
		.concat(ShaderBlocks.Lightning)
		.concat(ShaderBlocks.perturbNormals)
		.concat(ShaderBlocks.BlinnPhongFragmentInputs)
		.concat(ShaderBlocks.MVPUniforms)
		.concat([			
			"out vec4 fragColor;",
			"uniform float smoothness;",
			"uniform vec4 specularColor;",

			"void main(void) {",

				"vec4 albedo = texture(albedoTex, uv) * color;",
				"vec4 opacity = texture(opacityTex, uv);",
				"float alpha = min(albedo.a, opacity.x);",

				"if(alpha < alphaClip) discard;",
				"vec3 finalColor = albedo.xyz;",

				"vec3 lightsColor = vec3(0.0);",
				"vec3 surfaceNormal = perturbNormalPerPixel(vWorldPos, vNormal, uv);",
				"vec3 viewDir = normalize(viewPos - vWorldPos.xyz);",
				"for(int i = 0; i < MAX_LIGHTS; i++)",
				"{",
					"Light curLight = light[i];",
					"vec3 DiffuseLightColor = BlinnPhongLightning(i, surfaceNormal, vWorldPos, viewDir, smoothness, specularColor, albedo.xyz);",
					"lightsColor += DiffuseLightColor; ",
				"}",

				"vec3 ambientColor = ambient.xyz * ambient.w;",

				"finalColor = lightsColor",
					"+ albedo.xyz * ambientColor;",

				"fragColor.xyz = pow(finalColor , vec3(0.4545));",
				"fragColor.a = alpha;",
				"fragColor.rgb *= fragColor.a;",
            "}",
        ]);
    }

}