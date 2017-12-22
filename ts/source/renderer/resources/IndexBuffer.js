"use strict";
var XEngine;
(function (XEngine) {
    var IndexBuffer = (function () {
        function IndexBuffer(gl, buffer) {
            this.gl = gl;
            this.bufferType = gl.ELEMENT_ARRAY_BUFFER;
            this.buffer = buffer;
        }
        IndexBuffer.SetDiry = function () {
            IndexBuffer.CurrentIndexBuffer = null;
        };
        IndexBuffer.prototype.updateResource = function (bufferData, offset) {
            var gl = this.gl;
            IndexBuffer.CurrentIndexBuffer = this;
            gl.bindBuffer(this.bufferType, this.buffer);
            gl.bufferSubData(this.bufferType, offset, bufferData);
        };
        IndexBuffer.prototype.bind = function () {
            var gl = this.gl;
            var buffer = this.buffer;
            IndexBuffer.CurrentIndexBuffer = this;
            gl.bindBuffer(this.bufferType, buffer);
        };
        return IndexBuffer;
    }());
    XEngine.IndexBuffer = IndexBuffer;
})(XEngine || (XEngine = {}));
