import {ShaderBlocks} from "./ShaderBlocks";

export class FontShader {
    public static readonly vertexShader =
    ShaderBlocks.glVersion300
    .concat(ShaderBlocks.MVPUniforms)
    
    .concat(
    [
        "in vec4 aVertexPosition;",
        "in vec4 aVertexColor;",
        "in vec2 aUV;",
    ])
    .concat(ShaderBlocks.instancedProperties)
    .concat([
        "out mediump vec4 vColor;",
        "out vec2 vUV;",

        "void main(void) {",
            "mat4 mvpMatrix = pMatrix * viewMatrix * instancedModel;",
            "vUV = aUV;",
            "vColor = aVertexColor;",
            "gl_Position = mvpMatrix * aVertexPosition;",
            "gl_Position.z = 0.5;",
        "}",
    ]);

    public static readonly fragmentShader =
    ShaderBlocks.glVersion300
    .concat(["precision mediump float;"])
    .concat(ShaderBlocks.MVPUniforms)
    .concat([
        "in vec4 vColor;",
        "in vec2 vUV;",

        "uniform sampler2D fontMap;",

        "out vec4 fragColor;",

        "void main(void) {",
            "float alpha = vColor.a;",
            "float fontDistField = texture(fontMap, vUV).a;",
            "alpha = step(0.5, fontDistField) * alpha;",

            "fragColor = vec4(vColor.xyz, alpha);",

            "if(fragColor.a < 0.0001) discard;",
            // "fragColor = vec4(vUV.x, vUV.y, 0.0, 1.0);",
        "}",
    ]);
}

