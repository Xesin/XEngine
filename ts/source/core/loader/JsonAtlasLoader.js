"use strict";
var XEngine;
(function (XEngine) {
    var JsonImageLoader = (function () {
        function JsonImageLoader(imageName, imageUrl, jsonUrl, loader) {
            this.imageName = imageName;
            this.imageUrl = imageUrl;
            this.jsonUrl = jsonUrl;
            this.completed = false;
            this.loader = loader;
            this.frameWidth = 0;
            this.frameHeight = 0;
            this.oneCompleted = false;
            this.loader.image(this.imageName, this.imageUrl);
        }
        JsonImageLoader.prototype.load = function () {
            this.loadJson();
        };
        JsonImageLoader.prototype.loadJson = function () {
            var _this = this;
            var request = new XMLHttpRequest();
            request.open("GET", _this.jsonUrl, true);
            var handler = function () {
                if (request.status === 200) {
                    var returnedJson = JSON.parse(request.responseText);
                    var newJson = returnedJson;
                    for (var i = 0; i < newJson.frames.length; i++) {
                        var frame = newJson.frames[i];
                        newJson[frame.filename] = frame;
                    }
                    _this.loader.game.cache.json[_this.imageName] = newJson;
                }
                _this.completed = true;
                _this.loader._notifyCompleted();
            };
            request.onload = handler;
            request.send();
        };
        return JsonImageLoader;
    }());
    XEngine.JsonImageLoader = JsonImageLoader;
})(XEngine || (XEngine = {}));
