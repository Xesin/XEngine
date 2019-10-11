/// <reference path="./ShaderBlocks.ts"/>

namespace XEngine2.ShaderMaterialLib{


    export class DesaturatePostProcessShader {
		public static readonly vertexShader = 
		ShaderBlocks.glVersion300
		.concat(
		[
			"in highp vec4 aVertexPosition;",
			"in highp vec2 aUV;",
			"out highp vec2 uv;",
			"void main(void) {",
				"uv = aUV;",
				"gl_Position = aVertexPosition;",
			"}"
        ]);

		public static readonly fragmentShader =
		ShaderBlocks.glVersion300
		.concat(["precision mediump float;"])
		.concat([			
			"in highp vec2 uv;",
			"uniform sampler2D mainTex;",
			"uniform sampler2D depthTex;",
			"out highp vec4 fragColor;",

			"float Linear01Depth(sampler2D depthTexture, vec2 uv){",
				"float n = 1.0;",
				"float f = 1000.0;",
				"float z = texture(depthTexture, uv).x;",
				"return (2.0 * n) / (f + n - z*(f-n));",
			"}",

			"void main(void) {",
				"float baseSample = Linear01Depth(depthTex, uv);",
				"vec4 color = texture(mainTex, uv);",
				"float intensity = color.r * 0.3 + color.g * 0.59 + color.b * 0.11;",
				"fragColor = vec4(intensity, intensity, intensity, color.a);",
            "}",
        ]);
    }

}