"use strict";
Array.prototype.removePending = function () {
    var i = this.length;
    while (i--) {
        if (this[i].isPendingDestroy) {
            if (this[i].body !== undefined) {
                this[i].body.destroy();
            }
            delete this[i];
            this.splice(i, 1);
        }
    }
};
var XEngine;
(function (XEngine) {
    XEngine.version = "2.0";
    var Game = (function () {
        function Game(width, height, idContainer) {
            this.canvas = document.getElementById(idContainer);
            if (!this.canvas) {
                this.canvas = document.body.appendChild(document.createElement("canvas"));
                this.canvas.id = idContainer;
            }
            this.position = new XEngine.Vector(0);
            this.width = width;
            this.height = height;
            this.worldWidth = width;
            this.worldHeight = height;
            this.canvas.setAttribute("widht", width.toString());
            this.canvas.setAttribute("height", height.toString());
            this.audioContext = new AudioContext();
            this.frameLimit = 30;
            this._startTime = 0;
            this._elapsedTime = 0;
            this.frameTime = 0;
            this.previousFrameTime = 0;
            this.deltaTime = 0;
            this.deltaMillis = 0;
            this.pause = false;
            this.isMobile = false;
            this.ISO_TILE_WIDTH = 32;
            this.ISO_TILE_HEIGHT = 32;
            this.init();
        }
        Game.prototype.setBackgroundColor = function (r, g, b, a) {
            this.renderer.setClearColor(r / 255, g / 255, b / 255, a / 255);
        };
        Game.prototype.update = function () {
            var _this = this;
            if (window.requestAnimationFrame) {
                window.requestAnimationFrame(function () { _this.update(); });
            }
            else {
                clearTimeout(this.timer);
                this.timer = setTimeout(function () { _this.update(); }, this.frameLimit / 1);
            }
            this.elapsedTime = Date.now() - this._startTime;
            this.frameTime = this.elapsedTime;
            this.deltaMillis = Math.min(400, (this.frameTime - this.previousFrameTime));
            this.deltaTime = this.deltaMillis / 1000;
            if (1 / this.frameLimit > this.deltaTime) {
                return;
            }
            this.previousFrameTime = this.frameTime;
            if (this.pause) {
                return;
            }
            if (this.state.currentState == null) {
                return;
            }
            if (!this.load.preloading) {
                this.updateQueue.removePending();
                for (var i = this.updateQueue.length - 1; i >= 0; i--) {
                    var gameObject = this.updateQueue[i];
                    if (gameObject.alive) {
                        gameObject.update(this.deltaTime);
                        if (XEngine.Sprite.prototype.isPrototypeOf(gameObject)) {
                            gameObject._updateAnims(this.deltaMillis);
                        }
                    }
                }
                this.state.currentState.update(this.deltaTime);
                this.camera.update();
                this.renderQueue.removePending();
                this.renderer.render();
            }
        };
        Game.prototype.destroy = function () {
            for (var i = this.updateQueue.length - 1; i >= 0; i--) {
                var gameObject = this.updateQueue[i];
                if (!gameObject.persist) {
                    gameObject.destroy();
                    if (gameObject.body !== undefined) {
                        gameObject.body.destroy();
                    }
                    this.updateQueue.splice(i, 1);
                }
                var renderIndex = this.renderQueue.indexOf(gameObject);
                if (renderIndex !== -1) {
                    this.renderQueue.splice(renderIndex, 1);
                }
            }
            for (var i = this.renderQueue.length - 1; i >= 0; i--) {
                var gameObject = this.renderQueue[i];
                if (!gameObject.persist) {
                    gameObject.destroy();
                    if (gameObject.body !== undefined) {
                        gameObject.body.destroy();
                    }
                    this.renderQueue.splice(i, 1);
                }
            }
            delete this.camera;
            this.camera = new XEngine.Camera(this);
        };
        Game.prototype.getWorldPos = function () {
            return this.position;
        };
        Game.prototype.getWorldMatrix = function (childMatrix) {
            mat4.identity(childMatrix);
        };
        Game.prototype.getTotalRotation = function () {
            return 0;
        };
        Game.prototype.init = function () {
            this._startTime = Date.now();
            this._elapsedTime = 0;
            this.frameTime = 0;
            this.previousFrameTime = 0;
            this.deltaTime = 0;
            this.deltaMillis = 0;
            this.updateQueue = new Array();
            this.renderQueue = new Array();
            this.pause = false;
            this.state = new XEngine.StateManager(this);
            this.add = new XEngine.ObjectFactory(this);
            this.cache = new XEngine.Cache(this);
            this.load = new XEngine.Loader(this);
            this.camera = new XEngine.Camera(this);
            this.renderer = new XEngine.Renderer(this, this.canvas);
            this.context = this.renderer.context;
            this.scale = new XEngine.ScaleManager(this);
            this.scale.init();
            this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            console.log("Game engine " + XEngine.version + " arrancado con webgl!!!");
            this.update();
        };
        return Game;
    }());
    XEngine.Game = Game;
})(XEngine || (XEngine = {}));
