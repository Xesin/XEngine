namespace XEngine2.ShaderMaterialLib{


    export class BasicShader {
        public static readonly vertexShader = [
			"#version 300 es",
			"in vec3 aVertexPosition;",
			"in vec4 aVertexColor;",
			"in vec3 aVertexNormal;",
			"uniform mediump mat4 modelMatrix;",
			"uniform mediump mat4 viewMatrix;",
			"uniform mediump mat4 pMatrix;",
			// "out mediump vec2 uv;",
			"out vec4 vObjectPos;",
			"out vec3 vNormal;",
			"out vec4 vWorldPos;",
			"out vec4 vClipPos;",
			// "out vec4 vViewPos;",
			"out mediump vec4 vColor;",
			// "out mediump float alpha;",
			"out mediump mat4 mvpMatrix;",
			"out mediump mat4 mvMatrix;",

            "void main(void) {",
				"vObjectPos = vec4(aVertexPosition, 1.0);",
				"vWorldPos = modelMatrix * vObjectPos;",
				"mvMatrix = viewMatrix * modelMatrix;",
				"mvpMatrix = pMatrix * mvMatrix;",
				"vClipPos = mvpMatrix * vObjectPos;",
				"mat4 normalMatrix = transpose(inverse(modelMatrix));",
				"vNormal = normalize((normalMatrix * vec4(aVertexNormal, 1.0)).xyz);",
				// "vViewPos = -(mvMatrix * vObjectPos);",
				"gl_Position = vClipPos;",
	   			// "uv = vUv;",
				"vColor = aVertexColor;",
			"}",
        ];

        public static readonly fragmentShader = [
			"#version 300 es",
			"precision mediump float;",
			"in vec4 vObjectPos;",
			"in vec4 vWorldPos;",
			"in vec3 vNormal;",
			// "in vec4 vViewPos;",
			"in vec4 vClipPos;",
			"in vec4 vColor;",
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
				"float ndl = dot(vec3(0.0,0.0,1.0), vNormal);",
                "fragColor.xyz = ndl * vColor.xyz;",
            "}",
        ];
    }

}