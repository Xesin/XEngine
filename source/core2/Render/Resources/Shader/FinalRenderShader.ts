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

			"void main(void) {",
				"float n = 1.0;",
				"float f = 1000.0;",
				"float z = texture(depthTex, uv).x;",
				"float grey = (2.0 * n) / (f + n - z*(f-n));",
				"vec3 color = texture(mainTex, uv).xyz;",
				"fragColor = vec4(grey,grey,grey, 1.0);",
				// "fragColor = depth;",
            "}",
        ]);
    }

}