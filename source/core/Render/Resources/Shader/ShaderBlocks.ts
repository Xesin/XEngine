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
            "in highp vec4 aVertexPosition;",
			"in highp vec4 aVertexColor;",
			"in highp vec3 aVertexNormal;",
        ];

        public static VertexInput = 
        ShaderBlocks.VertexInputNoUVs
        .concat(
        [
			"in highp vec2 aUV;"
        ]);

        public static VertexOutputNoUVs =
        [
			"out highp vec3 vNormal;",
			"out highp vec4 vColor;",
			"out highp mat4 mvMatrix;",
			"out highp mat4 mvpMatrix;"
        ];

        public static VertexOutput =
        ShaderBlocks.VertexOutputNoUVs
        .concat(
        [
            "out highp vec2 uv;",
        ]);

        public static FragmentInputNoUVs =
        [
            "in highp vec4 vColor;",
			"in highp mat4 mvpMatrix;",
			"in highp mat4 mvMatrix;",
            "in highp vec3 vNormal;"
        ];

        public static FragmentInput = 
        ShaderBlocks.FragmentInputNoUVs
        .concat(
        [
            "in highp vec2 uv;"
        ]);

        public static MVPUniforms = 
        [
            "uniform highp mat4 modelMatrix;",
			"uniform highp mat4 viewMatrix;",
			"uniform highp mat4 pMatrix;",
			"uniform highp mat4 normalMatrix;",
        ];

        public static PhongVertexOutputs = 
        ShaderBlocks.VertexOutput
        .concat(
        [
            "out highp vec3 vWorldPos;",
        ]
        );

        public static BlinnPhongVertexOutputs = 
        ShaderBlocks.PhongVertexOutputs
        .concat(
        [
            "out highp vec3 viewPos;",
        ]
        );

        public static PhongFragmentInputs =
        ShaderBlocks.FragmentInput
        .concat(
        [
            "in highp vec3 vWorldPos;",
            "uniform highp vec4 color;",
            "uniform highp vec4 ambient;",
            "uniform highp float alphaClip;",
            "uniform sampler2D albedoTex;",
            "uniform sampler2D opacityTex;"
        ]);

        public static BlinnPhongFragmentInputs =
        ShaderBlocks.PhongFragmentInputs
        .concat(
        [
            "in highp vec3 viewPos;",
        ]);

        public static mvpAndPosCalc = 
        [
            "mvMatrix = viewMatrix * modelMatrix;",
            "mvpMatrix = pMatrix * mvMatrix;",
            "gl_Position = mvpMatrix * aVertexPosition;",
            "vNormal = normalize((normalMatrix * vec4(aVertexNormal, 1.0)).xyz);",
        ];

        public static perturbNormals =
        [
            "uniform sampler2D normalTex;",

            "vec3 decodeNormals(sampler2D normalSampler, vec2 uv){",
                "vec3 texCol = texture(normalTex, uv).xyz;",
                "return texCol * 2.0 - 1.0;",
            "}",

            "vec3 perturbNormalPerPixel(vec3 worldPosition, vec3 surf_norm, vec2 uv) {",
                "vec3 q0 = vec3( dFdx( worldPosition.x ), dFdx( worldPosition.y ), dFdx( worldPosition.z ) );",
                "vec3 q1 = vec3( dFdy( worldPosition.x ), dFdy( worldPosition.y ), dFdy( worldPosition.z ) );",
                "vec2 st0 = dFdx( uv.st );",
                "vec2 st1 = dFdy( uv.st );",
                "vec3 S = normalize( q0 * st1.t - q1 * st0.t );",
                "vec3 T = normalize( -q0 * st1.s + q1 * st0.s );",
                "vec3 N = normalize( surf_norm );",
                "vec3 crs = cross(S, T);",
                "if(dot(crs, N) < 0.0) T *= -1.0;",
                "vec3 mapN = decodeNormals( normalTex, uv );",
                "mapN.xy = 0.5 * mapN.xy;",
                "mat3 tsn = mat3( S, T, N );",
                "return normalize( tsn * mapN );",
            "}",
        ];

        public static Lightning =
        [
            "#define LIGHTNING_ON",
            "#define MAX_LIGHTS 5",
            "struct Light{",
                "highp vec4 position;",
                "highp vec4 lightAttenuation;",
                "highp vec4 spotLightDirection;",
                "highp mat4 lightProjection;",
                "highp mat4 lightViewMatrix;",
                "highp vec3 color;",
                "highp float intensity;",
                "lowp float shadowBias;",
                "lowp int type;",
                "bool isActive;",
            "};",

            "uniform Light light[MAX_LIGHTS];",

            "uniform highp sampler2DShadow shadowMap;",
            "in vec4 shadowPos;",

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

			"float decodeFloat (vec4 color) {",
				"const vec4 bitShift = vec4(",
				  "1.0 / (256.0 * 256.0 * 256.0),",
				  "1.0 / (256.0 * 256.0),",
				  "1.0 / 256.0,",
				  "1.0",
				");",
				"return dot(color, bitShift);",
			  "}",

            "float getLightAttenuation(Light light, vec3 lightVector, vec3 lightDirection){",
                "vec3 spotDirection = light.spotLightDirection.xyz;",
                "float atten = 1.0;",
                "float rangeFade = dot(lightVector, lightVector) * light.lightAttenuation.x;",
                "rangeFade = min(1.0, max(0.0, 1.0 - rangeFade * rangeFade));",
                "rangeFade *= rangeFade;",

                "float spotFade = dot(spotDirection, lightDirection);",
                "spotFade = min(1.0, max(0.0,spotFade * light.lightAttenuation.z + light.lightAttenuation.w));",
                "spotFade *= spotFade;",

                "return spotFade * rangeFade / max(dot(lightVector, lightVector), 0.00001);",
            "}",

            "float DiffuseAttenuation(vec3 LightDir, vec3 objectNormal)",
            "{",
                "return max(dot(LightDir, objectNormal), 0.0);",
            "}",

            "float SpecularAttenuation(vec3 lightDir, vec3 viewDir, vec3 surfaceNormal, float smoothness, float specular)",
            "{",
                "vec3 halfDir = normalize(lightDir + viewDir);",
                "float nh = max(dot(surfaceNormal, halfDir), 0.0);",
                "float cosAngIncidence = dot(surfaceNormal, lightDir);",
                "cosAngIncidence = clamp(cosAngIncidence, 0.0, 1.0);",

                "float specularTerm = pow(nh, smoothness*128.0) * specular;",
                "specularTerm = cosAngIncidence != 0.0 ? specularTerm : 0.0;",
                "return specularTerm;",
            "}",

            "vec3 PhongLightning(int i, vec3 surfaceNormal, vec3 vWorldPos, vec3 albedo){",
                "Light curLight = light[i];",
                "vec3 lightVector = curLight.position.xyz - vWorldPos * curLight.position.w;",
                "vec3 lightDir = normalize(lightVector);",
                "vec3 lightColor = curLight.color * curLight.intensity;",
                "float atten = getLightAttenuation(curLight, lightVector, lightDir);",
                "float diffuse = DiffuseAttenuation(lightDir, surfaceNormal);",
                
                "vec3 finalColor = albedo * diffuse * lightColor * atten;",
                "return finalColor;",
            "}",

            "vec4 BlinnPhongLightning(int i, vec3 surfaceNormal, vec3 vWorldPos, vec3 viewDir, float smoothness, vec4 specularColor, vec3 albedo){",
                "Light curLight = light[i];",
                "vec3 lightVector = curLight.position.xyz - vWorldPos * curLight.position.w;",
                "vec3 lightDir = normalize(lightVector);",
                "vec3 lightColor = curLight.color * curLight.intensity;",
                "float atten = getLightAttenuation(curLight, lightVector, lightDir);",
                "float diffuse = DiffuseAttenuation(lightDir, surfaceNormal);",

                "float specular = SpecularAttenuation(lightDir, viewDir, surfaceNormal, smoothness, specularColor.w);",

                "vec3 finalSpecular = specular * specularColor.xyz * lightColor;",
                
                "vec3 finalColor = (albedo * diffuse * lightColor * atten) + (finalSpecular * atten);",
                "return vec4(finalColor.xyz, clamp(dot(surfaceNormal, lightDir), 0.0, 1.0));",
            "}",

        ];

        public static VertexLightning =
        [
            "#define LIGHTNING_ON",
            "#define MAX_LIGHTS 5",
            "struct Light{",
                "highp vec4 position;",
                "highp vec4 lightAttenuation;",
                "highp vec4 spotLightDirection;",
                "highp mat4 lightProjection;",
                "highp mat4 lightViewMatrix;",
                "highp vec3 color;",
                "highp float intensity;",
                "lowp float shadowBias;",
                "lowp int type;",
                "bool isActive;",
            "};",

            "uniform Light light[MAX_LIGHTS];",

            "out vec4 shadowPos;",
              
            "const mat4 texUnitConverter = mat4(0.5, 0.0, 0.0, 0.0, 0.0, 0.5, 0.0, 0.0, 0.0, 0.0, 0.5, 0.0, 0.5, 0.5, 0.5, 1.0);",
        ]
    }
}