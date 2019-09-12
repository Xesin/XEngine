/// <reference path="../Shader/ShaderBlocks.ts"/>
namespace XEngine2.ShaderMaterialLib{
    export class ShadowCasterShader {
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
			"vec4 encodeFloat (float depth) {",
				"const vec4 bitShift = vec4(",
					"256 * 256 * 256,",
					"256 * 256,",
					"256,",
					"1.0",
				");",
				"const vec4 bitMask = vec4(",
					"0,",
					"1.0 / 256.0,",
					"1.0 / 256.0,",
					"1.0 / 256.0",
				");",
				"vec4 comp = fract(depth * bitShift);",
				"comp -= comp.xxyz * bitMask;",
				"return comp;",
			"}",

			"out vec4 fragColor;",

            "void main(void) {",
				"fragColor = encodeFloat(gl_FragCoord.z);",
            "}",
        ]);
    }

}