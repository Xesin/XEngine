"use strict";
var XEngine;
(function (XEngine) {
    class GameObject {
        constructor(game, posX = 0, posY = 0) {
            this.game = game;
            this.parent = game;
            this.isPendingDestroy = false;
            this.alive = true;
            this.alpha = 1.0;
            this.scale = new XEngine.Vector(1, 1);
            this.anchor = new XEngine.Vector(0, 0);
            this.rotation = 0;
            this.position = new XEngine.Vector(posX, posY);
            this.onClick = new XEngine.Signal();
            this.onInputDown = new XEngine.Signal();
            this.onInputUp = new XEngine.Signal();
            this.onInputOver = new XEngine.Signal();
            this.onInputLeft = new XEngine.Signal();
            this.inputEnabled = false;
            this.render = true;
            this.fixedToCamera = false;
            this.isometric = false;
            this.isInputDown = false;
            this.width = 0;
            this.height = 0;
            this._prevWidth = 0;
            this._prevHeight = 0;
            this._prevPos = { x: 0, y: 0 };
            this.shader = null;
            this._vertDataBuffer = new XEngine.DataBuffer32(24 * 4);
            this._uv = [
                0.0, 0.0,
                0.0, 1.0,
                1.0, 0.0,
                1.0, 1.0,
            ];
            this.gl = this.game.context;
            let gl = this.gl;
            let indexDataBuffer = new XEngine.DataBuffer16(2 * 6);
            this.vertexBuffer = this.game.renderer.resourceManager.createBuffer(gl.ARRAY_BUFFER, this._vertDataBuffer.getByteCapacity(), gl.STREAM_DRAW);
            this.indexBuffer = this.game.renderer.resourceManager.createBuffer(gl.ELEMENT_ARRAY_BUFFER, this._vertDataBuffer.getByteCapacity(), gl.STATIC_DRAW);
            let indexBuffer = indexDataBuffer.uintView;
            for (let indexA = 0, indexB = 0; indexA < 6; indexA += 6, indexB += 4) {
                indexBuffer[indexA + 0] = indexB + 0;
                indexBuffer[indexA + 1] = indexB + 1;
                indexBuffer[indexA + 2] = indexB + 2;
                indexBuffer[indexA + 3] = indexB + 1;
                indexBuffer[indexA + 4] = indexB + 3;
                indexBuffer[indexA + 5] = indexB + 2;
            }
            this.indexBuffer.updateResource(indexBuffer, 0);
            this.mask = null;
            this.mvMatrix = mat4.create();
            mat4.identity(this.mvMatrix);
            this.pickeable = false;
            this.downPos = new XEngine.Vector(0, 0);
            this.posWhenDown = new XEngine.Vector(0, 0);
            this.color = (0xffffff >> 16) + (0xffffff & 0xff00) + ((0xffffff & 0xff) << 16);
        }
        destroy() {
            this.kill();
            this.isPendingDestroy = true;
            if (this.onDestroy !== undefined) {
                this.onDestroy();
            }
        }
        onDestroy() { return; }
        _onInitialize() {
            if (this.shader) {
                if (!this.shader.compiled) {
                    this.shader.initializeShader(this.gl);
                }
                this._setBuffers();
            }
        }
        setColor(value, a = 1.0) {
            this.color = value;
            this.alpha = a;
            this._setVertices(this.width, this.height, this.color, this._uv);
        }
        kill() {
            this.alive = false;
        }
        restore(posX, posY) {
            this.position.x = posX;
            this.position.y = posY;
            this.alive = true;
        }
        getWorldMatrix(childMatrix) {
            this.parent.getWorldMatrix(childMatrix);
            let translation = [this.position.x, this.position.y, 0.0];
            let posX = Math.round(-(this.width * this.anchor.x));
            let posY = Math.round(-(this.height * this.anchor.y));
            if (this.fixedToCamera) {
                translation[0] += this.game.camera.position.x;
                translation[1] += this.game.camera.position.y;
            }
            mat4.translate(childMatrix, childMatrix, translation);
            mat4.rotateZ(childMatrix, childMatrix, this.rotation * XEngine.Mathf.TO_RADIANS);
            mat4.scale(childMatrix, childMatrix, [this.scale.x, this.scale.y, 1.0]);
            mat4.translate(childMatrix, childMatrix, [posX, posY, 0.0]);
            return childMatrix;
        }
        getWorldPos() {
            let parentPos = this.parent.getWorldPos();
            let x = this.position.x + parentPos.x;
            let y = this.position.y + parentPos.y;
            return new XEngine.Vector(x, y);
        }
        _beginRender(context) {
            if (this.shader) {
                this.shader._beginRender(context);
            }
            this.game.renderer.setRenderer(null, null);
        }
        _renderToCanvas(context) {
            this.shader.baseUniforms.pMatrix.value = this.game.camera.pMatrix;
            this.shader.updateUniforms(context);
            if (this._prevHeight !== this.height ||
                this._prevWidth !== this.width ||
                this._prevPos.x !== this.position.x ||
                this._prevPos.y !== this.position.y) {
                this._setVertices(this.width, this.height, this.color, this._uv);
                this._prevHeight = this.height;
                this._prevWidth = this.width;
                this._prevPos.x = this.position.x;
                this._prevPos.y = this.position.y;
            }
            this.vertexBuffer.bind();
            this.indexBuffer.bind();
            context.drawElements(context.TRIANGLES, 6, context.UNSIGNED_SHORT, 0);
        }
        rendermask(gl) {
            gl.colorMask(false, false, false, false);
            gl.stencilFunc(gl.ALWAYS, 1, 1);
            gl.stencilOp(gl.REPLACE, gl.REPLACE, gl.REPLACE);
            gl.enable(gl.STENCIL_TEST);
            if (this.sprite) {
                let cache_image = this.game.cache.image(this.sprite);
                this.shader._setTexture(cache_image._texture);
            }
            this.shader._beginRender(gl);
            this.shader.baseUniforms.pMatrix.value = this.game.camera.pMatrix;
            this.shader.updateUniforms(gl);
            this._setVertices(this.width, this.height, this.color, this._uv);
            this.vertexBuffer.bind();
            this.indexBuffer.bind();
            gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
            gl.stencilFunc(gl.EQUAL, 1, 1);
            gl.stencilOp(gl.ZERO, gl.ZERO, gl.ZERO);
            gl.colorMask(true, true, true, true);
        }
        endRendermask(gl) {
            gl.disable(gl.STENCIL_TEST);
            gl.clear(gl.STENCIL_BUFFER_BIT);
        }
        _endRender(gl) {
            if (this.mask != null) {
                return;
            }
        }
        getBounds() {
            let width = this.width * this.scale.x;
            let height = this.height * this.scale.y;
            let worldPos = this.getWorldPos();
            let widthAnchor = width * this.anchor.x;
            let heightAnchor = height * this.anchor.y;
            let minX = worldPos.x - widthAnchor;
            let maxX = worldPos.x + width - widthAnchor;
            let minY = worldPos.y - heightAnchor;
            let maxY = worldPos.y + height - heightAnchor;
            return {
                width: width,
                height: height,
                minX: minX,
                maxX: maxX,
                minY: minY,
                maxY: maxY,
            };
        }
        isInsideCamera() {
            let bounds = this.getBounds();
            let worldPos = this.getWorldPos();
            let cameraPos = this.game.camera.position;
            let viewRect = { width: this.game.width, height: this.game.height };
            if (bounds.maxX < cameraPos.x) {
                return false;
            }
            if (bounds.maxY < cameraPos.y) {
                return false;
            }
            if (bounds.minX > cameraPos.x + viewRect.width) {
                return false;
            }
            if (bounds.minY > cameraPos.y + viewRect.height) {
                return false;
            }
            return true;
        }
        start() { return; }
        update(deltaTime) { return; }
        _setBuffers() {
            let context = this.gl;
            this.shader.bind(context);
            this.vertexBuffer.addAttribute(this.shader.vertPosAtt, 2, context.FLOAT, false, 24, 0);
            this.vertexBuffer.addAttribute(this.shader.vertUvAtt, 2, context.FLOAT, false, 24, 8);
            this.vertexBuffer.addAttribute(this.shader.vertColAtt, 3, context.UNSIGNED_BYTE, true, 24, 16);
            this.vertexBuffer.addAttribute(this.shader.vertAlphaAtt, 1, context.FLOAT, false, 24, 20);
        }
        _setVertices(width, height, color, uv) {
            let floatBuffer = this._vertDataBuffer.floatView;
            let uintBuffer = this._vertDataBuffer.uintView;
            let index = 0;
            let pos = new XEngine.Vector(0, 0);
            this.getWorldMatrix(this.mvMatrix);
            pos = pos.multiplyMatrix(this.mvMatrix);
            floatBuffer[index++] = pos.x;
            floatBuffer[index++] = pos.y;
            floatBuffer[index++] = uv[0];
            floatBuffer[index++] = uv[1];
            uintBuffer[index++] = color;
            floatBuffer[index++] = this.alpha;
            pos.setTo(0, this.height);
            pos = pos.multiplyMatrix(this.mvMatrix);
            floatBuffer[index++] = pos.x;
            floatBuffer[index++] = pos.y;
            floatBuffer[index++] = uv[2];
            floatBuffer[index++] = uv[3];
            uintBuffer[index++] = color;
            floatBuffer[index++] = this.alpha;
            pos.setTo(this.width, 0);
            pos = pos.multiplyMatrix(this.mvMatrix);
            floatBuffer[index++] = pos.x;
            floatBuffer[index++] = pos.y;
            floatBuffer[index++] = uv[4];
            floatBuffer[index++] = uv[5];
            uintBuffer[index++] = color;
            floatBuffer[index++] = this.alpha;
            pos.setTo(this.width, this.height);
            pos = pos.multiplyMatrix(this.mvMatrix);
            floatBuffer[index++] = pos.x;
            floatBuffer[index++] = pos.y;
            floatBuffer[index++] = uv[6];
            floatBuffer[index++] = uv[7];
            uintBuffer[index++] = color;
            floatBuffer[index++] = this.alpha;
            this.vertexBuffer.updateResource(floatBuffer, 0);
        }
    }
    XEngine.GameObject = GameObject;
})(XEngine || (XEngine = {}));
var XEngine;
(function (XEngine) {
    class Audio extends XEngine.GameObject {
        constructor(game, audioName, autoStart, volume) {
            super(game, 0, 0);
            this.isLoop = false;
            this.audio = this.game.cache.audio(audioName).audio;
            this.persist = false;
            this.volume = volume || 1;
            this.onComplete = new XEngine.Signal();
            this.completed = false;
            if (autoStart) {
                this.play(0);
            }
        }
        update() {
            if (this.gainNode != null) {
                this.gainNode.gain.value = this.volume;
            }
        }
        play(time) {
            this.source = this.game.audioContext.createBufferSource();
            this.source.buffer = this.audio;
            this.source.connect(this.game.audioContext.destination);
            this.source.onended = () => {
                this._complete();
            };
            this.gainNode = this.game.audioContext.createGain();
            this.source.connect(this.gainNode);
            this.gainNode.connect(this.game.audioContext.destination);
            this.gainNode.gain.value = this.volume;
            this.source.loop = this.isLoop;
            this.source.start(time || 0);
        }
        stop(time = 0) {
            if (this.source) {
                this.source.stop(time || 0);
            }
        }
        loop(value) {
            this.isLoop = value;
        }
        destroy() {
            super.destroy();
            if (this.onComplete) {
                this.onComplete._destroy();
                delete this.onComplete;
            }
        }
        kill() {
            this.alive = false;
            this.stop();
        }
        _complete() {
            this.stop();
            if (this.onComplete) {
                this.onComplete.dispatch();
            }
        }
    }
    XEngine.Audio = Audio;
})(XEngine || (XEngine = {}));
var XEngine;
(function (XEngine) {
    class ObjectFactory {
        constructor(game) {
            this.game = game;
        }
        existing(gameObject, update = true, render = false) {
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
        }
        sprite(posX, posY, sprite, frame) {
            let gameObject = new XEngine.Sprite(this.game, posX, posY, sprite, frame);
            return this.existing(gameObject, true, true);
        }
        image(posX, posY, sprite, frame) {
            let gameObject = new XEngine.Sprite(this.game, posX, posY, sprite, frame);
            return this.existing(gameObject, false, true);
        }
        audio(audio, autoStart, volume) {
            let audioObject = new XEngine.Audio(this.game, audio, autoStart, volume);
            return this.existing(audioObject, true, false);
        }
        group(posX, posY) {
            let x = posX || 0;
            let y = posY || 0;
            let gameObject = new XEngine.Group(this.game, x, y);
            return this.existing(gameObject, true, true);
        }
    }
    XEngine.ObjectFactory = ObjectFactory;
})(XEngine || (XEngine = {}));
var XEngine;
(function (XEngine) {
    class Group extends XEngine.GameObject {
        constructor(game, posX, posY) {
            super(game, posX, posY);
            this.children = new Array();
        }
        _beginRender(gl) {
            return;
        }
        update(deltaTime) {
            this.children.removePending();
            for (let i = this.children.length - 1; i >= 0; i--) {
                let gameObject = this.children[i];
                if (gameObject.alive) {
                    gameObject.update(deltaTime);
                    if (XEngine.Sprite.prototype.isPrototypeOf(gameObject)) {
                        gameObject._updateAnims(this.game.deltaMillis);
                    }
                }
            }
        }
        getFirstDead() {
            for (let i = this.children.length - 1; i >= 0; i--) {
                let gameObject = this.children[i];
                if (!gameObject.alive) {
                    return gameObject;
                }
            }
            return null;
        }
        getChildAtIndex(index) {
            return this.children[index];
        }
        childCount() {
            return this.children.length;
        }
        destroy() {
            this.kill();
            this.isPendingDestroy = true;
            for (let i = this.children.length - 1; i >= 0; i--) {
                let gameObject = this.children[i];
                if (gameObject.destroy !== undefined) {
                    gameObject.destroy();
                    delete this.children[i];
                }
            }
            this.children = [];
            if (this.onDestroy !== undefined) {
                this.onDestroy();
            }
        }
        add(gameObject) {
            if (this.game.updateQueue.indexOf(gameObject) >= 0) {
                let index = this.game.updateQueue.indexOf(gameObject);
                this.game.updateQueue.splice(index, 1);
            }
            if (this.game.renderQueue.indexOf(gameObject) >= 0) {
                let index = this.game.renderQueue.indexOf(gameObject);
                this.game.renderQueue.splice(index, 1);
            }
            if (gameObject.parent.constructor === XEngine.Group && gameObject.parent.indexOf(gameObject) >= 0) {
                let index = gameObject.parent.children.indexOf(gameObject);
                gameObject.parent.children.splice(index, 1);
            }
            this.children.push(gameObject);
            if (gameObject.start !== undefined) {
                gameObject.start();
            }
            gameObject.parent = this;
            return gameObject;
        }
        setAll(property, value) {
            for (let i = this.children.length - 1; i >= 0; i--) {
                this.children[i][property] = value;
            }
        }
        callAll(funct) {
            for (let i = this.children.length - 1; i >= 0; i--) {
                if (this.children[i][funct] !== undefined) {
                    this.children[i][funct]();
                }
            }
        }
    }
    XEngine.Group = Group;
})(XEngine || (XEngine = {}));
var XEngine;
(function (XEngine) {
    class Sprite extends XEngine.GameObject {
        constructor(game, posX, posY, sprite, frame) {
            super(game, posX, posY);
            this.sprite = sprite;
            this.game = game;
            this.frame = frame || 0;
            let cache_image = this.game.cache.image(sprite);
            this.width = cache_image.frameWidth || 10;
            this.height = cache_image.frameHeight || 10;
            this.columns = Math.floor(cache_image.image.width / this.width);
            this.rows = Math.floor(cache_image.image.height / this.height);
            this.tilled = false;
            if (this.game.cache.getJson(sprite) !== undefined) {
                this.json = this.game.cache.getJson(sprite);
                let frameInfo;
                if (typeof this.frame === "string") {
                    frameInfo = this.json[this.frame];
                }
                else {
                    frameInfo = this.json.frames[this.frame];
                }
                this.width = frameInfo.frame.w;
                this.height = frameInfo.frame.h;
            }
            if (this.columns > 1 || this.rows > 1 || this.json !== undefined) {
                this.tilled = true;
            }
            this.position.setTo(posX, posY);
            this.shader = this.game.renderer.spriteBatch.shader;
        }
        _beginRender(gl) {
            return;
        }
        _renderToCanvas(gl) {
            if (this.tilled) {
                let startX = 0;
                let startY = 0;
                let endX = 0;
                let endY = 0;
                let cache_image = this.game.cache.image(this.sprite);
                if (this.json) {
                    let frameInfo;
                    if (typeof this.frame === "string") {
                        frameInfo = this.json[this.frame];
                    }
                    else {
                        frameInfo = this.json.frames[this.frame];
                    }
                    let width = frameInfo.frame.w;
                    let height = frameInfo.frame.h;
                    startX = frameInfo.frame.x;
                    startY = frameInfo.frame.y;
                    endX = startX + width;
                    endY = startY + height;
                }
                else {
                    let column = this.frame;
                    if (column > this.columns - 1) {
                        column = this.frame % this.columns;
                    }
                    let row = Math.floor(this.frame / this.columns);
                    startX = column * cache_image.frameWidth;
                    startY = row * cache_image.frameHeight;
                    endX = startX + cache_image.frameWidth;
                    endY = startY + cache_image.frameHeight;
                }
                let startUvX = startX / cache_image.image.width;
                let startUvY = startY / cache_image.image.height;
                let endUvX = endX / cache_image.image.width;
                let endUvY = endY / cache_image.image.height;
                this._uv = [
                    startUvX, startUvY,
                    startUvX, endUvY,
                    endUvX, startUvY,
                    endUvX, endUvY,
                ];
            }
            this.game.renderer.spriteBatch.addSprite(this, this.shader);
        }
        reset(x, y) {
            this.position.x = x;
            this.position.y = y;
            this.alive = true;
            if (this.start !== undefined) {
                this.start();
            }
            if (this.body) {
                this.body.velocity = new XEngine.Vector(0, 0);
            }
        }
        _updateAnims(deltaMillis) {
            this.animation._update(deltaMillis);
        }
    }
    XEngine.Sprite = Sprite;
})(XEngine || (XEngine = {}));
var XEngine;
(function (XEngine) {
    let AXIS;
    (function (AXIS) {
        AXIS["NONE"] = "none";
        AXIS["HORIZONTAL"] = "horizontal";
        AXIS["VERTICAL"] = "vertical";
        AXIS["BOTH"] = "both";
    })(AXIS = XEngine.AXIS || (XEngine.AXIS = {}));
    class Camera {
        constructor(game) {
            this.game = game;
            this.position = new XEngine.Vector(0, 0);
            this.followedObject = null;
            this.axis = XEngine.AXIS.BOTH;
            this.pMatrix = mat4.create();
        }
        followObject(gameObject, offsetLeft, offsetUp) {
            this.follow = true;
            this.offsetLeft = offsetLeft || 0;
            this.offsetUp = offsetUp || 0;
            this.followedObject = gameObject;
        }
        update() {
            if (this.followedObject != null) {
                if (this.axis === XEngine.AXIS.BOTH || this.axis === XEngine.AXIS.HORIZONTAL) {
                    if ((this.followedObject.position.x - this.offsetLeft) - this.game.width / 2 > 0 &&
                        (this.followedObject.position.x + this.offsetLeft) + this.game.width / 2 < this.game.worldWidth) {
                        this.position.x = this.followedObject.position.x - this.game.width / 2 - this.offsetLeft;
                    }
                }
                if (this.axis === XEngine.AXIS.BOTH || this.axis === XEngine.AXIS.VERTICAL) {
                    if ((this.followedObject.position.y - this.offsetUp) - this.game.height / 2 > 0 &&
                        (this.followedObject.position.y + this.offsetUp) + this.game.height / 2 < this.game.worldHeight) {
                        this.position.y = this.followedObject.position.y - this.game.height / 2 - this.offsetUp;
                    }
                }
            }
            let right = this.game.width + this.position.x;
            let up = this.game.height + this.position.y;
            mat4.ortho(this.pMatrix, this.position.x, right, up, this.position.y, 0.1, 100);
        }
    }
    XEngine.Camera = Camera;
})(XEngine || (XEngine = {}));
Array.prototype.removePending = function () {
    let i = this.length;
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
    class Game {
        constructor(width, height, idContainer) {
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
        setBackgroundColor(r, g, b, a) {
            this.renderer.setClearColor(r / 255, g / 255, b / 255, a / 255);
        }
        update() {
            if (window.requestAnimationFrame) {
                window.requestAnimationFrame(() => { this.update(); });
            }
            else {
                clearTimeout(this.timer);
                this.timer = setTimeout(() => { this.update(); }, this.frameLimit / 1);
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
                for (let i = this.updateQueue.length - 1; i >= 0; i--) {
                    let gameObject = this.updateQueue[i];
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
        }
        destroy() {
            for (let i = this.updateQueue.length - 1; i >= 0; i--) {
                let gameObject = this.updateQueue[i];
                if (!gameObject.persist) {
                    gameObject.destroy();
                    if (gameObject.body !== undefined) {
                        gameObject.body.destroy();
                    }
                    this.updateQueue.splice(i, 1);
                }
                let renderIndex = this.renderQueue.indexOf(gameObject);
                if (renderIndex !== -1) {
                    this.renderQueue.splice(renderIndex, 1);
                }
            }
            for (let i = this.renderQueue.length - 1; i >= 0; i--) {
                let gameObject = this.renderQueue[i];
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
        }
        getWorldPos() {
            return this.position;
        }
        getWorldMatrix(childMatrix) {
            mat4.identity(childMatrix);
        }
        getTotalRotation() {
            return 0;
        }
        init() {
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
        }
    }
    XEngine.Game = Game;
})(XEngine || (XEngine = {}));
var XEngine;
(function (XEngine) {
    class Mathf {
        static randomRange(min, max) {
            return min + (Math.random() * (max - min));
        }
        static randomIntRange(min, max) {
            return Math.round(min + Math.random() * (max - min));
        }
        static clamp(number, min, max) {
            return Math.max(Math.min(number, max), min);
        }
        static lerp(a, b, t) {
            t = XEngine.Mathf.clamp(t, 0, 1);
            return (1 - t) * a + t * b;
        }
        static lerpColor(a, b, amount) {
            let ah = parseInt(a.replace(/#/g, ""), 16), ar = ah >> 16, ag = ah >> 8 & 0xff, ab = ah & 0xff, bh = parseInt(b.replace(/#/g, ""), 16), br = bh >> 16, bg = bh >> 8 & 0xff, bb = bh & 0xff, rr = ar + amount * (br - ar), rg = ag + amount * (bg - ag), rb = ab + amount * (bb - ab);
            return "#" + ((1 << 24) + (rr << 16) + (rg << 8) + rb | 0).toString(16).slice(1);
        }
        static angleBetween(originX, originY, targetX, targetY) {
            let x = targetX - originX;
            let y = targetY - originY;
            return (Math.atan2(y, x));
        }
    }
    Mathf.TO_RADIANS = 0.0174532925199432957;
    Mathf.TO_DEGREES = 57.2957795130823208767;
    XEngine.Mathf = Mathf;
    class Vector {
        constructor(x, y = x, z = 1.0) {
            this.zOffset = 0;
            this.x = x;
            this.y = y;
            this.z = z;
            this.zOffset = 0;
        }
        setTo(x, y = x) {
            this.x = x;
            this.y = y;
        }
        sub(vector) {
            this.x -= vector.x;
            this.y -= vector.y;
            this.z -= vector.z;
            return this;
        }
        add(vector) {
            this.x += vector.x;
            this.y += vector.y;
            this.z += vector.z;
            return this;
        }
        multiply(vector) {
            this.x *= vector.x;
            this.y *= vector.y;
            return this;
        }
        multiplyMatrix(matrix) {
            let x = this.x, y = this.y;
            let out = new Array(3);
            this.x = x * matrix[0] + y * matrix[4] + matrix[8] + matrix[12];
            this.y = x * matrix[1] + y * matrix[5] + matrix[9] + matrix[13];
            return this;
        }
        rotate(angle) {
            let x = this.x;
            let y = this.y;
            this.x = x * Math.cos(angle) - y * Math.sin(angle);
            this.y = x * Math.sin(angle) + y * Math.cos(angle);
            return this;
        }
        normalize() {
            let d = this.length();
            if (d > 0) {
                this.x = this.x / d;
                this.y = this.y / d;
            }
            return this;
        }
        project(vector) {
            let amt = this.dot(vector) / vector.len2();
            this.x = amt * vector.x;
            this.y = amt * vector.y;
            return this;
        }
        scale(x, y = x) {
            this.x *= x;
            this.y *= y;
            return this;
        }
        reflect(axis) {
            let x = this.x;
            let y = this.y;
            this.project(axis).scale(2);
            this.x -= x;
            this.y -= y;
            return this;
        }
        distance(vector) {
            let tmp = new XEngine.Vector(this.x, this.y, this.z);
            tmp.sub(vector);
            return tmp.length();
        }
        len2() {
            return this.dot(this);
        }
        length() {
            return Math.sqrt(this.len2());
        }
        dot(vec) {
            return this.x * vec.x + this.y * vec.y;
        }
    }
    Vector.Zero = new Vector(0);
    XEngine.Vector = Vector;
})(XEngine || (XEngine = {}));
var XEngine;
(function (XEngine) {
    let Scale;
    (function (Scale) {
        Scale[Scale["FIT"] = 0] = "FIT";
        Scale[Scale["SHOW_ALL"] = 1] = "SHOW_ALL";
        Scale[Scale["NO_SCALE"] = 2] = "NO_SCALE";
    })(Scale = XEngine.Scale || (XEngine.Scale = {}));
    class ScaleManager {
        constructor(game) {
            this.game = game;
            this.scaleType = Scale.NO_SCALE;
            this.orientation = "landScape";
            this.sourceAspectRatio = 0;
        }
        init() {
            let _this = this;
            let onWindowsResize = function (event) {
                _this.onWindowsResize(event);
            };
            window.addEventListener("resize", onWindowsResize, true);
        }
        updateScale() {
            if (this.scaleType !== XEngine.Scale.NO_SCALE) {
                let newWidth = 0;
                let newHeight = 0;
                if (this.scaleType === XEngine.Scale.FIT) {
                    newWidth = window.innerWidth;
                    newHeight = window.innerHeight;
                }
                else {
                    this.sourceAspectRatio = this.game.width / this.game.height;
                    newHeight = window.innerHeight;
                    newWidth = newHeight * this.sourceAspectRatio;
                    if (newWidth > window.innerWidth) {
                        newWidth = window.innerWidth;
                        newHeight = newWidth / this.sourceAspectRatio;
                    }
                }
                newWidth = Math.round(newWidth);
                newHeight = Math.round(newHeight);
                this.resizeCanvas(newWidth, newHeight);
            }
        }
        resizeCanvas(newWidth, newHeight) {
            this.game.canvas.setAttribute("width", newWidth);
            this.game.canvas.setAttribute("height", newHeight);
            this.game.renderer.setScale(newWidth / this.game.width, newHeight / this.game.height);
            this.game.context.viewport(0, 0, newWidth, newHeight);
        }
        onWindowsResize(event) {
            this.updateScale();
        }
    }
    XEngine.ScaleManager = ScaleManager;
})(XEngine || (XEngine = {}));
var XEngine;
(function (XEngine) {
    class StateManager {
        constructor(game) {
            this.game = game;
            this.states = new Array();
            this.currentState = null;
            this.currentStateName = null;
        }
        add(stateName, stateClass) {
            this.states[stateName] = stateClass;
        }
        start(stateName) {
            let _this = this;
            if (_this.currentState != null) {
                _this.game.destroy();
                if (_this.currentState.destroy !== undefined) {
                    _this.currentState.destroy();
                }
                delete _this.currentState;
                _this.currentState = null;
            }
            let state = _this.states[stateName];
            if (state == null) {
                console.error("no state for name " + stateName);
                return;
            }
            _this.currentState = new state(_this.game);
            if (_this.currentState.update === undefined) {
                _this.currentState.update = function () { return; };
            }
            _this.currentState.game = _this.game;
            _this.currentState.stateName = stateName;
            if (_this.currentState.preload !== undefined) {
                _this.currentState.preload();
            }
            _this.game.scale.updateScale();
            _this.game.load._startPreload();
        }
        restart() {
            this.start(this.currentState.stateName);
        }
    }
    XEngine.StateManager = StateManager;
})(XEngine || (XEngine = {}));
var XEngine;
(function (XEngine) {
    class Renderer {
        constructor(game, canvas) {
            this.game = game;
            this.clearColor = { r: 0.0, g: 0.0, b: 0.0, a: 0.0 };
            this.scale = new XEngine.Vector(1);
            let options = { stencil: true, antialias: false };
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
        render() {
            this.context.clear(this.context.COLOR_BUFFER_BIT | this.context.DEPTH_BUFFER_BIT);
            this.context.viewport(0, 0, this.game.canvas.width, this.game.canvas.height);
            this.renderLoop(this.game.renderQueue);
            if (this.renderer) {
                this.renderer.flush();
                this.renderer = null;
                this.sprite = null;
            }
        }
        setRenderer(renderer, sprite) {
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
        }
        setClearColor(r, g, b, a) {
            this.clearColor.r = r;
            this.clearColor.g = g;
            this.clearColor.b = b;
            this.clearColor.a = a;
            this.context.clearColor(this.clearColor.r, this.clearColor.g, this.clearColor.b, this.clearColor.a);
        }
        renderLoop(arrayObjects) {
            let _this = this;
            for (let i = 0; i < arrayObjects.length; i++) {
                let object = arrayObjects[i];
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
        }
        setScale(x, y) {
            this.scale.x = x;
            this.scale.y = y || x;
        }
    }
    XEngine.Renderer = Renderer;
})(XEngine || (XEngine = {}));
var XEngine;
(function (XEngine) {
    class AudioLoader {
        constructor(audioName, audioUrl, loader) {
            this.audioName = audioName;
            this.audioUrl = audioUrl;
            this.completed = false;
            this.loader = loader;
        }
        load() {
            let _this = this;
            let newAudio = {
                audioName: _this.audioName,
                audio: null,
                decoded: false,
            };
            let request = new XMLHttpRequest();
            request.open("GET", _this.audioUrl, true);
            request.responseType = "arraybuffer";
            let handler = function () {
                let audioRef = _this.loader.game.cache.audios[_this.audioName];
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
        }
    }
    XEngine.AudioLoader = AudioLoader;
})(XEngine || (XEngine = {}));
var XEngine;
(function (XEngine) {
    class Cache {
        constructor(game) {
            this.game = game;
            this.images = new Array();
            this.audios = new Array();
            this.json = new Array();
        }
        image(imageName) {
            if (this.images[imageName] === undefined) {
                console.error("No hay imagen para el nombre: " + imageName);
            }
            else {
                return this.images[imageName];
            }
        }
        audio(audioName) {
            if (this.audios[audioName] === undefined) {
                console.error("No hay audio para el nombre: " + audioName);
            }
            else {
                return this.audios[audioName];
            }
        }
        getJson(jsonName) {
            return this.json[jsonName];
        }
        clearCache() {
            delete this.images;
            delete this.audios;
            delete this.json;
            this.images = new Array();
            this.audios = new Array();
            this.json = new Array();
        }
    }
    XEngine.Cache = Cache;
})(XEngine || (XEngine = {}));
var XEngine;
(function (XEngine) {
    class ImageLoader {
        constructor(imageName, imageUrl, loader, frameWidth = 0, frameHeight = 0) {
            this.imageName = imageName;
            this.imageUrl = imageUrl;
            this.completed = false;
            this.loader = loader;
            this.frameWidth = frameWidth;
            this.frameHeight = frameHeight;
        }
        load() {
            let _this = this;
            let newImage = new XEngine.Texture2D(_this.imageName, _this.frameWidth, _this.frameHeight, 1);
            let img1 = new Image();
            let handler = function () {
                let imageRef = _this.loader.game.cache.images[_this.imageName];
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
        }
    }
    XEngine.ImageLoader = ImageLoader;
})(XEngine || (XEngine = {}));
var XEngine;
(function (XEngine) {
    class JsonImageLoader {
        constructor(imageName, imageUrl, jsonUrl, loader) {
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
        load() {
            this.loadJson();
        }
        loadJson() {
            let _this = this;
            let request = new XMLHttpRequest();
            request.open("GET", _this.jsonUrl, true);
            let handler = function () {
                if (request.status === 200) {
                    let returnedJson = JSON.parse(request.responseText);
                    let newJson = returnedJson;
                    for (let i = 0; i < newJson.frames.length; i++) {
                        let frame = newJson.frames[i];
                        newJson[frame.filename] = frame;
                    }
                    _this.loader.game.cache.json[_this.imageName] = newJson;
                }
                _this.completed = true;
                _this.loader._notifyCompleted();
            };
            request.onload = handler;
            request.send();
        }
    }
    XEngine.JsonImageLoader = JsonImageLoader;
})(XEngine || (XEngine = {}));
var XEngine;
(function (XEngine) {
    class Loader {
        constructor(game) {
            this.game = game;
            this.pendingLoads = new Array();
            this.progress = 0;
            this.preloading = false;
            this.onCompleteFile = new XEngine.Signal();
        }
        image(imageName, imageUrl) {
            this.pendingLoads.push(new XEngine.ImageLoader(imageName, imageUrl, this));
        }
        spriteSheet(imageName, imageUrl, frameWidth, frameHeight) {
            this.pendingLoads.push(new XEngine.ImageLoader(imageName, imageUrl, this, frameWidth, frameHeight));
        }
        jsonSpriteSheet(imageName, imageUrl, jsonUrl) {
            this.pendingLoads.push(new XEngine.JsonImageLoader(imageName, imageUrl, jsonUrl, this));
        }
        audio(audioName, audioUrl) {
            this.pendingLoads.push(new XEngine.AudioLoader(audioName, audioUrl, this));
        }
        _startPreload() {
            this.preloading = true;
            if (this.pendingLoads.length === 0) {
                this._callStart();
            }
            else {
                for (let i = 0; i < this.pendingLoads.length; i++) {
                    this.pendingLoads[i].load();
                }
            }
        }
        _notifyCompleted() {
            let completedTasks = 0;
            for (let i = 0; i < this.pendingLoads.length; i++) {
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
        }
        _callStart() {
            this.preloading = false;
            this.game.state.currentState.start();
        }
    }
    XEngine.Loader = Loader;
})(XEngine || (XEngine = {}));
var XEngine;
(function (XEngine) {
    class Signal {
        constructor() {
            this.bindings = new Array();
        }
        add(listener, listenerContext) {
            let newBinding = new XEngine.SignalBinding(this, listener, listenerContext, false);
            this.bindings.push(newBinding);
            return newBinding;
        }
        addOnce(listener, listenerContext) {
            let newBinding = new XEngine.SignalBinding(this, listener, listenerContext, true);
            this.bindings.push(newBinding);
            return newBinding;
        }
        remove(listenerContext) {
            for (let i = 0; i < this.bindings.length; i++) {
                if (this.bindings[i].listenerContext === listenerContext) {
                    this.bindings.splice(i, 1);
                }
            }
        }
        _destroy() {
            delete this.bindings;
            this.bindings = new Array();
        }
        dispatch(...eventArguments) {
            this._cleanup();
            for (let i = 0; i < this.bindings.length; i++) {
                this.bindings[i].dispatch.apply(this.bindings[i], arguments);
            }
        }
        _cleanup() {
            for (let i = this.bindings.length - 1; i >= 0; i--) {
                if (this.bindings[i] == null || this.bindings[i] === undefined) {
                    this.bindings.splice(i, 1);
                }
            }
        }
    }
    XEngine.Signal = Signal;
})(XEngine || (XEngine = {}));
var XEngine;
(function (XEngine) {
    class SignalBinding {
        constructor(signal, listener, listenerContext, isOnce) {
            this.isOnce = false;
            this.signal = signal;
            this.listener = listener;
            this.listenerContext = listenerContext;
            this.isOnce = isOnce;
        }
        dispatch() {
            this.listener.apply(this.listenerContext, arguments);
            if (this.isOnce) {
                this.detach();
            }
        }
        detach() {
            this.signal.remove(this.listenerContext);
        }
    }
    XEngine.SignalBinding = SignalBinding;
})(XEngine || (XEngine = {}));
var XEngine;
(function (XEngine) {
    class DataBuffer16 {
        constructor(byteSize) {
            this.wordLength = 0;
            this.wordCapacity = byteSize / 4;
            this.buffer = new ArrayBuffer(byteSize);
            this.intView = new Int16Array(this.buffer);
            this.uintView = new Uint16Array(this.buffer);
        }
        clear() {
            this.wordLength = 0;
        }
        getByteLength() {
            return this.wordLength * 4;
        }
        getByteCapacity() {
            return this.buffer.byteLength;
        }
        allocate(wordSize) {
            let currentLength = this.wordLength;
            this.wordLength += wordSize;
            return currentLength;
        }
        getUsedBufferAsInt() {
            return this.intView.subarray(0, this.wordLength);
        }
        getUsedBufferAsUint() {
            return this.uintView.subarray(0, this.wordLength);
        }
    }
    XEngine.DataBuffer16 = DataBuffer16;
})(XEngine || (XEngine = {}));
var XEngine;
(function (XEngine) {
    class DataBuffer32 {
        constructor(byteSize) {
            this.wordLength = 0;
            this.wordCapacity = byteSize / 4;
            this.buffer = new ArrayBuffer(byteSize);
            this.floatView = new Float32Array(this.buffer);
            this.intView = new Int32Array(this.buffer);
            this.uintView = new Uint32Array(this.buffer);
        }
        clear() {
            this.wordLength = 0;
        }
        getByteLength() {
            return this.wordLength * 4;
        }
        getByteCapacity() {
            return this.buffer.byteLength;
        }
        allocate(wordSize) {
            let currentLength = this.wordLength;
            this.wordLength += wordSize;
            return currentLength;
        }
        getUsedBufferAsFloat() {
            return this.floatView.subarray(0, this.wordLength);
        }
        getUsedBufferAsInt() {
            return this.intView.subarray(0, this.wordLength);
        }
        getUsedBufferAsUint() {
            return this.uintView.subarray(0, this.wordLength);
        }
    }
    XEngine.DataBuffer32 = DataBuffer32;
})(XEngine || (XEngine = {}));
var XEngine;
(function (XEngine) {
    class IndexBuffer {
        constructor(gl, buffer) {
            this.gl = gl;
            this.bufferType = gl.ELEMENT_ARRAY_BUFFER;
            this.buffer = buffer;
        }
        static SetDiry() {
            IndexBuffer.CurrentIndexBuffer = null;
        }
        updateResource(bufferData, offset) {
            let gl = this.gl;
            IndexBuffer.CurrentIndexBuffer = this;
            gl.bindBuffer(this.bufferType, this.buffer);
            gl.bufferSubData(this.bufferType, offset, bufferData);
        }
        bind() {
            let gl = this.gl;
            let buffer = this.buffer;
            IndexBuffer.CurrentIndexBuffer = this;
            gl.bindBuffer(this.bufferType, buffer);
        }
    }
    XEngine.IndexBuffer = IndexBuffer;
})(XEngine || (XEngine = {}));
var XEngine;
(function (XEngine) {
    class ResourceManager {
        constructor(gl) {
            this.gl = gl;
        }
        createBuffer(target, initialDataOrSize, usage) {
            let gl = this.gl;
            let buffer = gl.createBuffer();
            gl.bindBuffer(target, buffer);
            gl.bufferData(target, initialDataOrSize, usage);
            switch (target) {
                case gl.ARRAY_BUFFER:
                    return new XEngine.VertexBuffer(gl, buffer);
                case gl.ELEMENT_ARRAY_BUFFER:
                    return new XEngine.IndexBuffer(gl, buffer);
            }
        }
        createShader(shaderClass) {
            let shader = new shaderClass();
            shader.initializeShader(this.gl);
            return shader;
        }
    }
    XEngine.ResourceManager = ResourceManager;
})(XEngine || (XEngine = {}));
var XEngine;
(function (XEngine) {
    let WRAP_MODE;
    (function (WRAP_MODE) {
        WRAP_MODE[WRAP_MODE["CLAMP"] = 0] = "CLAMP";
        WRAP_MODE[WRAP_MODE["WRAP"] = 1] = "WRAP";
    })(WRAP_MODE = XEngine.WRAP_MODE || (XEngine.WRAP_MODE = {}));
    class Texture2D {
        constructor(name, width, height, wrapMode = WRAP_MODE.CLAMP) {
            this.imageName = name;
            this.frameWidth = width;
            this.frameHeight = height;
            this._texture = null;
            this.ready = false;
            this.wrapMode = wrapMode;
        }
        createTexture(gl) {
            if (this.imageName == null) {
                return;
            }
            this._texture = gl.createTexture();
            const internalFormat = gl.RGBA;
            const srcFormat = gl.RGBA;
            const srcType = gl.UNSIGNED_BYTE;
            gl.bindTexture(gl.TEXTURE_2D, this._texture);
            if (this.wrapMode === WRAP_MODE.WRAP) {
                gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, srcFormat, srcType, this.image);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
            }
            else {
                gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, srcFormat, srcType, this.image);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            }
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            this.ready = true;
        }
    }
    XEngine.Texture2D = Texture2D;
})(XEngine || (XEngine = {}));
var XEngine;
(function (XEngine) {
    class VertexBuffer {
        constructor(gl, buffer) {
            this.gl = gl;
            this.bufferType = gl.ARRAY_BUFFER;
            this.buffer = buffer;
            this.attributes = new Array();
        }
        static SetDiry() {
            VertexBuffer.CurrentVertexBuffer = null;
        }
        addAttribute(index, size, type, normalized, stride, offset) {
            this.attributes.push({
                index: index,
                size: size,
                type: type,
                normalized: normalized,
                stride: stride,
                offset: offset,
            });
        }
        updateResource(bufferData, offset) {
            let gl = this.gl;
            VertexBuffer.CurrentVertexBuffer = this;
            gl.bindBuffer(this.bufferType, this.buffer);
            gl.bufferSubData(this.bufferType, offset, bufferData);
        }
        bind() {
            let gl = this.gl;
            let buffer = this.buffer;
            let attributes = this.attributes;
            let attributesLength = attributes.length;
            VertexBuffer.CurrentVertexBuffer = this;
            gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
            for (let index = 0; index < attributesLength; ++index) {
                let element = attributes[index];
                if (element !== undefined && element !== null) {
                    gl.enableVertexAttribArray(element.index);
                    gl.vertexAttribPointer(element.index, element.size, element.type, element.normalized, element.stride, element.offset);
                }
            }
        }
    }
    XEngine.VertexBuffer = VertexBuffer;
})(XEngine || (XEngine = {}));
var XEngine;
(function (XEngine) {
    let Uniforms;
    (function (Uniforms) {
        Uniforms[Uniforms["FLOAT"] = 0] = "FLOAT";
        Uniforms[Uniforms["INTEGER"] = 1] = "INTEGER";
        Uniforms[Uniforms["MAT2X2"] = 2] = "MAT2X2";
        Uniforms[Uniforms["MAT3X3"] = 3] = "MAT3X3";
        Uniforms[Uniforms["MAT4X4"] = 4] = "MAT4X4";
        Uniforms[Uniforms["VECTOR2"] = 5] = "VECTOR2";
        Uniforms[Uniforms["VECTOR3"] = 6] = "VECTOR3";
        Uniforms[Uniforms["VECTOR4"] = 7] = "VECTOR4";
        Uniforms[Uniforms["SAMPLER"] = 8] = "SAMPLER";
    })(Uniforms = XEngine.Uniforms || (XEngine.Uniforms = {}));
    class ShaderCompiler {
        static compileVertexShader(verxtexString) {
            verxtexString = verxtexString.replace("#XBaseParams", this.vertexBaseParams.join("\n"));
            verxtexString += this.vertexMain.join("\n");
            return verxtexString;
        }
        static compileFragmentShader(fragmentString) {
            fragmentString = fragmentString.replace("#XBaseParams", this.fragmentBaseParams.join("\n"));
            return fragmentString;
        }
    }
    ShaderCompiler.vertexBaseParams = [
        "in vec2 aVertexPosition;",
        "in vec2 vUv;",
        "in vec3 aVertexColor;",
        "in float in_alpha;",
        "uniform mat4 pMatrix;",
        "out highp vec2 uv;",
        "vec4 vertPos;",
        "out lowp vec3 vColor;",
        "out lowp float alpha;",
    ];
    ShaderCompiler.fragmentBaseParams = [
        "in lowp vec3 vColor;",
        "in highp vec2 uv;",
        "in float alpha;",
        "out vec4 fragColor;",
    ];
    ShaderCompiler.vertexMain = [
        "void main(void) {",
        "vertPos = pMatrix * vec4(aVertexPosition, -1.0, 1.0);",
        "uv = vUv;",
        "vColor = aVertexColor;",
        "alpha = in_alpha;",
        "mainPass();",
        "gl_Position = vertPos;",
        "}",
    ];
    XEngine.ShaderCompiler = ShaderCompiler;
})(XEngine || (XEngine = {}));
var XEngine;
(function (XEngine) {
    XEngine.ShaderUniforms = {
        pMatrix: {
            value: null,
            type: XEngine.Uniforms.MAT4X4,
        },
    };
    class Shader {
        constructor(vertexCode, fragmentCode, uniforms = {}) {
            this.uniforms = uniforms;
            this.baseUniforms = JSON.parse(JSON.stringify(XEngine.ShaderUniforms));
            this.vertColAtt = null;
            this.vertColAtt = null;
            this.shaderProgram = null;
            this.compiled = false;
            this.vertexCode = vertexCode;
            this.fragmentCode = fragmentCode;
        }
        initializeShader(gl) {
            let vertString = "";
            let fragmentString = "";
            for (let i = 0; i < this.vertexCode.length; i++) {
                vertString += this.vertexCode[i] + "\n";
            }
            vertString = XEngine.ShaderCompiler.compileVertexShader(vertString);
            for (let j = 0; j < this.fragmentCode.length; j++) {
                fragmentString += this.fragmentCode[j] + "\n";
            }
            fragmentString = XEngine.ShaderCompiler.compileFragmentShader(fragmentString);
            let vertexShader;
            let fragmentShader;
            fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
            vertexShader = gl.createShader(gl.VERTEX_SHADER);
            gl.shaderSource(vertexShader, vertString);
            gl.compileShader(vertexShader);
            gl.shaderSource(fragmentShader, fragmentString);
            gl.compileShader(fragmentShader);
            if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
                alert(gl.getShaderInfoLog(vertexShader));
                this.compiled = true;
                return null;
            }
            if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
                alert(gl.getShaderInfoLog(fragmentShader));
                this.compiled = true;
                return null;
            }
            this.shaderProgram = gl.createProgram();
            gl.attachShader(this.shaderProgram, vertexShader);
            gl.attachShader(this.shaderProgram, fragmentShader);
            gl.linkProgram(this.shaderProgram);
            if (!gl.getProgramParameter(this.shaderProgram, gl.LINK_STATUS)) {
                alert("Could not initialise shaders");
                this.compiled = true;
            }
            this.compiled = true;
            this.setUniforms(gl);
        }
        setUniforms(gl) {
            gl.useProgram(this.shaderProgram);
            this.vertPosAtt = gl.getAttribLocation(this.shaderProgram, "aVertexPosition");
            this.vertColAtt = gl.getAttribLocation(this.shaderProgram, "aVertexColor");
            this.vertUvAtt = gl.getAttribLocation(this.shaderProgram, "vUv");
            this.vertAlphaAtt = gl.getAttribLocation(this.shaderProgram, "in_alpha");
            for (let property in this.uniforms) {
                if (this.uniforms.hasOwnProperty(property)) {
                    this.uniforms[property].gpuPosition = gl.getUniformLocation(this.shaderProgram, property);
                }
            }
            for (let property in this.baseUniforms) {
                if (this.baseUniforms.hasOwnProperty(property)) {
                    this.baseUniforms[property].gpuPosition = gl.getUniformLocation(this.shaderProgram, property);
                }
            }
        }
        getAttribLocation(gl, attr) {
            return gl.getAttribLocation(this.shaderProgram, attr);
        }
        _beginRender(gl) {
            if (!this.compiled) {
                this.initializeShader(gl);
            }
            gl.useProgram(this.shaderProgram);
        }
        bind(gl) {
            if (!this.compiled) {
                this.initializeShader(gl);
            }
            gl.useProgram(this.shaderProgram);
        }
        _setUniform(uniform, gl) {
            let valueType = uniform.type;
            switch (valueType) {
                case XEngine.Uniforms.INTEGER:
                    gl.uniform1i(uniform.gpuPosition, uniform.value);
                    break;
                case XEngine.Uniforms.FLOAT:
                    gl.uniform1f(uniform.gpuPosition, uniform.value);
                    break;
                case XEngine.Uniforms.VECTOR2:
                    gl.uniform2fv(uniform.gpuPosition, uniform.value);
                    break;
                case XEngine.Uniforms.VECTOR3:
                    gl.uniform3fv(uniform.gpuPosition, uniform.value);
                    break;
                case XEngine.Uniforms.VECTOR4:
                    gl.uniform4fv(uniform.gpuPosition, uniform.value);
                    break;
                case XEngine.Uniforms.MAT2X2:
                    gl.uniformMatrix2fv(uniform.gpuPosition, false, uniform.value);
                    break;
                case XEngine.Uniforms.MAT3X3:
                    gl.uniformMatrix3fv(uniform.gpuPosition, false, uniform.value);
                    break;
                case XEngine.Uniforms.MAT4X4:
                    gl.uniformMatrix4fv(uniform.gpuPosition, false, uniform.value);
                    break;
                default:
                    gl.uniform1f(uniform.gpuPosition, uniform.value);
                    break;
            }
        }
        updateUniforms(gl) {
            for (const property in this.uniforms) {
                if (this.uniforms.hasOwnProperty(property)) {
                    this._setUniform(this.uniforms[property], gl);
                    this.uniforms[property].prevVal = this.uniforms[property].value;
                }
            }
            for (let property in this.baseUniforms) {
                if (this.baseUniforms.hasOwnProperty(property)) {
                    this._setUniform(this.baseUniforms[property], gl);
                    this.baseUniforms[property].prevVal = this.baseUniforms[property].value;
                }
            }
        }
    }
    XEngine.Shader = Shader;
})(XEngine || (XEngine = {}));
var XEngine;
(function (XEngine) {
    let ShaderLib;
    (function (ShaderLib) {
        class ShaderLibObject {
        }
        ShaderLib.ShaderLibObject = ShaderLibObject;
        class Sprite extends ShaderLibObject {
        }
        Sprite.vertexShader = [
            "#version 300 es",
            "#XBaseParams",
            "void mainPass() {",
            "}",
        ];
        Sprite.fragmentShader = [
            "#version 300 es",
            "precision mediump float;",
            "uniform sampler2D texSampler;",
            "#XBaseParams",
            "void main(void) {",
            "vec4 texCol = texture(texSampler, uv);",
            "texCol.rgb *= texCol.w;",
            "texCol.xyz *= vColor;",
            "fragColor = texCol*alpha;",
            "}",
        ];
        ShaderLib.Sprite = Sprite;
        class SimpleColor extends ShaderLibObject {
        }
        SimpleColor.vertexShader = [
            "#version 300 es",
            "#XBaseParams",
            "void mainPass() {",
            "}",
        ];
        SimpleColor.fragmentShader = [
            "#version 300 es",
            "precision mediump float;",
            "#XBaseParams",
            "void main(void) {",
            "fragColor = vec4(vColor, alpha) * alpha;",
            "}",
        ];
        ShaderLib.SimpleColor = SimpleColor;
        class CircleColor extends ShaderLibObject {
        }
        CircleColor.vertexShader = [
            "#version 300 es",
            "#XBaseParams",
            "void mainPass() {",
            "}",
        ];
        CircleColor.fragmentShader = [
            "#version 300 es",
            "precision mediump float;",
            "#XBaseParams",
            "void main(void) {",
            "vec2 uvOffset = uv - 0.5;",
            "float distance = length(uvOffset);",
            "float res = smoothstep(distance,distance+0.04,0.5);",
            "if(res < 0.1) discard;",
            "fragColor = vec4(1.0, 1.0, 1.0, res) * res * alpha;",
            "fragColor.xyz *= vColor;",
            "}",
        ];
        ShaderLib.CircleColor = CircleColor;
    })(ShaderLib = XEngine.ShaderLib || (XEngine.ShaderLib = {}));
})(XEngine || (XEngine = {}));
var XEngine;
(function (XEngine) {
    class CircleColor extends XEngine.Shader {
        constructor() {
            super(XEngine.ShaderLib.CircleColor.vertexShader, XEngine.ShaderLib.CircleColor.fragmentShader);
        }
    }
    CircleColor.shader = new CircleColor();
    XEngine.CircleColor = CircleColor;
})(XEngine || (XEngine = {}));
var XEngine;
(function (XEngine) {
    class SimpleColor extends XEngine.Shader {
        constructor() {
            super(XEngine.ShaderLib.SimpleColor.vertexShader, XEngine.ShaderLib.SimpleColor.fragmentShader);
        }
    }
    SimpleColor.shader = new SimpleColor();
    XEngine.SimpleColor = SimpleColor;
})(XEngine || (XEngine = {}));
var XEngine;
(function (XEngine) {
    class SpriteShader extends XEngine.Shader {
        constructor() {
            super(XEngine.ShaderLib.Sprite.vertexShader, XEngine.ShaderLib.Sprite.fragmentShader);
        }
        _setTexture(texture) {
            this.texture = texture;
        }
        _beginRender(gl) {
            XEngine.Shader.prototype._beginRender.call(this, gl);
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, this.texture);
        }
    }
    SpriteShader.shader = new SpriteShader();
    XEngine.SpriteShader = SpriteShader;
})(XEngine || (XEngine = {}));
var XEngine;
(function (XEngine) {
    let SpriteBatcher;
    (function (SpriteBatcher) {
        class Consts {
        }
        Consts.VERTEX_SIZE = 24;
        Consts.INDEX_SIZE = 2;
        Consts.VERTEX_COUNT = 4;
        Consts.INDEX_COUNT = 6;
        Consts.VERTEX_COMPONENT_COUNT = 6;
        Consts.MAX_SPRITES = 2000;
        SpriteBatcher.Consts = Consts;
    })(SpriteBatcher = XEngine.SpriteBatcher || (XEngine.SpriteBatcher = {}));
})(XEngine || (XEngine = {}));
var XEngine;
(function (XEngine) {
    let SpriteBatcher;
    (function (SpriteBatcher) {
        class SpriteBatch {
            constructor(game, gl, renderer) {
                this.gl = gl;
                this.game = game;
                this.renderer = renderer;
                this.maxSprites = null;
                this.shader = null;
                this.vertexBufferObject = null;
                this.indexBufferObject = null;
                this.vertexDataBuffer = null;
                this.indexDataBuffer = null;
                this.elementCount = 0;
                this.currentTexture2D = null;
                this.currentSprite = null;
                this.mask = null;
                this.vertexCount = 0;
                this.init(this.gl);
            }
            shouldFlush() {
                if (this.isFull()) {
                    return true;
                }
                return false;
            }
            isFull() {
                return (this.vertexDataBuffer.getByteLength() >= this.vertexDataBuffer.getByteCapacity());
            }
            bind(shader) {
                if (!shader) {
                    this.shader.bind(this.gl);
                    this.shader.baseUniforms.pMatrix.value = this.game.camera.pMatrix;
                    this.shader._setTexture(this.currentTexture2D);
                    this.shader.updateUniforms(this.gl);
                }
                else {
                    shader.bind(this.gl);
                    shader.baseUniforms.pMatrix.value = this.game.camera.pMatrix;
                    shader._setTexture(this.currentTexture2D);
                    shader.updateUniforms(this.gl);
                }
                this.gl.bindTexture(this.gl.TEXTURE_2D, this.currentTexture2D);
                this.vertexBufferObject.bind();
                this.indexBufferObject.bind();
            }
            flush(shader) {
                let gl = this.gl;
                if (this.mask) {
                    this.mask.rendermask(gl);
                }
                let vertexDataBuffer = this.vertexDataBuffer;
                if (this.elementCount === 0 && this.vertexCount === 0) {
                    return;
                }
                this.bind(shader);
                this.vertexBufferObject.updateResource(vertexDataBuffer.floatView, 0);
                gl.drawElements(gl.TRIANGLES, this.elementCount, gl.UNSIGNED_SHORT, 0);
                vertexDataBuffer.clear();
                this.elementCount = 0;
                this.vertexCount = 0;
                if (this.mask) {
                    this.mask.endRendermask(gl);
                    this.mask = null;
                }
            }
            addSprite(gameObject, shader) {
                if (gameObject.mask !== this.mask || this.shader !== shader) {
                    this.flush(this.shader);
                    this.shader = shader;
                }
                if (gameObject.mask) {
                    this.mask = gameObject.mask;
                }
                this.renderer.setRenderer(this, gameObject.sprite);
                let floatBuffer = this.vertexDataBuffer.floatView;
                let uintBuffer = this.vertexDataBuffer.uintView;
                let index = this.vertexDataBuffer.allocate(24);
                let pos = new XEngine.Vector(0, 0);
                mat4.identity(gameObject.mvMatrix);
                gameObject.getWorldMatrix(gameObject.mvMatrix);
                pos = pos.multiplyMatrix(gameObject.mvMatrix);
                floatBuffer[index++] = pos.x;
                floatBuffer[index++] = pos.y;
                floatBuffer[index++] = gameObject._uv[0];
                floatBuffer[index++] = gameObject._uv[1];
                uintBuffer[index++] = gameObject.color;
                floatBuffer[index++] = gameObject.alpha;
                pos.setTo(0, gameObject.height);
                pos = pos.multiplyMatrix(gameObject.mvMatrix);
                floatBuffer[index++] = pos.x;
                floatBuffer[index++] = pos.y;
                floatBuffer[index++] = gameObject._uv[2];
                floatBuffer[index++] = gameObject._uv[3];
                uintBuffer[index++] = gameObject.color;
                floatBuffer[index++] = gameObject.alpha;
                pos.setTo(gameObject.width, 0);
                pos = pos.multiplyMatrix(gameObject.mvMatrix);
                floatBuffer[index++] = pos.x;
                floatBuffer[index++] = pos.y;
                floatBuffer[index++] = gameObject._uv[4];
                floatBuffer[index++] = gameObject._uv[5];
                uintBuffer[index++] = gameObject.color;
                floatBuffer[index++] = gameObject.alpha;
                pos.setTo(gameObject.width, gameObject.height);
                pos = pos.multiplyMatrix(gameObject.mvMatrix);
                floatBuffer[index++] = pos.x;
                floatBuffer[index++] = pos.y;
                floatBuffer[index++] = gameObject._uv[6];
                floatBuffer[index++] = gameObject._uv[7];
                uintBuffer[index++] = gameObject.color;
                floatBuffer[index++] = gameObject.alpha;
                this.currentTexture2D = this.game.cache.image(gameObject.sprite)._texture;
                this.currentSprite = gameObject.sprite;
                this.elementCount += 6;
            }
            init(gl) {
                let vertexDataBuffer = new XEngine.DataBuffer32(SpriteBatcher.Consts.VERTEX_SIZE * SpriteBatcher.Consts.VERTEX_COUNT * SpriteBatcher.Consts.MAX_SPRITES);
                let indexDataBuffer = new XEngine.DataBuffer16(SpriteBatcher.Consts.INDEX_SIZE * SpriteBatcher.Consts.INDEX_COUNT * SpriteBatcher.Consts.MAX_SPRITES);
                let indexBufferObject = this.renderer.resourceManager.createBuffer(gl.ELEMENT_ARRAY_BUFFER, indexDataBuffer.getByteCapacity(), gl.STATIC_DRAW);
                let vertexBufferObject = this.renderer.resourceManager.createBuffer(gl.ARRAY_BUFFER, vertexDataBuffer.getByteCapacity(), gl.STREAM_DRAW);
                let shader = this.renderer.resourceManager.createShader(XEngine.SpriteShader);
                let indexBuffer = indexDataBuffer.uintView;
                let max = SpriteBatcher.Consts.MAX_SPRITES * SpriteBatcher.Consts.INDEX_COUNT;
                this.vertexDataBuffer = vertexDataBuffer;
                this.vertexBufferObject = vertexBufferObject;
                this.indexDataBuffer = indexDataBuffer;
                this.indexBufferObject = indexBufferObject;
                this.shader = shader;
                vertexBufferObject.addAttribute(shader.getAttribLocation(gl, "aVertexPosition"), 2, gl.FLOAT, false, SpriteBatcher.Consts.VERTEX_SIZE, 0);
                vertexBufferObject.addAttribute(shader.getAttribLocation(gl, "vUv"), 2, gl.FLOAT, false, SpriteBatcher.Consts.VERTEX_SIZE, 8);
                vertexBufferObject.addAttribute(shader.getAttribLocation(gl, "aVertexColor"), 3, gl.UNSIGNED_BYTE, true, SpriteBatcher.Consts.VERTEX_SIZE, 16);
                vertexBufferObject.addAttribute(shader.getAttribLocation(gl, "in_alpha"), 1, gl.FLOAT, false, SpriteBatcher.Consts.VERTEX_SIZE, 20);
                for (let indexA = 0, indexB = 0; indexA < max; indexA += SpriteBatcher.Consts.INDEX_COUNT, indexB += SpriteBatcher.Consts.VERTEX_COUNT) {
                    indexBuffer[indexA + 0] = indexB + 0;
                    indexBuffer[indexA + 1] = indexB + 1;
                    indexBuffer[indexA + 2] = indexB + 2;
                    indexBuffer[indexA + 3] = indexB + 1;
                    indexBuffer[indexA + 4] = indexB + 3;
                    indexBuffer[indexA + 5] = indexB + 2;
                }
                indexBufferObject.updateResource(indexBuffer, 0);
            }
        }
        SpriteBatcher.SpriteBatch = SpriteBatch;
    })(SpriteBatcher = XEngine.SpriteBatcher || (XEngine.SpriteBatcher = {}));
})(XEngine || (XEngine = {}));
