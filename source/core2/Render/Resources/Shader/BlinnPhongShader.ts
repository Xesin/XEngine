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
		.concat(ShaderBlocks.perturbNormals)
		.concat(ShaderBlocks.BlinnPhongFragmentInputs)
		.concat(ShaderBlocks.MVPUniforms)
		.concat(ShaderBlocks.BlinnPhongFunctions)
		.concat([			
			"out vec4 fragColor;",

			"void main(void) {",
				"vec3 lightDir = vec3(0.7,0.5,1.0);",

				"vec4 albedo = texture(albedoTex, uv) * color;",
				"vec4 opacity = texture(opacityTex, uv);",
				"float alpha = min(albedo.a, opacity.x);",

				"if(alpha < 0.6) discard;",

				"vec3 surfaceNormal = perturbNormalPerPixel(vWorldPos, vNormal, uv);",

				"float DiffuseTerm = PhongDiffuseTerm(lightDir, surfaceNormal);",

				"vec3 viewDir = normalize(viewPos - vWorldPos.xyz);",
				"vec3 specularColor = BlinnSpecularColor(lightDir, viewDir, surfaceNormal, vec3(0.2), 13.0);",

				"vec3 ambientColor = ambient.xyz * ambient.w;",

				"vec3 finalColor = DiffuseTerm * albedo.xyz ",
					"+ specularColor",
					"+ albedo.xyz * ambientColor;",
				"fragColor.xyz = pow(finalColor, vec3(0.4545));",
				"fragColor.a = alpha;",
            "}",
        ]);
    }

}