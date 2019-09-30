/// <reference path="../Shader/ShaderBlocks.ts"/>

namespace XEngine2.ShaderMaterialLib{


    export class PhongShader {
		public static readonly vertexShader = 
		ShaderBlocks.glVersion300
		.concat(ShaderBlocks.VertexInput)
		.concat(ShaderBlocks.PhongVertexOutputs)
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
			"}"
        ]);

		public static readonly fragmentShader =
		ShaderBlocks.glVersion300
		.concat(["precision mediump float;"])
		.concat(ShaderBlocks.perturbNormals)
		.concat(ShaderBlocks.PhongFragmentInputs)
		.concat(ShaderBlocks.MVPUniforms)
		.concat(ShaderBlocks.Lightning)
		.concat([			
			"out vec4 fragColor;",

            "void main(void) {",
				"vec4 albedo = texture(albedoTex, uv) * color;",
				"vec4 opacity = texture(opacityTex, uv);",
				"float alpha = min(albedo.a, opacity.x);",
				"if(alpha < alphaClip) discard;",
				"vec3 lightsColor = vec3(0.0);",
				"vec3 surfaceNormal = perturbNormalPerPixel(vWorldPos, vNormal, uv);",
				"for(int i = 0; i < MAX_LIGHTS; i++)",
				"{",
					"Light curLight = light[i];",
					"lightsColor += PhongLightning(i, surfaceNormal, vWorldPos, albedo.xyz);",
				"}",
				"vec3 ambientColor = ambient.xyz * ambient.w;",
				"vec3 finalColor = lightsColor + albedo.xyz * ambientColor;",
				"fragColor.xyz = pow(lightsColor, vec3(0.4545));",
				"fragColor.a = alpha;",
				"fragColor.rgb *= fragColor.a;",
            "}",
        ]);
    }

}