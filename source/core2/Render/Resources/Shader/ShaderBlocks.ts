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
            "in vec4 aVertexPosition;",
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
			"in mat4 mvpMatrix;",
			"in mat4 mvMatrix;",
            "in vec3 vNormal;"
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
			"uniform mediump mat4 normalMatrix;",
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
            "uniform vec4 ambient;"
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
            "mvMatrix = viewMatrix * modelMatrix;",
            "mvpMatrix = pMatrix * mvMatrix;",
            "gl_Position = mvpMatrix * aVertexPosition;",
            "vNormal = normalize((normalMatrix * vec4(aVertexNormal, 1.0)).xyz);",
        ]
    }
}