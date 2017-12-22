"use strict";
var XEngine;
(function (XEngine) {
    var Uniforms;
    (function (Uniforms) {
        Uniforms[Uniforms["FLOAT"] = 0] = "FLOAT";
        Uniforms[Uniforms["INTEGER"] = 1] = "INTEGER";
        Uniforms[Uniforms["MAT2X2"] = 2] = "MAT2X2";
        Uniforms[Uniforms["MAT3X3"] = 3] = "MAT3X3";
        Uniforms[Uniforms["MAT4X4"] = 4] = "MAT4X4";
        Uniforms[Uniforms["VECTOR2"] = 5] = "VECTOR2";
        Uniforms[Uniforms["VECTOR3"] = 6] = "VECTOR3";
        Uniforms[Uniforms["VECTOR4"] = 7] = "VECTOR4";
        Uniforms[Uniforms["SAMPLER"] = 8] = "SAMPLER";
    })(Uniforms = XEngine.Uniforms || (XEngine.Uniforms = {}));
    var ShaderCompiler = (function () {
        function ShaderCompiler() {
        }
        ShaderCompiler.compileVertexShader = function (verxtexString) {
            verxtexString = verxtexString.replace("#XBaseParams", this.vertexBaseParams.join("\n"));
            verxtexString += this.vertexMain.join("\n");
            return verxtexString;
        };
        ShaderCompiler.compileFragmentShader = function (fragmentString) {
            fragmentString = fragmentString.replace("#XBaseParams", this.fragmentBaseParams.join("\n"));
            return fragmentString;
        };
        ShaderCompiler.vertexBaseParams = [
            "in vec2 aVertexPosition;",
            "in vec2 vUv;",
            "in vec3 aVertexColor;",
            "in float in_alpha;",
            "uniform mat4 pMatrix;",
            "out highp vec2 uv;",
            "vec4 vertPos;",
            "out lowp vec3 vColor;",
            "out lowp float alpha;",
        ];
        ShaderCompiler.fragmentBaseParams = [
            "in lowp vec3 vColor;",
            "in highp vec2 uv;",
            "in float alpha;",
            "out vec4 fragColor;",
        ];
        ShaderCompiler.vertexMain = [
            "void main(void) {",
            "vertPos = pMatrix * vec4(aVertexPosition, -1.0, 1.0);",
            "uv = vUv;",
            "vColor = aVertexColor;",
            "alpha = in_alpha;",
            "mainPass();",
            "gl_Position = vertPos;",
            "}",
        ];
        return ShaderCompiler;
    }());
    XEngine.ShaderCompiler = ShaderCompiler;
})(XEngine || (XEngine = {}));
