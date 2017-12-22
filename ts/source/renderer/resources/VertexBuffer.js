"use strict";
var XEngine;
(function (XEngine) {
    var VertexBuffer = (function () {
        function VertexBuffer(gl, buffer) {
            this.gl = gl;
            this.bufferType = gl.ARRAY_BUFFER;
            this.buffer = buffer;
            this.attributes = new Array();
        }
        VertexBuffer.SetDiry = function () {
            VertexBuffer.CurrentVertexBuffer = null;
        };
        VertexBuffer.prototype.addAttribute = function (index, size, type, normalized, stride, offset) {
            this.attributes.push({
                index: index,
                size: size,
                type: type,
                normalized: normalized,
                stride: stride,
                offset: offset,
            });
        };
        VertexBuffer.prototype.updateResource = function (bufferData, offset) {
            var gl = this.gl;
            VertexBuffer.CurrentVertexBuffer = this;
            gl.bindBuffer(this.bufferType, this.buffer);
            gl.bufferSubData(this.bufferType, offset, bufferData);
        };
        VertexBuffer.prototype.bind = function () {
            var gl = this.gl;
            var buffer = this.buffer;
            var attributes = this.attributes;
            var attributesLength = attributes.length;
            VertexBuffer.CurrentVertexBuffer = this;
            gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
            for (var index = 0; index < attributesLength; ++index) {
                var element = attributes[index];
                if (element !== undefined && element !== null) {
                    gl.enableVertexAttribArray(element.index);
                    gl.vertexAttribPointer(element.index, element.size, element.type, element.normalized, element.stride, element.offset);
                }
            }
        };
        return VertexBuffer;
    }());
    XEngine.VertexBuffer = VertexBuffer;
})(XEngine || (XEngine = {}));
