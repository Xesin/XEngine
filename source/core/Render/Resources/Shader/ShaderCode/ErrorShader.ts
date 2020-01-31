import {ShaderBlocks} from "./ShaderBlocks";

export class ErrorShader {
    public static readonly vertexShader =
    ShaderBlocks.glVersion300
    .concat(ShaderBlocks.MVPUniforms)
    .concat(
    [
        "in vec4 aVertexPosition;",
        "void main(void) {",
            "mat4 mvMatrix = viewMatrix * modelMatrix;",
            "mat4 mvpMatrix = pMatrix * mvMatrix;",
            "gl_Position = mvpMatrix * aVertexPosition;",
        "}",
    ]);

    public static readonly fragmentShader =
    ShaderBlocks.glVersion300
    .concat(["precision mediump float;"])
    .concat(ShaderBlocks.MVPUniforms)
    .concat([
        "out vec4 fragColor;",
        "void main(void) {",
            "fragColor = vec4(1.0,1.0,0.0,1.0);",
        "}",
    ]);
}
