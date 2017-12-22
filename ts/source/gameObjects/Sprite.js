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
    var Sprite = (function (_super) {
        __extends(Sprite, _super);
        function Sprite(game, posX, posY, sprite, frame) {
            var _this = _super.call(this, game, posX, posY) || this;
            _this.sprite = sprite;
            _this.game = game;
            _this.frame = frame || 0;
            var cache_image = _this.game.cache.image(sprite);
            _this.width = cache_image.frameWidth || 10;
            _this.height = cache_image.frameHeight || 10;
            _this.columns = Math.floor(cache_image.image.width / _this.width);
            _this.rows = Math.floor(cache_image.image.height / _this.height);
            _this.tilled = false;
            if (_this.game.cache.getJson(sprite) !== undefined) {
                _this.json = _this.game.cache.getJson(sprite);
                var frameInfo = void 0;
                if (typeof _this.frame === "string") {
                    frameInfo = _this.json[_this.frame];
                }
                else {
                    frameInfo = _this.json.frames[_this.frame];
                }
                _this.width = frameInfo.frame.w;
                _this.height = frameInfo.frame.h;
            }
            if (_this.columns > 1 || _this.rows > 1 || _this.json !== undefined) {
                _this.tilled = true;
            }
            _this.position.setTo(posX, posY);
            _this.shader = _this.game.renderer.spriteBatch.shader;
            return _this;
        }
        Sprite.prototype._beginRender = function (gl) {
            return;
        };
        Sprite.prototype._renderToCanvas = function (gl) {
            if (this.tilled) {
                var startX = 0;
                var startY = 0;
                var endX = 0;
                var endY = 0;
                var cache_image = this.game.cache.image(this.sprite);
                if (this.json) {
                    var frameInfo = void 0;
                    if (typeof this.frame === "string") {
                        frameInfo = this.json[this.frame];
                    }
                    else {
                        frameInfo = this.json.frames[this.frame];
                    }
                    var width = frameInfo.frame.w;
                    var height = frameInfo.frame.h;
                    startX = frameInfo.frame.x;
                    startY = frameInfo.frame.y;
                    endX = startX + width;
                    endY = startY + height;
                }
                else {
                    var column = this.frame;
                    if (column > this.columns - 1) {
                        column = this.frame % this.columns;
                    }
                    var row = Math.floor(this.frame / this.columns);
                    startX = column * cache_image.frameWidth;
                    startY = row * cache_image.frameHeight;
                    endX = startX + cache_image.frameWidth;
                    endY = startY + cache_image.frameHeight;
                }
                var startUvX = startX / cache_image.image.width;
                var startUvY = startY / cache_image.image.height;
                var endUvX = endX / cache_image.image.width;
                var endUvY = endY / cache_image.image.height;
                this._uv = [
                    startUvX, startUvY,
                    startUvX, endUvY,
                    endUvX, startUvY,
                    endUvX, endUvY,
                ];
            }
            this.game.renderer.spriteBatch.addSprite(this, this.shader);
        };
        Sprite.prototype.reset = function (x, y) {
            this.position.x = x;
            this.position.y = y;
            this.alive = true;
            if (this.start !== undefined) {
                this.start();
            }
            if (this.body) {
                this.body.velocity = new XEngine.Vector(0, 0);
            }
        };
        Sprite.prototype._updateAnims = function (deltaMillis) {
            this.animation._update(deltaMillis);
        };
        return Sprite;
    }(XEngine.GameObject));
    XEngine.Sprite = Sprite;
})(XEngine || (XEngine = {}));
