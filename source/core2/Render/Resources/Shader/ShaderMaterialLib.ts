namespace XEngine2.ShaderMaterialLib{


    export class BasicShader {
        public static readonly vertexShader = [
			"#version 300 es",
			"in vec3 aVertexPosition;",
			// "in vec2 vUv;",
			// "in vec4 aVertexColor;",
			"uniform mediump mat4 modelMatrix;",
			"uniform mediump mat4 viewMatrix;",
			"uniform mediump mat4 pMatrix;",
			// "uniform mediump mat4 normalMatrix;",
			// "out mediump vec2 uv;",
			// "out vec4 vObjectPos;",
			"out vec4 vWorldPos;",
			"out vec4 vClipPos;",
			// "out vec4 vViewPos;",
			// "out mediump vec4 vColor;",
			// "out mediump float alpha;",
			"out mediump mat4 mvpMatrix;",
			"out mediump mat4 mvMatrix;",

            // "in vec3 aNormal;",
            // "out vec3 normal;",

            "void main(void) {",
				"vec4 vObjectPos = vec4(aVertexPosition, 1.0);",
				"vWorldPos = modelMatrix * vObjectPos;",
				"mvMatrix = viewMatrix * modelMatrix;",
				"mvpMatrix = pMatrix * mvMatrix;",
				"vClipPos = mvpMatrix * vObjectPos;",
				// "vViewPos = -(mvMatrix * vObjectPos);",
				"gl_Position = vClipPos;",
	   			// "uv = vUv;",
				// "vColor = aVertexColor;",
			"}",
        ];

        public static readonly fragmentShader = [
			"#version 300 es",
			"precision mediump float;",
			// "in vec4 vObjectPos;",
			"in vec4 vWorldPos;",
			// "in vec4 vViewPos;",
			"in vec4 vClipPos;",
			"uniform mediump mat4 modelMatrix;",
			"uniform mediump mat4 viewMatrix;",
			"uniform mediump mat4 pMatrix;",
			// "uniform mediump mat4 normalMatrix;",
			"in mat4 mvpMatrix;",
			"in mat4 mvMatrix;",
			"out vec4 fragColor;",

            "struct Light{",
                "highp float intensity;",
                "highp vec3 position;",
                "highp vec3 color;",
                "highp float range;",
                "int type;",
            "};",

            "void main(void) {",
                "fragColor.a = 1.0;",
                "fragColor.xyz = vec3(0.5,0.1,0.1);",
            "}",
        ];
    }

}