"use strict";
var XEngine;
(function (XEngine) {
    var Cache = (function () {
        function Cache(game) {
            this.game = game;
            this.images = new Array();
            this.audios = new Array();
            this.json = new Array();
        }
        Cache.prototype.image = function (imageName) {
            if (this.images[imageName] === undefined) {
                console.error("No hay imagen para el nombre: " + imageName);
            }
            else {
                return this.images[imageName];
            }
        };
        Cache.prototype.audio = function (audioName) {
            if (this.audios[audioName] === undefined) {
                console.error("No hay audio para el nombre: " + audioName);
            }
            else {
                return this.audios[audioName];
            }
        };
        Cache.prototype.getJson = function (jsonName) {
            return this.json[jsonName];
        };
        Cache.prototype.clearCache = function () {
            delete this.images;
            delete this.audios;
            delete this.json;
            this.images = new Array();
            this.audios = new Array();
            this.json = new Array();
        };
        return Cache;
    }());
    XEngine.Cache = Cache;
})(XEngine || (XEngine = {}));
