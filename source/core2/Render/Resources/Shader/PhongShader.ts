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
		.concat(ShaderBlocks.PhongFragmentInputs)
		.concat(ShaderBlocks.MVPUniforms)
		.concat(ShaderBlocks.PhongFunctions)
		.concat([			
			"out vec4 fragColor;",

            "void main(void) {",
				"vec4 albedo = texture(albedoTex, uv) * color;",
				"vec4 opacity = texture(opacityTex, uv);",
				"float alpha = min(albedo.a, opacity.x);",
				"if(alpha < 0.6) discard;",
				"vec3 surfaceNormal = normalize(vNormal);",
				"float PhongTerm = PhongDiffuseTerm(vec3(0.7,0.5,1.0), surfaceNormal);",
				"vec3 ambientColor = ambient.xyz * ambient.w;",
				"fragColor.xyz = PhongTerm * albedo.xyz + albedo.xyz * ambientColor;",
				"fragColor.a = alpha;",
            "}",
        ]);
    }

}