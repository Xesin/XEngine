namespace XEngine2
{
    export class ShaderBlocks
    {
        public static glVersion300 = 
        [
            "#version 300 es"
        ]

        public static VertexInputNoUVs = 
        [
            "in vec3 aVertexPosition;",
			"in vec4 aVertexColor;",
			"in vec3 aVertexNormal;",
        ];

        public static VertexInput = 
        ShaderBlocks.VertexInputNoUVs
        .concat(
        [
			"in vec2 aUV;"
        ]);

        public static VertexOutputNoUVs =
        [
			"out vec3 vNormal;",
			"out mediump vec4 vColor;",
			"out mediump mat4 mvMatrix;",
			"out mediump mat4 mvpMatrix;"
        ];

        public static VertexOutput =
        ShaderBlocks.VertexOutputNoUVs
        .concat(
        [
            "out mediump vec2 uv;",
        ]);

        public static FragmentInputNoUVs =
        [
            "in vec4 vColor;",
            "in vec3 vNormal;",
			"in mat4 mvpMatrix;",
			"in mat4 mvMatrix;"
        ];

        public static FragmentInput = 
        ShaderBlocks.FragmentInputNoUVs
        .concat(
        [
            "in vec2 uv;"
        ]);

        public static MVPUniforms = 
        [
            "uniform mediump mat4 modelMatrix;",
			"uniform mediump mat4 viewMatrix;",
			"uniform mediump mat4 pMatrix;",
        ];

        public static PhongVertexOutputs = 
        ShaderBlocks.VertexOutput
        .concat(
        [
            "out vec3 vWorldPos;",
        ]
        );

        public static PhongFragmentInputs =
        ShaderBlocks.FragmentInput
        .concat(
        [
            "in vec3 vWorldPos;",
            "uniform sampler2D albedoTex;",
            "uniform sampler2D opacityTex;",
            "uniform vec4 color;",
            "uniform float ambient;"
        ]);

        public static PhongFunctions = 
        [
            "float PhongDiffuseTerm(vec3 LightDir, vec3 objectNormal)",
            "{",
                "return max(dot(LightDir, objectNormal), 0.0);",
            "}"
        ]

        public static mvpAndPosCalc = 
        [
            "vec4 vObjectPos = vec4(aVertexPosition, 1.0);",
            "mvMatrix = viewMatrix * modelMatrix;",
            "mvpMatrix = pMatrix * mvMatrix;",
            "gl_Position = mvpMatrix * vObjectPos;",
            "mat4 normalMatrix = transpose(inverse(modelMatrix));",
            "vNormal = normalize((normalMatrix * vec4(aVertexNormal, 1.0)).xyz);",
        ]
    }
}