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
    var CircleColor = (function (_super) {
        __extends(CircleColor, _super);
        function CircleColor() {
            return _super.call(this, XEngine.ShaderLib.CircleColor.vertexShader, XEngine.ShaderLib.CircleColor.fragmentShader) || this;
        }
        CircleColor.shader = new CircleColor();
        return CircleColor;
    }(XEngine.Shader));
    XEngine.CircleColor = CircleColor;
})(XEngine || (XEngine = {}));
