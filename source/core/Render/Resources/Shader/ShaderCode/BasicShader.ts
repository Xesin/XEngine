import {ShaderBlocks} from "./ShaderBlocks";

export class BasicShader {
    public static readonly vertexShader =
    ShaderBlocks.glVersion300
    .concat(ShaderBlocks.MVPUniforms)
    .concat(
    [
        "in vec4 aVertexPosition;",
        "in vec4 aVertexColor;",
        "in vec3 aVertexNormal;",
        "in vec2 aUV;",
        "out mediump vec4 vColor;",
        "out mediump mat4 mvMatrix;",
        "out mediump mat4 mvpMatrix;",
        "void main(void) {",
    ],
    )
    .concat(
    [
        "mvMatrix = viewMatrix * modelMatrix;",
        "mvpMatrix = pMatrix * mvMatrix;",
        "gl_Position = mvpMatrix * aVertexPosition;",
            "vColor = aVertexColor;",
            "vColor = vec4(aVertexNormal, 1.0);",
            "vColor = vec4(aUV, 0.0, 1.0);",
        "}",
    ]);

    public static readonly fragmentShader =
    ShaderBlocks.glVersion300
    .concat(["precision mediump float;"])
    .concat(ShaderBlocks.MVPUniforms)
    .concat([
        "in vec4 vColor;",
        "in mat4 mvpMatrix;",
        "in mat4 mvMatrix;",

        "out vec4 fragColor;",

        "void main(void) {",
            "float alpha = vColor.a;",
            "fragColor = vColor;",
            // "if(alpha < 0.6) discard;",
        "}",
    ]);
}

