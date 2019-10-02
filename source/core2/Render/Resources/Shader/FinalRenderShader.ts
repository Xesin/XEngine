/// <reference path="../Shader/ShaderBlocks.ts"/>

namespace XEngine2.ShaderMaterialLib{


    export class FinalRenderShader {
		public static readonly vertexShader = 
		ShaderBlocks.glVersion300
		.concat(
		[
			"in vec4 aVertexPosition;",
			"in vec2 aUV;",
			"out vec2 uv;",
			"void main(void) {",
				"uv = aUV;",
				"gl_Position = aVertexPosition;",
			"}"
        ]);

		public static readonly fragmentShader =
		ShaderBlocks.glVersion300
		.concat(["precision mediump float;"])
		.concat([			
			"in vec2 uv;",
			"uniform sampler2D mainTex;",
			"uniform sampler2D depthTex;",
			"out vec4 fragColor;",

			"float Linear01Depth(sampler2D depthTexture, vec2 uv){",
				"float n = 1.0;",
				"float f = 1000.0;",
				"float z = texture(depthTexture, uv).x;",
				"return (2.0 * n) / (f + n - z*(f-n));",
			"}",

			"void main(void) {",
				"float distance = 0.01;",
				"vec2 uv1 = vec2(1.0,0.0);",
				"vec2 uv2 = vec2(0.0,1.0);",
				"float baseSample = Linear01Depth(depthTex, uv);",
				"vec3 color = texture(mainTex, uv).xyz;",
				"fragColor = vec4(color, 1.0);",
            "}",
        ]);
    }

}