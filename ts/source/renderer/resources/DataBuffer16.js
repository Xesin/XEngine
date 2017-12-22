"use strict";
var XEngine;
(function (XEngine) {
    var DataBuffer16 = (function () {
        function DataBuffer16(byteSize) {
            this.wordLength = 0;
            this.wordCapacity = byteSize / 4;
            this.buffer = new ArrayBuffer(byteSize);
            this.intView = new Int16Array(this.buffer);
            this.uintView = new Uint16Array(this.buffer);
        }
        DataBuffer16.prototype.clear = function () {
            this.wordLength = 0;
        };
        DataBuffer16.prototype.getByteLength = function () {
            return this.wordLength * 4;
        };
        DataBuffer16.prototype.getByteCapacity = function () {
            return this.buffer.byteLength;
        };
        DataBuffer16.prototype.allocate = function (wordSize) {
            var currentLength = this.wordLength;
            this.wordLength += wordSize;
            return currentLength;
        };
        DataBuffer16.prototype.getUsedBufferAsInt = function () {
            return this.intView.subarray(0, this.wordLength);
        };
        DataBuffer16.prototype.getUsedBufferAsUint = function () {
            return this.uintView.subarray(0, this.wordLength);
        };
        return DataBuffer16;
    }());
    XEngine.DataBuffer16 = DataBuffer16;
})(XEngine || (XEngine = {}));
