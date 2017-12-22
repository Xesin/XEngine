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
    var SpriteShader = (function (_super) {
        __extends(SpriteShader, _super);
        function SpriteShader() {
            return _super.call(this, XEngine.ShaderLib.Sprite.vertexShader, XEngine.ShaderLib.Sprite.fragmentShader) || this;
        }
        SpriteShader.prototype._setTexture = function (texture) {
            this.texture = texture;
        };
        SpriteShader.prototype._beginRender = function (gl) {
            XEngine.Shader.prototype._beginRender.call(this, gl);
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, this.texture);
        };
        SpriteShader.shader = new SpriteShader();
        return SpriteShader;
    }(XEngine.Shader));
    XEngine.SpriteShader = SpriteShader;
})(XEngine || (XEngine = {}));
