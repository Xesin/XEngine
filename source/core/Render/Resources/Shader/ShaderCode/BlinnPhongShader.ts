import {ShaderBlocks} from "./ShaderBlocks";

export class BlinnPhongShader {
    public static readonly vertexShader =
    ShaderBlocks.glVersion300
    .concat(ShaderBlocks.VertexInput)
    .concat(ShaderBlocks.instancedProperties)
    .concat(ShaderBlocks.BlinnPhongVertexOutputs)
    .concat(ShaderBlocks.MVPUniforms)
    .concat(ShaderBlocks.VertexLightning)
    .concat(
    [
        "void main(void) {",
    ],
    )
    .concat(ShaderBlocks.mvpAndPosCalc)
    .concat(
    [
        "vWorldPos = modelMatrix * aVertexPosition;",
        "#ifdef INSTANCE_ENABLED",
        "mvMatrix = viewMatrix * instancedModel;",
        "mvpMatrix = pMatrix * mvMatrix;",
        "gl_Position = mvpMatrix * aVertexPosition;",
        "vWorldPos = instancedModel * aVertexPosition;",
        "#endif",
        "vNormal = normalize((normalMatrix * vec4(aVertexNormal, 1.0)).xyz);",
        "uv = aUV;",
        "uv2 = aUV2;",
        "vColor = aVertexColor;",
        "mat4 viewInverted = inverse(viewMatrix);",
        "viewPos = -transpose(mat3(viewMatrix)) * viewMatrix[3].xyz;",
        "}",
    ]);

    public static readonly fragmentShader =
    ShaderBlocks.glVersion300
    .concat(["precision mediump float;"])
    .concat(ShaderBlocks.perturbNormals)
    .concat(ShaderBlocks.BlinnPhongFragmentInputs)
    .concat(ShaderBlocks.MVPUniforms)
    .concat(ShaderBlocks.Lightning)
    .concat([
        "layout(location = 0) out vec4 fragColor;",
        "layout(location = 1) out vec4 fragNormals;",
        "uniform highp float smoothness;",
        "uniform highp vec4 specularColor;",

        "float random(vec4 seed4){",
            "float dot_product = dot(seed4, vec4(12.9898,78.233,45.164,94.673));",
            "return fract(sin(dot_product) * 43758.5453);",
        "}",

        "void main(void) {",
            "vec4 albedo = texture(albedo, uv) * color;",
            "vec4 opacity = texture(opacity, uv);",
            "float alpha = min(albedo.a, opacity.x);",

            "if(alpha < alphaClip) discard;",
            "vec3 finalColor = albedo.xyz;",
            "vec3 surfaceNormal = perturbNormalPerPixel(vWorldPos.xyz, vNormal, uv);",
            "#ifdef LIGHTNING_ON",
                "vec3 lightsColor = vec3(0.0);",
                "vec3 viewDir = normalize(viewPos - vWorldPos.xyz);",
                "for(int i = 0; i < MAX_LIGHTS; i++)",
                "{",
                    "Light curLight = light[i];",
                    "vec3 DiffuseLightColor = BlinnPhongLightning(i, surfaceNormal, vWorldPos.xyz, viewDir, smoothness, specularColor, albedo.xyz);",

                    "DiffuseLightColor = DiffuseLightColor * ShadowAttenuation(curLight, vWorldPos);",

                    "lightsColor += DiffuseLightColor; ",
                "}",
                "vec3 ambientColor = ambient.xyz * ambient.w;",

                "finalColor = albedo.xyz * lightsColor  + (ambientColor * albedo.xyz);",
                "#endif",
            "fragColor.xyz = finalColor;",
            "fragColor.a = alpha;",
            "fragNormals = vec4(surfaceNormal, 1.0);",
            // "fragColor = vec4(uv.x, uv.y, 0.0, 1.0);",
        "}",
    ]);
}
