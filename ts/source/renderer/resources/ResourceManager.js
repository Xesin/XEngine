"use strict";
var XEngine;
(function (XEngine) {
    var ResourceManager = (function () {
        function ResourceManager(gl) {
            this.gl = gl;
        }
        ResourceManager.prototype.createBuffer = function (target, initialDataOrSize, usage) {
            var gl = this.gl;
            var buffer = gl.createBuffer();
            gl.bindBuffer(target, buffer);
            gl.bufferData(target, initialDataOrSize, usage);
            switch (target) {
                case gl.ARRAY_BUFFER:
                    return new XEngine.VertexBuffer(gl, buffer);
                case gl.ELEMENT_ARRAY_BUFFER:
                    return new XEngine.IndexBuffer(gl, buffer);
            }
        };
        ResourceManager.prototype.createShader = function (shaderClass) {
            var shader = new shaderClass();
            shader.initializeShader(this.gl);
            return shader;
        };
        return ResourceManager;
    }());
    XEngine.ResourceManager = ResourceManager;
})(XEngine || (XEngine = {}));
