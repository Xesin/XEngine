"use strict";
var XEngine;
(function (XEngine) {
    var ImageLoader = (function () {
        function ImageLoader(imageName, imageUrl, loader, frameWidth, frameHeight) {
            if (frameWidth === void 0) { frameWidth = 0; }
            if (frameHeight === void 0) { frameHeight = 0; }
            this.imageName = imageName;
            this.imageUrl = imageUrl;
            this.completed = false;
            this.loader = loader;
            this.frameWidth = frameWidth;
            this.frameHeight = frameHeight;
        }
        ImageLoader.prototype.load = function () {
            var _this = this;
            var newImage = new XEngine.Texture2D(_this.imageName, _this.frameWidth, _this.frameHeight, 1);
            var img1 = new Image();
            var handler = function () {
                var imageRef = _this.loader.game.cache.images[_this.imageName];
                imageRef.image = this;
                _this.completed = true;
                if (_this.frameWidth === 0) {
                    imageRef.frameWidth = this.width;
                    newImage.wrapMode = XEngine.WRAP_MODE.CLAMP;
                }
                else {
                    imageRef.frameWidth = _this.frameWidth;
                }
                if (_this.frameHeight === 0) {
                    imageRef.frameHeight = this.height;
                    newImage.wrapMode = XEngine.WRAP_MODE.CLAMP;
                }
                else {
                    imageRef.frameHeight = _this.frameHeight;
                }
                imageRef.createTexture(_this.loader.game.context);
                _this.loader._notifyCompleted();
            };
            img1.onload = handler;
            img1.onerror = handler;
            img1.src = _this.imageUrl;
            _this.loader.game.cache.images[newImage.imageName] = newImage;
        };
        return ImageLoader;
    }());
    XEngine.ImageLoader = ImageLoader;
})(XEngine || (XEngine = {}));
