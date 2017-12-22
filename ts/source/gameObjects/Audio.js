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
    var Audio = (function (_super) {
        __extends(Audio, _super);
        function Audio(game, audioName, autoStart, volume) {
            var _this = _super.call(this, game, 0, 0) || this;
            _this.isLoop = false;
            _this.audio = _this.game.cache.audio(audioName).audio;
            _this.persist = false;
            _this.volume = volume || 1;
            _this.onComplete = new XEngine.Signal();
            _this.completed = false;
            if (autoStart) {
                _this.play(0);
            }
            return _this;
        }
        Audio.prototype.update = function () {
            if (this.gainNode != null) {
                this.gainNode.gain.value = this.volume;
            }
        };
        Audio.prototype.play = function (time) {
            var _this = this;
            this.source = this.game.audioContext.createBufferSource();
            this.source.buffer = this.audio;
            this.source.connect(this.game.audioContext.destination);
            this.source.onended = function () {
                _this._complete();
            };
            this.gainNode = this.game.audioContext.createGain();
            this.source.connect(this.gainNode);
            this.gainNode.connect(this.game.audioContext.destination);
            this.gainNode.gain.value = this.volume;
            this.source.loop = this.isLoop;
            this.source.start(time || 0);
        };
        Audio.prototype.stop = function (time) {
            if (time === void 0) { time = 0; }
            if (this.source) {
                this.source.stop(time || 0);
            }
        };
        Audio.prototype.loop = function (value) {
            this.isLoop = value;
        };
        Audio.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
            if (this.onComplete) {
                this.onComplete._destroy();
                delete this.onComplete;
            }
        };
        Audio.prototype.kill = function () {
            this.alive = false;
            this.stop();
        };
        Audio.prototype._complete = function () {
            this.stop();
            if (this.onComplete) {
                this.onComplete.dispatch();
            }
        };
        return Audio;
    }(XEngine.GameObject));
    XEngine.Audio = Audio;
})(XEngine || (XEngine = {}));
