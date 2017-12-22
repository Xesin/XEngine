"use strict";
var XEngine;
(function (XEngine) {
    var AudioLoader = (function () {
        function AudioLoader(audioName, audioUrl, loader) {
            this.audioName = audioName;
            this.audioUrl = audioUrl;
            this.completed = false;
            this.loader = loader;
        }
        AudioLoader.prototype.load = function () {
            var _this = this;
            var newAudio = {
                audioName: _this.audioName,
                audio: null,
                decoded: false,
            };
            var request = new XMLHttpRequest();
            request.open("GET", _this.audioUrl, true);
            request.responseType = "arraybuffer";
            var handler = function () {
                var audioRef = _this.loader.game.cache.audios[_this.audioName];
                if (request.status === 200) {
                    _this.loader.game.audioContext.decodeAudioData(request.response, function (buffer) {
                        audioRef.audio = buffer;
                        audioRef.decoded = true;
                        _this.completed = true;
                        _this.loader._notifyCompleted();
                    }, function () {
                        _this.completed = true;
                        _this.loader._notifyCompleted();
                    });
                }
                else {
                    _this.completed = true;
                    _this.loader._notifyCompleted();
                }
            };
            request.onload = handler;
            _this.loader.game.cache.audios[_this.audioName] = newAudio;
            request.send();
        };
        return AudioLoader;
    }());
    XEngine.AudioLoader = AudioLoader;
})(XEngine || (XEngine = {}));
