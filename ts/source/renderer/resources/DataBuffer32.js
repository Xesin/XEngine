"use strict";
var XEngine;
(function (XEngine) {
    var DataBuffer32 = (function () {
        function DataBuffer32(byteSize) {
            this.wordLength = 0;
            this.wordCapacity = byteSize / 4;
            this.buffer = new ArrayBuffer(byteSize);
            this.floatView = new Float32Array(this.buffer);
            this.intView = new Int32Array(this.buffer);
            this.uintView = new Uint32Array(this.buffer);
        }
        DataBuffer32.prototype.clear = function () {
            this.wordLength = 0;
        };
        DataBuffer32.prototype.getByteLength = function () {
            return this.wordLength * 4;
        };
        DataBuffer32.prototype.getByteCapacity = function () {
            return this.buffer.byteLength;
        };
        DataBuffer32.prototype.allocate = function (wordSize) {
            var currentLength = this.wordLength;
            this.wordLength += wordSize;
            return currentLength;
        };
        DataBuffer32.prototype.getUsedBufferAsFloat = function () {
            return this.floatView.subarray(0, this.wordLength);
        };
        DataBuffer32.prototype.getUsedBufferAsInt = function () {
            return this.intView.subarray(0, this.wordLength);
        };
        DataBuffer32.prototype.getUsedBufferAsUint = function () {
            return this.uintView.subarray(0, this.wordLength);
        };
        return DataBuffer32;
    }());
    XEngine.DataBuffer32 = DataBuffer32;
})(XEngine || (XEngine = {}));
