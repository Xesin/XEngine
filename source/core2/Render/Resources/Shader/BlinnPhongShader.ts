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
		.concat(ShaderBlocks.enableLightning)
		.concat(ShaderBlocks.perturbNormals)
		.concat(ShaderBlocks.BlinnPhongFragmentInputs)
		.concat(ShaderBlocks.MVPUniforms)
		.concat(ShaderBlocks.BlinnPhongFunctions)
		.concat([			
			"out vec4 fragColor;",

			"void main(void) {",

				"vec4 albedo = texture(albedoTex, uv) * color;",
				"vec4 opacity = texture(opacityTex, uv);",
				"float alpha = min(albedo.a, opacity.x);",

				"if(alpha < alphaClip) discard;",
				"vec3 finalColor = albedo.xyz;",
				"#ifdef LIGHTNING_ON",
					"vec3 lightsColor = vec3(0.0);",
					"for(int i = 0; i < MAX_LIGHTS; i++)",
					"{",
						"Light curLight = light[i];",
						"if(curLight.isActive){",
							"vec3 lightDir = curLight.position;",
							"float atten = 1.0;",
							"if(curLight.type != 0){",
								"vec3 dir = curLight.position - vWorldPos;",
								"lightDir = normalize(dir);",
								"atten = max(dot(dir, dir), 0.00001);",
							"}",
							"vec3 surfaceNormal = perturbNormalPerPixel(vWorldPos, vNormal, uv);",
							"vec3 lightColor = curLight.color * curLight.intensity;",
							"vec3 DiffuseLightColor = PhongDiffuseTerm(lightDir, surfaceNormal, atten) * lightColor;",

							"vec3 viewDir = normalize(viewPos - vWorldPos.xyz);",
							"vec3 specularColor = BlinnSpecularColor(lightDir, viewDir, surfaceNormal, vec3(0.2), 13.0, atten) * lightColor;",

							"lightsColor += DiffuseLightColor * albedo.xyz ",
											"+ specularColor;",
						"}",
					"}",

					"vec3 ambientColor = ambient.xyz * ambient.w;",

					"finalColor = lightsColor",
						"+ albedo.xyz * ambientColor;",
				"#endif",
				"fragColor.xyz = pow(finalColor , vec3(0.4545)) * alpha;",
				"fragColor.a = alpha;",
            "}",
        ]);
    }

}