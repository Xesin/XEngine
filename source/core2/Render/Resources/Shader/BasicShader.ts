/// <reference path="../Shader/ShaderBlocks.ts"/>
namespace XEngine2.ShaderMaterialLib{


    export class BasicShader {
		public static readonly vertexShader =
		ShaderBlocks.glVersion300
		.concat(ShaderBlocks.VertexInputNoUVs)
		.concat(ShaderBlocks.VertexOutputNoUVs)
		.concat(ShaderBlocks.MVPUniforms)
		.concat(
		[
			"void main(void) {",
		]
		)
		.concat(ShaderBlocks.mvpAndPosCalc)
		.concat(
		[
				"vColor = aVertexColor;",
			"}",
        ]);

		public static readonly fragmentShader =
		ShaderBlocks.glVersion300
		.concat(["precision mediump float;"])
		.concat(ShaderBlocks.FragmentInputNoUVs)
		.concat(ShaderBlocks.MVPUniforms)
		.concat([
			"out vec4 fragColor;",

            "void main(void) {",
				"float alpha = vColor.a;",
				"fragColor = vColor;",
				"if(alpha < 0.9) discard;",
            "}",
        ]);
    }

}