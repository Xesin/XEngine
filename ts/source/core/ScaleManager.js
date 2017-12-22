"use strict";
var XEngine;
(function (XEngine) {
    var Scale;
    (function (Scale) {
        Scale[Scale["FIT"] = 0] = "FIT";
        Scale[Scale["SHOW_ALL"] = 1] = "SHOW_ALL";
        Scale[Scale["NO_SCALE"] = 2] = "NO_SCALE";
    })(Scale = XEngine.Scale || (XEngine.Scale = {}));
    var ScaleManager = (function () {
        function ScaleManager(game) {
            this.game = game;
            this.scaleType = Scale.NO_SCALE;
            this.orientation = "landScape";
            this.sourceAspectRatio = 0;
        }
        ScaleManager.prototype.init = function () {
            var _this = this;
            var onWindowsResize = function (event) {
                _this.onWindowsResize(event);
            };
            window.addEventListener("resize", onWindowsResize, true);
        };
        ScaleManager.prototype.updateScale = function () {
            if (this.scaleType !== XEngine.Scale.NO_SCALE) {
                var newWidth = 0;
                var newHeight = 0;
                if (this.scaleType === XEngine.Scale.FIT) {
                    newWidth = window.innerWidth;
                    newHeight = window.innerHeight;
                }
                else {
                    this.sourceAspectRatio = this.game.width / this.game.height;
                    newHeight = window.innerHeight;
                    newWidth = newHeight * this.sourceAspectRatio;
                    if (newWidth > window.innerWidth) {
                        newWidth = window.innerWidth;
                        newHeight = newWidth / this.sourceAspectRatio;
                    }
                }
                newWidth = Math.round(newWidth);
                newHeight = Math.round(newHeight);
                this.resizeCanvas(newWidth, newHeight);
            }
        };
        ScaleManager.prototype.resizeCanvas = function (newWidth, newHeight) {
            this.game.canvas.setAttribute("width", newWidth);
            this.game.canvas.setAttribute("height", newHeight);
            this.game.renderer.setScale(newWidth / this.game.width, newHeight / this.game.height);
            this.game.context.viewport(0, 0, newWidth, newHeight);
        };
        ScaleManager.prototype.onWindowsResize = function (event) {
            this.updateScale();
        };
        return ScaleManager;
    }());
    XEngine.ScaleManager = ScaleManager;
})(XEngine || (XEngine = {}));
