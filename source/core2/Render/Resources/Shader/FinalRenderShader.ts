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
			"out vec4 fragColor;",

			"void main(void) {",

				"vec3 color = texture(mainTex, uv).xyz;",
				"fragColor = vec4(color, 1.0);",
            "}",
        ]);
    }

}