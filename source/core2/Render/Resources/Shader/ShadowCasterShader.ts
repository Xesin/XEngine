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
			"out highp vec3 vWorldPos;",
			"void main(void) {",
		]
		)
		.concat(ShaderBlocks.mvpAndPosCalc)
		.concat(
		[
				"vWorldPos = gl_Position.xyz;",
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
			"in highp vec3 vWorldPos;",

			"out highp vec4 fragColor;",

            "void main(void) {",
				"fragColor = vec4(vWorldPos.zzz, 1.0);",
            "}",
        ]);
    }

}