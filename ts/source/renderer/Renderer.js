"use strict";
var XEngine;
(function (XEngine) {
    var Renderer = (function () {
        function Renderer(game, canvas) {
            this.game = game;
            this.clearColor = { r: 0.0, g: 0.0, b: 0.0, a: 0.0 };
            this.scale = new XEngine.Vector(1);
            var options = { stencil: true, antialias: false };
            this.context = canvas.getContext("webgl2", options);
            if (!this.context) {
                alert("Imposible inicializar WebGL. Tu navegador puede no soportarlo.");
                this.context = null;
            }
            else {
                this.context.clearColor(this.clearColor.r, this.clearColor.g, this.clearColor.b, this.clearColor.a);
                this.context.clear(this.context.COLOR_BUFFER_BIT);
                this.context.blendFunc(this.context.ONE, this.context.ONE_MINUS_SRC_ALPHA);
                this.context.disable(this.context.DEPTH_TEST);
                this.context.enable(this.context.BLEND);
                this.context.viewport(0, 0, Number(this.game.canvas.getAttribute("width")), Number(this.game.canvas.getAttribute("height")));
                this.resourceManager = new XEngine.ResourceManager(this.context);
                this.spriteBatch = new XEngine.SpriteBatcher.SpriteBatch(this.game, this.context, this);
                this.renderer = null;
                this.sprite = undefined;
            }
        }
        Renderer.prototype.render = function () {
            this.context.clear(this.context.COLOR_BUFFER_BIT | this.context.DEPTH_BUFFER_BIT);
            this.context.viewport(0, 0, this.game.canvas.width, this.game.canvas.height);
            this.renderLoop(this.game.renderQueue);
            if (this.renderer) {
                this.renderer.flush();
                this.renderer = null;
                this.sprite = null;
            }
        };
        Renderer.prototype.setRenderer = function (renderer, sprite) {
            if (this.renderer !== renderer || this.sprite !== sprite) {
                if (this.renderer) {
                    this.renderer.flush();
                }
            }
            if (renderer && renderer.shouldFlush()) {
                renderer.flush();
            }
            this.renderer = renderer;
            this.sprite = sprite;
        };
        Renderer.prototype.setClearColor = function (r, g, b, a) {
            this.clearColor.r = r;
            this.clearColor.g = g;
            this.clearColor.b = b;
            this.clearColor.a = a;
            this.context.clearColor(this.clearColor.r, this.clearColor.g, this.clearColor.b, this.clearColor.a);
        };
        Renderer.prototype.renderLoop = function (arrayObjects) {
            var _this = this;
            for (var i = 0; i < arrayObjects.length; i++) {
                var object = arrayObjects[i];
                if (!object.render) {
                    continue;
                }
                if (XEngine.Group.prototype.isPrototypeOf(object)) {
                    object._beginRender(_this.context);
                    _this.renderLoop(object.children);
                    object._endRender(_this.context);
                }
                else if (!XEngine.Audio.prototype.isPrototypeOf(object)) {
                    if (!object.alive) {
                        continue;
                    }
                    if (this.game.autoCulling && !object.isInsideCamera()) {
                        continue;
                    }
                    object._beginRender(_this.context);
                    object._renderToCanvas(_this.context);
                    if (object.body !== undefined) {
                        object.body._renderBounds(_this.context);
                    }
                    object._endRender(_this.context);
                }
            }
        };
        Renderer.prototype.setScale = function (x, y) {
            this.scale.x = x;
            this.scale.y = y || x;
        };
        return Renderer;
    }());
    XEngine.Renderer = Renderer;
})(XEngine || (XEngine = {}));
