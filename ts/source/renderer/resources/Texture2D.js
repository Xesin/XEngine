"use strict";
var XEngine;
(function (XEngine) {
    var WRAP_MODE;
    (function (WRAP_MODE) {
        WRAP_MODE[WRAP_MODE["CLAMP"] = 0] = "CLAMP";
        WRAP_MODE[WRAP_MODE["WRAP"] = 1] = "WRAP";
    })(WRAP_MODE = XEngine.WRAP_MODE || (XEngine.WRAP_MODE = {}));
    var Texture2D = (function () {
        function Texture2D(name, width, height, wrapMode) {
            if (wrapMode === void 0) { wrapMode = WRAP_MODE.CLAMP; }
            this.imageName = name;
            this.frameWidth = width;
            this.frameHeight = height;
            this._texture = null;
            this.ready = false;
            this.wrapMode = wrapMode;
        }
        Texture2D.prototype.createTexture = function (gl) {
            if (this.imageName == null) {
                return;
            }
            this._texture = gl.createTexture();
            var internalFormat = gl.RGBA;
            var srcFormat = gl.RGBA;
            var srcType = gl.UNSIGNED_BYTE;
            gl.bindTexture(gl.TEXTURE_2D, this._texture);
            if (this.wrapMode === WRAP_MODE.WRAP) {
                gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, srcFormat, srcType, this.image);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
            }
            else {
                gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, srcFormat, srcType, this.image);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            }
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            this.ready = true;
        };
        return Texture2D;
    }());
    XEngine.Texture2D = Texture2D;
})(XEngine || (XEngine = {}));
