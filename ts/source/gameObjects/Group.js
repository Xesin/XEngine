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
    var Group = (function (_super) {
        __extends(Group, _super);
        function Group(game, posX, posY) {
            var _this = _super.call(this, game, posX, posY) || this;
            _this.children = new Array();
            return _this;
        }
        Group.prototype._beginRender = function (gl) {
            return;
        };
        Group.prototype.update = function (deltaTime) {
            this.children.removePending();
            for (var i = this.children.length - 1; i >= 0; i--) {
                var gameObject = this.children[i];
                if (gameObject.alive) {
                    gameObject.update(deltaTime);
                    if (XEngine.Sprite.prototype.isPrototypeOf(gameObject)) {
                        gameObject._updateAnims(this.game.deltaMillis);
                    }
                }
            }
        };
        Group.prototype.getFirstDead = function () {
            for (var i = this.children.length - 1; i >= 0; i--) {
                var gameObject = this.children[i];
                if (!gameObject.alive) {
                    return gameObject;
                }
            }
            return null;
        };
        Group.prototype.getChildAtIndex = function (index) {
            return this.children[index];
        };
        Group.prototype.childCount = function () {
            return this.children.length;
        };
        Group.prototype.destroy = function () {
            this.kill();
            this.isPendingDestroy = true;
            for (var i = this.children.length - 1; i >= 0; i--) {
                var gameObject = this.children[i];
                if (gameObject.destroy !== undefined) {
                    gameObject.destroy();
                    delete this.children[i];
                }
            }
            this.children = [];
            if (this.onDestroy !== undefined) {
                this.onDestroy();
            }
        };
        Group.prototype.add = function (gameObject) {
            if (this.game.updateQueue.indexOf(gameObject) >= 0) {
                var index = this.game.updateQueue.indexOf(gameObject);
                this.game.updateQueue.splice(index, 1);
            }
            if (this.game.renderQueue.indexOf(gameObject) >= 0) {
                var index = this.game.renderQueue.indexOf(gameObject);
                this.game.renderQueue.splice(index, 1);
            }
            if (gameObject.parent.constructor === XEngine.Group && gameObject.parent.indexOf(gameObject) >= 0) {
                var index = gameObject.parent.children.indexOf(gameObject);
                gameObject.parent.children.splice(index, 1);
            }
            this.children.push(gameObject);
            if (gameObject.start !== undefined) {
                gameObject.start();
            }
            gameObject.parent = this;
            return gameObject;
        };
        Group.prototype.setAll = function (property, value) {
            for (var i = this.children.length - 1; i >= 0; i--) {
                this.children[i][property] = value;
            }
        };
        Group.prototype.callAll = function (funct) {
            for (var i = this.children.length - 1; i >= 0; i--) {
                if (this.children[i][funct] !== undefined) {
                    this.children[i][funct]();
                }
            }
        };
        return Group;
    }(XEngine.GameObject));
    XEngine.Group = Group;
})(XEngine || (XEngine = {}));
