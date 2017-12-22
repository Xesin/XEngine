"use strict";
var XEngine;
(function (XEngine) {
    var Loader = (function () {
        function Loader(game) {
            this.game = game;
            this.pendingLoads = new Array();
            this.progress = 0;
            this.preloading = false;
            this.onCompleteFile = new XEngine.Signal();
        }
        Loader.prototype.image = function (imageName, imageUrl) {
            this.pendingLoads.push(new XEngine.ImageLoader(imageName, imageUrl, this));
        };
        Loader.prototype.spriteSheet = function (imageName, imageUrl, frameWidth, frameHeight) {
            this.pendingLoads.push(new XEngine.ImageLoader(imageName, imageUrl, this, frameWidth, frameHeight));
        };
        Loader.prototype.jsonSpriteSheet = function (imageName, imageUrl, jsonUrl) {
            this.pendingLoads.push(new XEngine.JsonImageLoader(imageName, imageUrl, jsonUrl, this));
        };
        Loader.prototype.audio = function (audioName, audioUrl) {
            this.pendingLoads.push(new XEngine.AudioLoader(audioName, audioUrl, this));
        };
        Loader.prototype._startPreload = function () {
            this.preloading = true;
            if (this.pendingLoads.length === 0) {
                this._callStart();
            }
            else {
                for (var i = 0; i < this.pendingLoads.length; i++) {
                    this.pendingLoads[i].load();
                }
            }
        };
        Loader.prototype._notifyCompleted = function () {
            var completedTasks = 0;
            for (var i = 0; i < this.pendingLoads.length; i++) {
                if (this.pendingLoads[i].completed) {
                    completedTasks++;
                }
            }
            this.progress = completedTasks / this.pendingLoads.length;
            this.onCompleteFile.dispatch(this.progress);
            if (this.progress === 1) {
                delete this.pendingLoads;
                this.onCompleteFile._destroy();
                this.pendingLoads = new Array();
                this._callStart();
            }
        };
        Loader.prototype._callStart = function () {
            this.preloading = false;
            this.game.state.currentState.start();
        };
        return Loader;
    }());
    XEngine.Loader = Loader;
})(XEngine || (XEngine = {}));
