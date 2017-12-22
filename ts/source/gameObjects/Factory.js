"use strict";
var XEngine;
(function (XEngine) {
    var ObjectFactory = (function () {
        function ObjectFactory(game) {
            this.game = game;
        }
        ObjectFactory.prototype.existing = function (gameObject, update, render) {
            if (update === void 0) { update = true; }
            if (render === void 0) { render = false; }
            if (update) {
                this.game.updateQueue.push(gameObject);
            }
            if (render) {
                this.game.renderQueue.push(gameObject);
            }
            gameObject.parent = this.game;
            gameObject._onInitialize();
            if (gameObject.start !== undefined) {
                gameObject.start();
            }
            return gameObject;
        };
        ObjectFactory.prototype.sprite = function (posX, posY, sprite, frame) {
            var gameObject = new XEngine.Sprite(this.game, posX, posY, sprite, frame);
            return this.existing(gameObject, true, true);
        };
        ObjectFactory.prototype.image = function (posX, posY, sprite, frame) {
            var gameObject = new XEngine.Sprite(this.game, posX, posY, sprite, frame);
            return this.existing(gameObject, false, true);
        };
        ObjectFactory.prototype.audio = function (audio, autoStart, volume) {
            var audioObject = new XEngine.Audio(this.game, audio, autoStart, volume);
            return this.existing(audioObject, true, false);
        };
        ObjectFactory.prototype.group = function (posX, posY) {
            var x = posX || 0;
            var y = posY || 0;
            var gameObject = new XEngine.Group(this.game, x, y);
            return this.existing(gameObject, true, true);
        };
        return ObjectFactory;
    }());
    XEngine.ObjectFactory = ObjectFactory;
})(XEngine || (XEngine = {}));
