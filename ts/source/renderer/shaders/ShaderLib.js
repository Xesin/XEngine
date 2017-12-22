"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var XEngine;
(function (XEngine) {
    var ShaderLib;
    (function (ShaderLib) {
        var ShaderLibObject = (function () {
            function ShaderLibObject() {
            }
            return ShaderLibObject;
        }());
        ShaderLib.ShaderLibObject = ShaderLibObject;
        var Sprite = (function (_super) {
            __extends(Sprite, _super);
            function Sprite() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            Sprite.vertexShader = [
                "#version 300 es",
                "#XBaseParams",
                "void mainPass() {",
                "}",
            ];
            Sprite.fragmentShader = [
                "#version 300 es",
                "precision mediump float;",
                "uniform sampler2D texSampler;",
                "#XBaseParams",
                "void main(void) {",
                "vec4 texCol = texture(texSampler, uv);",
                "texCol.rgb *= texCol.w;",
                "texCol.xyz *= vColor;",
                "fragColor = texCol*alpha;",
                "}",
            ];
            return Sprite;
        }(ShaderLibObject));
        ShaderLib.Sprite = Sprite;
        var SimpleColor = (function (_super) {
            __extends(SimpleColor, _super);
            function SimpleColor() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            SimpleColor.vertexShader = [
                "#version 300 es",
                "#XBaseParams",
                "void mainPass() {",
                "}",
            ];
            SimpleColor.fragmentShader = [
                "#version 300 es",
                "precision mediump float;",
                "#XBaseParams",
                "void main(void) {",
                "fragColor = vec4(vColor, alpha) * alpha;",
                "}",
            ];
            return SimpleColor;
        }(ShaderLibObject));
        ShaderLib.SimpleColor = SimpleColor;
        var CircleColor = (function (_super) {
            __extends(CircleColor, _super);
            function CircleColor() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            CircleColor.vertexShader = [
                "#version 300 es",
                "#XBaseParams",
                "void mainPass() {",
                "}",
            ];
            CircleColor.fragmentShader = [
                "#version 300 es",
                "precision mediump float;",
                "#XBaseParams",
                "void main(void) {",
                "vec2 uvOffset = uv - 0.5;",
                "float distance = length(uvOffset);",
                "float res = smoothstep(distance,distance+0.04,0.5);",
                "if(res < 0.1) discard;",
                "fragColor = vec4(1.0, 1.0, 1.0, res) * res * alpha;",
                "fragColor.xyz *= vColor;",
                "}",
            ];
            return CircleColor;
        }(ShaderLibObject));
        ShaderLib.CircleColor = CircleColor;
    })(ShaderLib = XEngine.ShaderLib || (XEngine.ShaderLib = {}));
})(XEngine || (XEngine = {}));
