"use strict";
var XEngine;
(function (XEngine) {
    var AXIS;
    (function (AXIS) {
        AXIS["NONE"] = "none";
        AXIS["HORIZONTAL"] = "horizontal";
        AXIS["VERTICAL"] = "vertical";
        AXIS["BOTH"] = "both";
    })(AXIS = XEngine.AXIS || (XEngine.AXIS = {}));
    var Camera = (function () {
        function Camera(game) {
            this.game = game;
            this.position = new XEngine.Vector(0, 0);
            this.followedObject = null;
            this.axis = XEngine.AXIS.BOTH;
            this.pMatrix = mat4.create();
        }
        Camera.prototype.followObject = function (gameObject, offsetLeft, offsetUp) {
            this.follow = true;
            this.offsetLeft = offsetLeft || 0;
            this.offsetUp = offsetUp || 0;
            this.followedObject = gameObject;
        };
        Camera.prototype.update = function () {
            if (this.followedObject != null) {
                if (this.axis === XEngine.AXIS.BOTH || this.axis === XEngine.AXIS.HORIZONTAL) {
                    if ((this.followedObject.position.x - this.offsetLeft) - this.game.width / 2 > 0 &&
                        (this.followedObject.position.x + this.offsetLeft) + this.game.width / 2 < this.game.worldWidth) {
                        this.position.x = this.followedObject.position.x - this.game.width / 2 - this.offsetLeft;
                    }
                }
                if (this.axis === XEngine.AXIS.BOTH || this.axis === XEngine.AXIS.VERTICAL) {
                    if ((this.followedObject.position.y - this.offsetUp) - this.game.height / 2 > 0 &&
                        (this.followedObject.position.y + this.offsetUp) + this.game.height / 2 < this.game.worldHeight) {
                        this.position.y = this.followedObject.position.y - this.game.height / 2 - this.offsetUp;
                    }
                }
            }
            var right = this.game.width + this.position.x;
            var up = this.game.height + this.position.y;
            mat4.ortho(this.pMatrix, this.position.x, right, up, this.position.y, 0.1, 100);
        };
        return Camera;
    }());
    XEngine.Camera = Camera;
})(XEngine || (XEngine = {}));
