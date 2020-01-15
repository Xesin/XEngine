import {ShaderBlocks} from "./ShaderBlocks";

export class BasicShader {
    public static readonly vertexShader =
    ShaderBlocks.glVersion300
    .concat(ShaderBlocks.MVPUniforms)
    .concat(ShaderBlocks.instancedProperties)
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
        // "#ifdef INSTANCE_ENABLED",
        // "mvMatrix = viewMatrix * instancedModel;",
        // "mvpMatrix = pMatrix * mvMatrix;",
        // "#else",
        // "mvMatrix = viewMatrix * modelMatrix;",
        // "mvpMatrix = pMatrix * mvMatrix;",
        // "#endif",
        "mvMatrix = viewMatrix * modelMatrix;",
        "mvpMatrix = pMatrix * mvMatrix;",
        "gl_Position = mvpMatrix * aVertexPosition;",
        "gl_Position = pMatrix * viewMatrix * modelMatrix * aVertexPosition;",
        "vColor = aVertexColor;",
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

        "layout(location = 0) out vec4 fragColor;",
        "layout(location = 1) out vec4 fragNormals;",

        "void main(void) {",
            "float alpha = vColor.a;",
            "fragColor = vec4(vColor.xyz, 1.0);",
            "fragNormals = vec4(1.0);",
            // "if(alpha < 0.6) discard;",
        "}",
    ]);
}

