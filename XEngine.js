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
    var AXIS;
    (function (AXIS) {
        AXIS["NONE"] = "none";
        AXIS["HORIZONTAL"] = "horizontal";
        AXIS["VERTICAL"] = "vertical";
        AXIS["BOTH"] = "both";
    })(AXIS = XEngine.AXIS || (XEngine.AXIS = {}));
    var Camera = (function () {
        function Camera(game) {
            this.game = game;
            this.position = new XEngine.Vector(0, 0);
            this.followedObject = null;
            this.axis = XEngine.AXIS.BOTH;
            this.pMatrix = mat4.create();
        }
        Camera.prototype.followObject = function (gameObject, offsetLeft, offsetUp) {
            this.follow = true;
            this.offsetLeft = offsetLeft || 0;
            this.offsetUp = offsetUp || 0;
            this.followedObject = gameObject;
        };
        Camera.prototype.update = function () {
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
            var right = this.game.width + this.position.x;
            var up = this.game.height + this.position.y;
            mat4.ortho(this.pMatrix, this.position.x, right, up, this.position.y, 0.1, 100);
        };
        return Camera;
    }());
    XEngine.Camera = Camera;
})(XEngine || (XEngine = {}));
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
                this.timer = setTimeout(function () { _this.update(); }, this.time.frameLimit / 1);
            }
            if (this.time.update()) {
                if (this.pause) {
                    return;
                }
                if (this.state.currentState == null) {
                    return;
                }
                if (!this.load.preloading) {
                    this.updateQueue.removePending();
                    this.tween.update(this.time.deltaTimeMillis);
                    var queueLength = this.updateQueue.length - 1;
                    for (var i = queueLength; i >= 0; i--) {
                        var gameObject = this.updateQueue[i];
                        if (gameObject.alive) {
                            gameObject.update(this.time.deltaTime);
                            if (XEngine.Sprite.prototype.isPrototypeOf(gameObject)) {
                                gameObject._updateAnims(this.time.deltaTimeMillis);
                            }
                        }
                    }
                    this.state.currentState.update(this.time.deltaTime);
                    this.camera.update();
                    this.renderQueue.removePending();
                    this.renderer.render();
                }
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
            this.updateQueue = new Array();
            this.renderQueue = new Array();
            this.pause = false;
            this.state = new XEngine.StateManager(this);
            this.add = new XEngine.ObjectFactory(this);
            this.tween = new XEngine.TweenManager(this);
            this.cache = new XEngine.Cache(this);
            this.load = new XEngine.Loader(this);
            this.camera = new XEngine.Camera(this);
            this.renderer = new XEngine.Renderer(this, this.canvas);
            this.context = this.renderer.context;
            this.resourceManager = new XEngine.ResourceManager(this.context);
            this.renderer.init();
            this.scale = new XEngine.ScaleManager(this);
            this.scale.init();
            this.time = new XEngine.TimeManager();
            this.time.init();
            this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            this.input = new XEngine.InputManager(this);
            console.log("Game engine " + XEngine.version + " arrancado con webgl!!!");
            this.update();
        };
        return Game;
    }());
    XEngine.Game = Game;
})(XEngine || (XEngine = {}));
var XEngine;
(function (XEngine) {
    var Mathf = (function () {
        function Mathf() {
        }
        Mathf.randomRange = function (min, max) {
            return min + (Math.random() * (max - min));
        };
        Mathf.randomIntRange = function (min, max) {
            return Math.round(min + Math.random() * (max - min));
        };
        Mathf.clamp = function (number, min, max) {
            return Math.max(Math.min(number, max), min);
        };
        Mathf.lerp = function (a, b, t) {
            t = XEngine.Mathf.clamp(t, 0, 1);
            return (1 - t) * a + t * b;
        };
        Mathf.lerpColor = function (a, b, amount) {
            var ah = parseInt(a.replace(/#/g, ""), 16), ar = ah >> 16, ag = ah >> 8 & 0xff, ab = ah & 0xff, bh = parseInt(b.replace(/#/g, ""), 16), br = bh >> 16, bg = bh >> 8 & 0xff, bb = bh & 0xff, rr = ar + amount * (br - ar), rg = ag + amount * (bg - ag), rb = ab + amount * (bb - ab);
            return "#" + ((1 << 24) + (rr << 16) + (rg << 8) + rb | 0).toString(16).slice(1);
        };
        Mathf.angleBetween = function (originX, originY, targetX, targetY) {
            var x = targetX - originX;
            var y = targetY - originY;
            return (Math.atan2(y, x));
        };
        Mathf.TO_RADIANS = 0.0174532925199432957;
        Mathf.TO_DEGREES = 57.2957795130823208767;
        return Mathf;
    }());
    XEngine.Mathf = Mathf;
    var Vector = (function () {
        function Vector(x, y, z) {
            if (y === void 0) { y = x; }
            if (z === void 0) { z = 1.0; }
            this.zOffset = 0;
            this.x = x;
            this.y = y;
            this.z = z;
            this.zOffset = 0;
        }
        Vector.prototype.setTo = function (x, y, z) {
            if (y === void 0) { y = x; }
            this.x = x;
            this.y = y;
            if (z) {
                this.z = z;
            }
        };
        Vector.prototype.sub = function (vector) {
            this.x -= vector.x;
            this.y -= vector.y;
            this.z -= vector.z;
            return this;
        };
        Vector.prototype.add = function (vector) {
            this.x += vector.x;
            this.y += vector.y;
            this.z += vector.z;
            return this;
        };
        Vector.prototype.multiply = function (vector) {
            this.x *= vector.x;
            this.y *= vector.y;
            this.z *= vector.z;
            return this;
        };
        Vector.prototype.multiplyMatrix = function (matrix) {
            var x = this.x, y = this.y;
            var z = this.z;
            var out = new Array(3);
            this.x = x * matrix[0] + y * matrix[4] + z * matrix[8] + matrix[12];
            this.y = x * matrix[1] + y * matrix[5] + z * matrix[9] + matrix[13];
            this.z = x * matrix[2] + y * matrix[6] + z * matrix[10] + matrix[14];
            return this;
        };
        Vector.prototype.rotate = function (angle) {
            var x = this.x;
            var y = this.y;
            this.x = x * Math.cos(angle) - y * Math.sin(angle);
            this.y = x * Math.sin(angle) + y * Math.cos(angle);
            return this;
        };
        Vector.prototype.normalize = function () {
            var d = this.length();
            if (d > 0) {
                this.x = this.x / d;
                this.y = this.y / d;
            }
            return this;
        };
        Vector.prototype.project = function (vector) {
            var amt = this.dot(vector) / vector.len2();
            this.x = amt * vector.x;
            this.y = amt * vector.y;
            return this;
        };
        Vector.prototype.scale = function (x, y) {
            if (y === void 0) { y = x; }
            this.x *= x;
            this.y *= y;
            return this;
        };
        Vector.prototype.reflect = function (axis) {
            var x = this.x;
            var y = this.y;
            this.project(axis).scale(2);
            this.x -= x;
            this.y -= y;
            return this;
        };
        Vector.prototype.distance = function (vector) {
            var tmp = new XEngine.Vector(this.x, this.y, this.z);
            tmp.sub(vector);
            return tmp.length();
        };
        Vector.prototype.len2 = function () {
            return this.dot(this);
        };
        Vector.prototype.length = function () {
            return Math.sqrt(this.len2());
        };
        Vector.prototype.dot = function (vec) {
            return this.x * vec.x + this.y * vec.y;
        };
        Vector.Zero = new Vector(0);
        return Vector;
    }());
    XEngine.Vector = Vector;
})(XEngine || (XEngine = {}));
var XEngine;
(function (XEngine) {
    var Scale;
    (function (Scale) {
        Scale[Scale["FIT"] = 0] = "FIT";
        Scale[Scale["SHOW_ALL"] = 1] = "SHOW_ALL";
        Scale[Scale["NO_SCALE"] = 2] = "NO_SCALE";
    })(Scale = XEngine.Scale || (XEngine.Scale = {}));
    var ScaleManager = (function () {
        function ScaleManager(game) {
            this.game = game;
            this.scaleType = Scale.NO_SCALE;
            this.orientation = "landScape";
            this.sourceAspectRatio = 0;
        }
        ScaleManager.prototype.init = function () {
            var _this = this;
            var onWindowsResize = function (event) {
                _this.onWindowsResize(event);
            };
            window.addEventListener("resize", onWindowsResize, true);
        };
        ScaleManager.prototype.updateScale = function () {
            if (this.scaleType !== XEngine.Scale.NO_SCALE) {
                var newWidth = 0;
                var newHeight = 0;
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
        };
        ScaleManager.prototype.resizeCanvas = function (newWidth, newHeight) {
            this.game.canvas.setAttribute("width", newWidth);
            this.game.canvas.setAttribute("height", newHeight);
            this.game.renderer.setScale(newWidth / this.game.width, newHeight / this.game.height);
            this.game.context.viewport(0, 0, newWidth, newHeight);
        };
        ScaleManager.prototype.onWindowsResize = function (event) {
            this.updateScale();
        };
        return ScaleManager;
    }());
    XEngine.ScaleManager = ScaleManager;
})(XEngine || (XEngine = {}));
var XEngine;
(function (XEngine) {
    var StateManager = (function () {
        function StateManager(game) {
            this.game = game;
            this.states = new Array();
            this.currentState = null;
            this.currentStateName = null;
        }
        StateManager.prototype.add = function (stateName, stateClass) {
            this.states[stateName] = stateClass;
        };
        StateManager.prototype.start = function (stateName) {
            var _this = this;
            if (_this.currentState != null) {
                _this.game.destroy();
                if (_this.currentState.destroy !== undefined) {
                    _this.currentState.destroy();
                }
                delete _this.currentState;
                _this.currentState = null;
            }
            var state = _this.states[stateName];
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
        };
        StateManager.prototype.restart = function () {
            this.start(this.currentState.stateName);
        };
        return StateManager;
    }());
    XEngine.StateManager = StateManager;
})(XEngine || (XEngine = {}));
var XEngine;
(function (XEngine) {
    var TimeManager = (function () {
        function TimeManager() {
        }
        TimeManager.prototype.init = function () {
            this.startTime = Date.now();
            this.previousFrameTime = 0;
            this.deltaTime = 0;
            this.deltaTimeMillis = 0;
            this.frameTime = 0;
            this.elapsedTime = 0;
            this.frameLimit = 60;
            this.timers = new Array();
        };
        TimeManager.prototype.update = function () {
            this.elapsedTime = Date.now() - this.startTime;
            this.frameTime = this.elapsedTime;
            this.deltaTimeMillis = Math.min(400, (this.frameTime - this.previousFrameTime));
            this.deltaTime = this.deltaTimeMillis / 1000;
            this.previousFrameTime = this.frameTime;
            this.updateTimers();
            return true;
        };
        TimeManager.prototype.addTimer = function (duration, loop, autoStart, autoDestroy) {
            if (autoStart === void 0) { autoStart = false; }
            if (autoDestroy === void 0) { autoDestroy = false; }
            var timer = new XEngine.Timer(duration, loop, autoDestroy);
            if (autoStart) {
                timer.start();
            }
            this.timers.push(timer);
            return timer;
        };
        TimeManager.prototype.updateTimers = function () {
            this.timers.removePending();
            var queueLength = this.timers.length - 1;
            for (var i = queueLength; i >= 0; i--) {
                var timer = this.timers[i];
                timer.update(this.deltaTimeMillis);
            }
        };
        return TimeManager;
    }());
    XEngine.TimeManager = TimeManager;
})(XEngine || (XEngine = {}));
var XEngine;
(function (XEngine) {
    var Timer = (function () {
        function Timer(duration, loop, autoDestroy) {
            this.duration = duration;
            this.elapsed = 0;
            this.remaining = duration;
            this.loop = loop;
            this.onCompleted = new XEngine.Signal();
            this.paused = true;
            this.pendingRestart = false;
            this.isPendingDestroy = false;
            this.destroyOnStop = autoDestroy;
        }
        Timer.prototype.update = function (deltaTimeMillis) {
            if (this.paused) {
                return;
            }
            if (this.pendingRestart) {
                this.elapsed = 0;
                this.remaining = this.duration;
                this.pendingRestart = false;
            }
            this.elapsed += deltaTimeMillis;
            this.elapsed = Math.min(this.elapsed, this.duration);
            this.remaining = this.duration - this.elapsed;
            if (this.remaining === 0) {
                if (this.loop) {
                    this.pendingRestart = true;
                }
                else {
                    this.stop();
                }
                this.onCompleted.dispatch();
            }
        };
        Timer.prototype.addTime = function (extraTime) {
            this.elapsed -= extraTime;
            if (this.elapsed -= 0) {
                this.duration += (this.elapsed * (-1));
                this.elapsed = 0;
            }
            this.remaining = this.duration - this.elapsed;
        };
        Timer.prototype.start = function () {
            this.paused = false;
        };
        Timer.prototype.pause = function () {
            this.paused = true;
        };
        Timer.prototype.resume = function () {
            this.paused = false;
        };
        Timer.prototype.stop = function () {
            this.paused = true;
            this.pendingRestart = true;
            if (this.destroyOnStop) {
                this.destroy();
            }
        };
        Timer.prototype.destroy = function () {
            this.isPendingDestroy = true;
        };
        return Timer;
    }());
    XEngine.Timer = Timer;
})(XEngine || (XEngine = {}));
var XEngine;
(function (XEngine) {
    var Signal = (function () {
        function Signal() {
            this.bindings = new Array();
        }
        Signal.prototype.add = function (listener, listenerContext) {
            var newBinding = new XEngine.SignalBinding(this, listener, listenerContext, false);
            this.bindings.push(newBinding);
            return newBinding;
        };
        Signal.prototype.addOnce = function (listener, listenerContext) {
            var newBinding = new XEngine.SignalBinding(this, listener, listenerContext, true);
            this.bindings.push(newBinding);
            return newBinding;
        };
        Signal.prototype.remove = function (listenerContext) {
            for (var i = 0; i < this.bindings.length; i++) {
                if (this.bindings[i].listenerContext === listenerContext) {
                    this.bindings.splice(i, 1);
                }
            }
        };
        Signal.prototype._destroy = function () {
            delete this.bindings;
            this.bindings = new Array();
        };
        Signal.prototype.dispatch = function () {
            var eventArguments = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                eventArguments[_i] = arguments[_i];
            }
            this._cleanup();
            for (var i = 0; i < this.bindings.length; i++) {
                this.bindings[i].dispatch.apply(this.bindings[i], arguments);
            }
        };
        Signal.prototype._cleanup = function () {
            for (var i = this.bindings.length - 1; i >= 0; i--) {
                if (this.bindings[i] == null || this.bindings[i] === undefined) {
                    this.bindings.splice(i, 1);
                }
            }
        };
        return Signal;
    }());
    XEngine.Signal = Signal;
})(XEngine || (XEngine = {}));
var XEngine;
(function (XEngine) {
    var SignalBinding = (function () {
        function SignalBinding(signal, listener, listenerContext, isOnce) {
            this.isOnce = false;
            this.signal = signal;
            this.listener = listener;
            this.listenerContext = listenerContext;
            this.isOnce = isOnce;
        }
        SignalBinding.prototype.dispatch = function () {
            this.listener.apply(this.listenerContext, arguments);
            if (this.isOnce) {
                this.detach();
            }
        };
        SignalBinding.prototype.detach = function () {
            this.signal.remove(this.listenerContext);
        };
        return SignalBinding;
    }());
    XEngine.SignalBinding = SignalBinding;
})(XEngine || (XEngine = {}));
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
var XEngine;
(function (XEngine) {
    var BitmapXMLLoader = (function () {
        function BitmapXMLLoader(imageName, imageUrl, xmlUrl, loader) {
            this.imageName = imageName;
            this.imageUrl = imageUrl;
            this.xmlUrl = xmlUrl;
            this.completed = false;
            this.loader = loader;
            this.frameWidth = 0;
            this.frameHeight = 0;
            this.oneCompleted = false;
            this.loader.image(this.imageName, this.imageUrl);
        }
        BitmapXMLLoader.prototype.load = function () {
            this.loadXML();
        };
        BitmapXMLLoader.prototype.loadXML = function () {
            var _this = this;
            var request = new XMLHttpRequest();
            request.open("GET", _this.xmlUrl, true);
            var handler = function () {
                if (request.status === 200) {
                    var returnedXML = request.responseXML;
                    _this.loader.game.cache.bitmapData[_this.imageName] = new XEngine.BitmapData(returnedXML);
                }
                _this.completed = true;
                _this.loader._notifyCompleted();
            };
            request.onload = handler;
            request.send();
        };
        return BitmapXMLLoader;
    }());
    XEngine.BitmapXMLLoader = BitmapXMLLoader;
})(XEngine || (XEngine = {}));
var XEngine;
(function (XEngine) {
    var Cache = (function () {
        function Cache(game) {
            this.game = game;
            this.images = new Array();
            this.audios = new Array();
            this.json = new Array();
            this.bitmapData = new Array();
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
            delete this.bitmapData;
            this.images = new Array();
            this.audios = new Array();
            this.json = new Array();
            this.bitmapData = new Array();
        };
        return Cache;
    }());
    XEngine.Cache = Cache;
})(XEngine || (XEngine = {}));
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
        Loader.prototype.bitmapFont = function (fontName, imageUrl, xmlUrl) {
            this.pendingLoads.push(new XEngine.BitmapXMLLoader(fontName, imageUrl, xmlUrl, this));
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
var XEngine;
(function (XEngine) {
    var GameObject = (function () {
        function GameObject(game, posX, posY) {
            if (posX === void 0) { posX = 0; }
            if (posY === void 0) { posY = 0; }
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
            var gl = this.gl;
            var indexDataBuffer = new XEngine.DataBuffer16(2 * 6);
            this.vertexBuffer = this.game.renderer.resourceManager.createBuffer(gl.ARRAY_BUFFER, this._vertDataBuffer.getByteCapacity(), gl.STREAM_DRAW);
            this.indexBuffer = this.game.renderer.resourceManager.createBuffer(gl.ELEMENT_ARRAY_BUFFER, indexDataBuffer.getByteCapacity(), gl.STATIC_DRAW);
            var indexBuffer = indexDataBuffer.uintView;
            for (var indexA = 0, indexB = 0; indexA < 6; indexA += 6, indexB += 4) {
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
        GameObject.prototype.destroy = function () {
            this.kill();
            this.isPendingDestroy = true;
            if (this.onDestroy !== undefined) {
                this.onDestroy();
            }
        };
        GameObject.prototype.onDestroy = function () { return; };
        GameObject.prototype._onInitialize = function () {
            if (this.shader) {
                if (!this.shader.compiled) {
                    this.shader.initializeShader(this.gl);
                }
                this._setBuffers();
            }
        };
        GameObject.prototype.setColor = function (value, a) {
            if (a === void 0) { a = 1.0; }
            this.color = value;
            this.alpha = a;
            this._setVertices(this.width, this.height, this.color, this._uv);
        };
        GameObject.prototype.kill = function () {
            this.alive = false;
        };
        GameObject.prototype.restore = function (posX, posY) {
            this.position.x = posX;
            this.position.y = posY;
            this.alive = true;
        };
        GameObject.prototype.getWorldMatrix = function (childMatrix) {
            this.parent.getWorldMatrix(childMatrix);
            var translation = [this.position.x, this.position.y, 0.0];
            var posX = Math.round(-(this.width * this.anchor.x));
            var posY = Math.round(-(this.height * this.anchor.y));
            if (this.fixedToCamera) {
                translation[0] += this.game.camera.position.x;
                translation[1] += this.game.camera.position.y;
            }
            mat4.translate(childMatrix, childMatrix, translation);
            mat4.rotateZ(childMatrix, childMatrix, this.rotation * XEngine.Mathf.TO_RADIANS);
            mat4.scale(childMatrix, childMatrix, [this.scale.x, this.scale.y, 1.0]);
            mat4.translate(childMatrix, childMatrix, [posX, posY, 0.0]);
            return childMatrix;
        };
        GameObject.prototype.getWorldPos = function () {
            var parentPos = this.parent.getWorldPos();
            var x = this.position.x + parentPos.x;
            var y = this.position.y + parentPos.y;
            return new XEngine.Vector(x, y);
        };
        GameObject.prototype.getTotalAlpha = function () {
            var totAlpha = this.alpha;
            if (this.parent.getTotalAlpha !== undefined) {
                totAlpha *= this.parent.getTotalAlpha();
            }
            return totAlpha;
        };
        GameObject.prototype._beginRender = function (context) {
            if (this.shader) {
                this.shader._beginRender(context);
            }
            this.game.renderer.setRenderer(null, null);
        };
        GameObject.prototype._renderToCanvas = function (context) {
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
        };
        GameObject.prototype.rendermask = function (gl) {
            gl.colorMask(false, false, false, false);
            gl.stencilFunc(gl.ALWAYS, 1, 1);
            gl.stencilOp(gl.REPLACE, gl.REPLACE, gl.REPLACE);
            gl.enable(gl.STENCIL_TEST);
            if (this.sprite) {
                var cache_image = this.game.cache.image(this.sprite);
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
        };
        GameObject.prototype.endRendermask = function (gl) {
            gl.disable(gl.STENCIL_TEST);
            gl.clear(gl.STENCIL_BUFFER_BIT);
        };
        GameObject.prototype._endRender = function (gl) {
            if (this.mask != null) {
                return;
            }
        };
        GameObject.prototype.getBounds = function () {
            var width = this.width * this.scale.x;
            var height = this.height * this.scale.y;
            var worldPos = this.getWorldPos();
            var widthAnchor = width * this.anchor.x;
            var heightAnchor = height * this.anchor.y;
            var minX = worldPos.x - widthAnchor;
            var maxX = worldPos.x + width - widthAnchor;
            var minY = worldPos.y - heightAnchor;
            var maxY = worldPos.y + height - heightAnchor;
            return {
                width: width,
                height: height,
                minX: minX,
                maxX: maxX,
                minY: minY,
                maxY: maxY,
            };
        };
        GameObject.prototype.isInsideCamera = function () {
            var bounds = this.getBounds();
            var worldPos = this.getWorldPos();
            var cameraPos = this.game.camera.position;
            var viewRect = { width: this.game.width, height: this.game.height };
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
        };
        GameObject.prototype.start = function () { return; };
        GameObject.prototype.update = function (deltaTime) { return; };
        GameObject.prototype._setVertices = function (width, height, color, uv) {
            var floatBuffer = this._vertDataBuffer.floatView;
            var uintBuffer = this._vertDataBuffer.uintView;
            var index = 0;
            var pos = new XEngine.Vector(0, 0);
            this._uv = uv;
            this.width = width;
            this.height = height;
            this.getWorldMatrix(this.mvMatrix);
            pos = pos.multiplyMatrix(this.mvMatrix);
            var alpha = this.getTotalAlpha();
            floatBuffer[index++] = pos.x;
            floatBuffer[index++] = pos.y;
            floatBuffer[index++] = uv[0];
            floatBuffer[index++] = uv[1];
            uintBuffer[index++] = color;
            floatBuffer[index++] = alpha;
            pos.setTo(0, height);
            pos = pos.multiplyMatrix(this.mvMatrix);
            floatBuffer[index++] = pos.x;
            floatBuffer[index++] = pos.y;
            floatBuffer[index++] = uv[2];
            floatBuffer[index++] = uv[3];
            uintBuffer[index++] = color;
            floatBuffer[index++] = alpha;
            pos.setTo(width, 0);
            pos = pos.multiplyMatrix(this.mvMatrix);
            floatBuffer[index++] = pos.x;
            floatBuffer[index++] = pos.y;
            floatBuffer[index++] = uv[4];
            floatBuffer[index++] = uv[5];
            uintBuffer[index++] = color;
            floatBuffer[index++] = alpha;
            pos.setTo(width, height);
            pos = pos.multiplyMatrix(this.mvMatrix);
            floatBuffer[index++] = pos.x;
            floatBuffer[index++] = pos.y;
            floatBuffer[index++] = uv[6];
            floatBuffer[index++] = uv[7];
            uintBuffer[index++] = color;
            floatBuffer[index++] = alpha;
            this.vertexBuffer.updateResource(floatBuffer, 0);
        };
        GameObject.prototype._setBuffers = function () {
            var context = this.gl;
            this.shader.bind(context);
            this.vertexBuffer.addAttribute(this.shader.vertPosAtt, 2, context.FLOAT, false, 24, 0);
            this.vertexBuffer.addAttribute(this.shader.vertUvAtt, 2, context.FLOAT, false, 24, 8);
            this.vertexBuffer.addAttribute(this.shader.vertColAtt, 3, context.UNSIGNED_BYTE, true, 24, 16);
            this.vertexBuffer.addAttribute(this.shader.vertAlphaAtt, 1, context.FLOAT, false, 24, 20);
        };
        return GameObject;
    }());
    XEngine.GameObject = GameObject;
})(XEngine || (XEngine = {}));
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
        ObjectFactory.prototype.circle = function (posX, posY, width, height) {
            var gameObject = new XEngine.Circle(this.game, posX, posY, width, height);
            return this.existing(gameObject, false, true);
        };
        ObjectFactory.prototype.rect = function (posX, posY, width, height, color) {
            var gameObject = new XEngine.Rect(this.game, posX, posY, width, height, color);
            return this.existing(gameObject, false, true);
        };
        ObjectFactory.prototype.sprite = function (posX, posY, sprite, frame) {
            var gameObject = new XEngine.Sprite(this.game, posX, posY, sprite, frame);
            return this.existing(gameObject, true, true);
        };
        ObjectFactory.prototype.image = function (posX, posY, sprite, frame) {
            var gameObject = new XEngine.Sprite(this.game, posX, posY, sprite, frame);
            return this.existing(gameObject, false, true);
        };
        ObjectFactory.prototype.bitmapText = function (posX, posY, fontName, text) {
            var gameObject = new XEngine.BitmapText(this.game, posX, posY, fontName, text);
            return this.existing(gameObject, false, true);
        };
        ObjectFactory.prototype.button = function (posX, posY, sprite, frameIdle, spriteDown, spriteOver, spriteUp) {
            var gameObject = new XEngine.Button(this.game, posX, posY, sprite, frameIdle, spriteDown, spriteOver, spriteUp);
            return this.existing(gameObject, false, true);
        };
        ObjectFactory.prototype.text = function (posX, posY, text, textStyle) {
            var gameObject = new XEngine.Text(this.game, posX, posY, text, textStyle);
            return this.existing(gameObject, true, true);
        };
        ObjectFactory.prototype.audio = function (audio, autoStart, volume) {
            var audioObject = new XEngine.Audio(this.game, audio, autoStart, volume);
            return this.existing(audioObject, true, false);
        };
        ObjectFactory.prototype.mesh = function (posX, posY) {
            var gameObject = new XEngine.Mesh(this.game, posX, posY);
            return this.existing(gameObject, true, true);
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
var XEngine;
(function (XEngine) {
    var Group = (function (_super) {
        __extends(Group, _super);
        function Group(game, posX, posY) {
            var _this = _super.call(this, game, posX, posY) || this;
            _this.children = new Array();
            return _this;
        }
        Group.prototype._beginRender = function (gl) {
            return;
        };
        Group.prototype.update = function (deltaTime) {
            this.children.removePending();
            var childLenght = this.children.length - 1;
            for (var i = childLenght; i >= 0; i--) {
                var gameObject = this.children[i];
                if (gameObject.alive) {
                    gameObject.update(deltaTime);
                    if (XEngine.Sprite.prototype.isPrototypeOf(gameObject)) {
                        gameObject._updateAnims(this.game.time.deltaTimeMillis);
                    }
                }
            }
        };
        Group.prototype.getFirstDead = function () {
            for (var i = this.children.length - 1; i >= 0; i--) {
                var gameObject = this.children[i];
                if (!gameObject.alive) {
                    return gameObject;
                }
            }
            return null;
        };
        Group.prototype.getChildAtIndex = function (index) {
            return this.children[index];
        };
        Group.prototype.childCount = function () {
            return this.children.length;
        };
        Group.prototype.destroy = function () {
            this.kill();
            this.isPendingDestroy = true;
            for (var i = this.children.length - 1; i >= 0; i--) {
                var gameObject = this.children[i];
                if (gameObject.destroy !== undefined) {
                    gameObject.destroy();
                    delete this.children[i];
                }
            }
            this.children = [];
            if (this.onDestroy !== undefined) {
                this.onDestroy();
            }
        };
        Group.prototype.add = function (gameObject) {
            if (this.game.updateQueue.indexOf(gameObject) >= 0) {
                var index = this.game.updateQueue.indexOf(gameObject);
                this.game.updateQueue.splice(index, 1);
            }
            if (this.game.renderQueue.indexOf(gameObject) >= 0) {
                var index = this.game.renderQueue.indexOf(gameObject);
                this.game.renderQueue.splice(index, 1);
            }
            if (gameObject.parent.constructor === XEngine.Group && gameObject.parent.children.indexOf(gameObject) >= 0) {
                var index = gameObject.parent.children.indexOf(gameObject);
                gameObject.parent.children.splice(index, 1);
            }
            this.children.push(gameObject);
            if (gameObject.start !== undefined) {
                gameObject.start();
            }
            gameObject.parent = this;
            return gameObject;
        };
        Group.prototype.setAll = function (property, value) {
            for (var i = this.children.length - 1; i >= 0; i--) {
                this.children[i][property] = value;
            }
        };
        Group.prototype.callAll = function (funct) {
            for (var i = this.children.length - 1; i >= 0; i--) {
                if (this.children[i][funct] !== undefined) {
                    this.children[i][funct]();
                }
            }
        };
        return Group;
    }(XEngine.GameObject));
    XEngine.Group = Group;
})(XEngine || (XEngine = {}));
var XEngine;
(function (XEngine) {
    var Animation = (function () {
        function Animation(game, sprite, frames, rate) {
            this.rate = rate;
            this.currentFrame = 0;
            this.loop = false;
            this.playing = false;
            this.onComplete = new XEngine.Signal();
            this.game = game;
            this.sprite = sprite;
            this.frames = frames;
            this.maxFrames = frames.length - 1;
            this.frameTime = 0;
        }
        Animation.prototype.update = function (deltaMillis) {
            this.frameTime += deltaMillis;
            if (this.frameTime >= this.rate) {
                this.currentFrame++;
                this.frameTime = 0;
                if (this.currentFrame > this.maxFrames) {
                    if (this.loop) {
                        this.currentFrame = 0;
                    }
                    else {
                        this.stop();
                        this.onComplete.dispatch();
                        return;
                    }
                }
            }
            this.sprite.frame = this.frames[this.currentFrame];
        };
        Animation.prototype.start = function () {
            this.playing = true;
        };
        Animation.prototype.stop = function () {
            this.playing = false;
            this.frameTime = 0;
            this.currentFrame = 0;
        };
        return Animation;
    }());
    XEngine.Animation = Animation;
})(XEngine || (XEngine = {}));
var XEngine;
(function (XEngine) {
    var AnimationManager = (function () {
        function AnimationManager(game, sprite) {
            this.game = game;
            this.sprite = sprite;
            this.animations = new Array();
            this.currentAnimation = null;
        }
        AnimationManager.prototype.update = function (deltaMillis) {
            if (this.currentAnimation && this.currentAnimation.playing) {
                this.currentAnimation.update(deltaMillis);
            }
        };
        AnimationManager.prototype.play = function (animName) {
            if (this.currentAnimation && this.animations[animName] !== this.currentAnimation) {
                this.currentAnimation.stop();
            }
            var anim = this.animations[animName];
            if (!anim) {
                return;
            }
            this.currentAnimation = anim;
            anim.start();
            return this.currentAnimation;
        };
        AnimationManager.prototype.stop = function (animName) {
            var anim = this.animations[animName];
            if (!anim) {
                return;
            }
            this.currentAnimation = null;
            anim.stop();
        };
        AnimationManager.prototype.add = function (animName, frames, rate, loop) {
            if (loop === void 0) { loop = false; }
            var anim = new XEngine.Animation(this.game, this.sprite, frames, rate);
            anim.loop = loop;
            this.animations[animName] = anim;
        };
        return AnimationManager;
    }());
    XEngine.AnimationManager = AnimationManager;
})(XEngine || (XEngine = {}));
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
var XEngine;
(function (XEngine) {
    var Circle = (function (_super) {
        __extends(Circle, _super);
        function Circle(game, posX, posY, width, height) {
            var _this = _super.call(this, game, posX, posY) || this;
            _this.width = width;
            _this.height = height;
            _this.shader = _this.game.resourceManager.createMaterial(XEngine.CircleMat, "circleShader");
            return _this;
        }
        Circle.prototype.getBounds = function () {
            var width = this.width * this.scale.x;
            var height = this.height * this.scale.y;
            return {
                width: width,
                height: height,
            };
        };
        return Circle;
    }(XEngine.GameObject));
    XEngine.Circle = Circle;
})(XEngine || (XEngine = {}));
var XEngine;
(function (XEngine) {
    var Rect = (function (_super) {
        __extends(Rect, _super);
        function Rect(game, posX, posY, width, height, color) {
            var _this = _super.call(this, game, posX, posY) || this;
            _this.width = width;
            _this.height = height;
            _this.shader = _this.game.resourceManager.createMaterial(XEngine.SimpleColorMat, "colorShader");
            _this.setColor(color);
            return _this;
        }
        Rect.prototype._beginRender = function (gl) {
            return;
        };
        Rect.prototype._renderToCanvas = function (gl) {
            this.game.renderer.rectBatch.addRect(this, this.shader);
        };
        return Rect;
    }(XEngine.GameObject));
    XEngine.Rect = Rect;
})(XEngine || (XEngine = {}));
var XEngine;
(function (XEngine) {
    var Sprite = (function (_super) {
        __extends(Sprite, _super);
        function Sprite(game, posX, posY, sprite, frame) {
            var _this = _super.call(this, game, posX, posY) || this;
            _this.sprite = sprite;
            _this.game = game;
            _this.frame = frame || 0;
            var cache_image = _this.game.cache.image(sprite);
            _this.width = cache_image.frameWidth || 10;
            _this.height = cache_image.frameHeight || 10;
            _this.columns = Math.floor(cache_image.image.width / _this.width);
            _this.rows = Math.floor(cache_image.image.height / _this.height);
            _this.tilled = false;
            if (_this.game.cache.getJson(sprite) !== undefined) {
                _this.json = _this.game.cache.getJson(sprite);
                var frameInfo = void 0;
                if (typeof _this.frame === "string") {
                    frameInfo = _this.json[_this.frame];
                }
                else {
                    frameInfo = _this.json.frames[_this.frame];
                }
                _this.width = frameInfo.frame.w;
                _this.height = frameInfo.frame.h;
            }
            if (_this.columns > 1 || _this.rows > 1 || _this.json !== undefined) {
                _this.tilled = true;
            }
            _this.position.setTo(posX, posY);
            _this.shader = _this.game.renderer.spriteBatch.shader;
            _this.animation = new XEngine.AnimationManager(game, _this);
            return _this;
        }
        Sprite.prototype._beginRender = function (gl) {
            return;
        };
        Sprite.prototype._renderToCanvas = function (gl) {
            if (this.tilled) {
                var startX = 0;
                var startY = 0;
                var endX = 0;
                var endY = 0;
                var cache_image = this.game.cache.image(this.sprite);
                if (this.json) {
                    var frameInfo = void 0;
                    if (typeof this.frame === "string") {
                        frameInfo = this.json[this.frame];
                    }
                    else {
                        frameInfo = this.json.frames[this.frame];
                    }
                    var width = frameInfo.frame.w;
                    var height = frameInfo.frame.h;
                    startX = frameInfo.frame.x;
                    startY = frameInfo.frame.y;
                    endX = startX + width;
                    endY = startY + height;
                    this.width = width;
                    this.height = height;
                }
                else {
                    var column = this.frame;
                    if (column > this.columns - 1) {
                        column = this.frame % this.columns;
                    }
                    var row = Math.floor(this.frame / this.columns);
                    startX = column * cache_image.frameWidth;
                    startY = row * cache_image.frameHeight;
                    endX = startX + cache_image.frameWidth;
                    endY = startY + cache_image.frameHeight;
                }
                var startUvX = startX / cache_image.image.width;
                var startUvY = startY / cache_image.image.height;
                var endUvX = endX / cache_image.image.width;
                var endUvY = endY / cache_image.image.height;
                this._uv = [
                    startUvX, startUvY,
                    startUvX, endUvY,
                    endUvX, startUvY,
                    endUvX, endUvY,
                ];
            }
            this.game.renderer.spriteBatch.addSprite(this, this.shader);
        };
        Sprite.prototype.reset = function (x, y) {
            this.position.x = x;
            this.position.y = y;
            this.alive = true;
            if (this.start !== undefined) {
                this.start();
            }
            if (this.body) {
                this.body.velocity = new XEngine.Vector(0, 0);
            }
        };
        Sprite.prototype._updateAnims = function (deltaMillis) {
            this.animation.update(deltaMillis);
        };
        return Sprite;
    }(XEngine.GameObject));
    XEngine.Sprite = Sprite;
})(XEngine || (XEngine = {}));
var XEngine;
(function (XEngine) {
    var BitmapText = (function (_super) {
        __extends(BitmapText, _super);
        function BitmapText(game, posX, posY, fontName, text) {
            var _this = _super.call(this, game, posX, posY) || this;
            _this.sprite = fontName;
            _this.game = game;
            _this.width = 10;
            _this.height = 10;
            _this.bitmapData = _this.game.cache.bitmapData[fontName];
            var cache_image = _this.game.cache.image(fontName);
            _this.atlasWidth = cache_image.frameWidth || 10;
            _this.atlasHeight = cache_image.frameHeight || 10;
            _this.position.setTo(posX, posY);
            _this.shader = _this.game.renderer.spriteBatch.shader;
            _this.setText(text);
            return _this;
        }
        BitmapText.prototype.setText = function (text) {
            delete this.spriteArrays;
            this.text = text;
            var charArray = text.split("");
            this.spriteArrays = new Array(charArray.length);
            var startX = 0;
            var startY = 0;
            var maxX = 0;
            for (var i = 0; i < charArray.length; i++) {
                var char = charArray[i];
                if (char !== undefined) {
                    var charCode = char.charCodeAt(0);
                    var charData = this.bitmapData.chars[charCode];
                    if (charData != null) {
                        if (charCode !== 32 && charCode !== 10) {
                            if (i !== 0) {
                                var prevCharCode = charArray[i - 1].charCodeAt(0);
                                if (this.bitmapData.kerning[prevCharCode] !== undefined && this.bitmapData.kerning[prevCharCode][charCode] !== undefined) {
                                    startX += this.bitmapData.kerning[prevCharCode][charCode];
                                }
                            }
                            var newSprite = new XEngine.Sprite(this.game, startX + charData.xoffset, startY + charData.yoffset, this.sprite, 0);
                            var uvs = [
                                charData.x / this.atlasWidth, charData.y / this.atlasHeight,
                                charData.x / this.atlasWidth, (charData.y + charData.height) / this.atlasHeight,
                                (charData.x + charData.width) / this.atlasWidth, charData.y / this.atlasHeight,
                                (charData.x + charData.width) / this.atlasWidth, (charData.y + charData.height) / this.atlasHeight,
                            ];
                            newSprite._setVertices(charData.width, charData.height, newSprite.color, uvs);
                            newSprite.shader = this.shader;
                            newSprite.parent = this;
                            this.spriteArrays.push(newSprite);
                            startX += charData.xadvance;
                        }
                        else if (charCode === 32) {
                            startX += charData.xadvance;
                        }
                        if (startX > maxX) {
                            maxX = startX;
                        }
                    }
                    else if (charCode === 10) {
                        startY += this.bitmapData.lineHeight;
                        if (startX > startX) {
                            maxX = startX;
                        }
                        startX = 0;
                    }
                    else if (charCode === 32) {
                        startX += 20;
                    }
                }
                this.width = maxX;
                this.height = startY + this.bitmapData.lineHeight;
            }
        };
        BitmapText.prototype._beginRender = function (gl) {
            return;
        };
        BitmapText.prototype._renderToCanvas = function (gl) {
            for (var _i = 0, _a = this.spriteArrays; _i < _a.length; _i++) {
                var spriteToAdd = _a[_i];
                if (spriteToAdd !== undefined) {
                    this.game.renderer.spriteBatch.addSprite(spriteToAdd, this.shader);
                }
            }
        };
        BitmapText.prototype.reset = function (x, y) {
            this.position.x = x;
            this.position.y = y;
            this.alive = true;
            if (this.start !== undefined) {
                this.start();
            }
            if (this.body) {
                this.body.velocity = new XEngine.Vector(0, 0);
            }
        };
        return BitmapText;
    }(XEngine.GameObject));
    XEngine.BitmapText = BitmapText;
})(XEngine || (XEngine = {}));
var XEngine;
(function (XEngine) {
    var Button = (function (_super) {
        __extends(Button, _super);
        function Button(game, posX, posY, sprite, frameIdle, frameDown, frameOver, frameUp) {
            var _this = _super.call(this, game, posX, posY, sprite, frameIdle) || this;
            _this.frameIdle = frameIdle || sprite;
            _this.frameDown = frameDown || _this.frameIdle;
            _this.frameOver = frameOver || _this.frameIdle;
            _this.frameUp = frameUp || _this.frameIdle;
            _this.inputEnabled = true;
            var me = _this;
            _this.onInputDown.add(function () { me.swapSprite(me.frameDown); }, _this);
            _this.onInputOver.add(function () {
                if (!me.isInputDown) {
                    me.swapSprite(me.frameOver);
                }
            }, _this);
            _this.onInputLeft.add(function () {
                if (!me.isInputDown) {
                    me.swapSprite(me.frameIdle);
                }
            }, _this);
            _this.onInputUp.add(function () {
                if (!me.isInputOver) {
                    me.swapSprite(me.frameUp);
                }
                else {
                    me.swapSprite(me.frameOver);
                }
            }, _this);
            return _this;
        }
        Button.prototype.swapSprite = function (sprite) {
            if (!this.tilled) {
                this.sprite = sprite;
                var new_image = this.game.cache.image(this.sprite).image;
                this.width = new_image.width || 10;
                this.height = new_image.height || 10;
            }
            else {
                this.frame = sprite;
                if (this.game.cache.getJson(sprite) !== undefined) {
                    this.json = this.game.cache.getJson(sprite);
                    var frameInfo = void 0;
                    if (typeof this.frame === "string") {
                        frameInfo = this.json[this.frame];
                    }
                    else {
                        frameInfo = this.json.frames[this.frame];
                    }
                    this.width = frameInfo.frame.w;
                    this.height = frameInfo.frame.h;
                }
            }
        };
        return Button;
    }(XEngine.Sprite));
    XEngine.Button = Button;
})(XEngine || (XEngine = {}));
var XEngine;
(function (XEngine) {
    var Text = (function (_super) {
        __extends(Text, _super);
        function Text(game, posX, posY, text, textStyle) {
            var _this = _super.call(this, game, posX, posY) || this;
            textStyle = textStyle || {};
            _this.font = textStyle.font || "Arial";
            _this.size = textStyle.font_size || 12;
            _this.textColor = textStyle.font_color || "white";
            _this.style = "";
            _this.strokeWidth = textStyle.stroke_width || 0;
            _this.strokeColor = textStyle.stroke_color || "black";
            _this.canvas = document.createElement("canvas");
            _this.context = _this.canvas.getContext("2d");
            _this.context.save();
            _this.context.font = _this.size + "px " + _this.font;
            var textSize = _this.context.measureText(_this.text);
            _this.context.restore();
            _this.width = textSize.width;
            _this.height = _this.size;
            _this.shader = _this.game.resourceManager.createMaterial(XEngine.SpriteMat, "spriteShader");
            _this.setText(text);
            return _this;
        }
        Text.prototype._beginRender = function (context) {
            this.updateText();
            _super.prototype._beginRender.call(this, context);
            this.shader._setTexture(this.texture);
            this.shader._beginRender(context);
        };
        Text.prototype._renderToCanvas = function (context) {
            if (this.shader == null) {
                return;
            }
            _super.prototype._renderToCanvas.call(this, context);
        };
        Text.prototype.setText = function (text) {
            this.isDirty = true;
            this.text = text;
        };
        Text.prototype.getBounds = function () {
            var width = this.width * this.scale.x;
            var height = this.height * this.scale.y;
            return {
                width: width,
                height: height,
            };
        };
        Text.prototype.updateText = function () {
            this.context.globalAlpha = this.alpha;
            var font = this.style + " " + this.size + "px " + this.font;
            this.context.font = font.trim();
            var textSize = this.context.measureText(this.text);
            this.width = textSize.width;
            this.height = this.size;
            this.canvas.width = textSize.width;
            this.canvas.height = this.height;
            this.context.font = font.trim();
            if (this.strokeWidth > 0) {
                this.context.strokeStyle = this.strokeColor;
                this.context.lineWidth = this.strokeWidth;
                this.context.strokeText(this.text, 0, this.height);
            }
            this.context.fillStyle = this.textColor;
            this.context.textBaseline = "top";
            this.context.textAlign = "left";
            this.context.fillText(this.text, 0, 0);
            var texture = new XEngine.Texture2D("textTexture", this.width, this.height, XEngine.WRAP_MODE.CLAMP);
            texture.image = this.context.canvas;
            texture.createTexture(this.game.context);
            this.texture = texture._texture;
            this._setVertices(this.width, this.height, this.color, this._uv);
        };
        return Text;
    }(XEngine.GameObject));
    XEngine.Text = Text;
})(XEngine || (XEngine = {}));
var XEngine;
(function (XEngine) {
    var Mesh = (function (_super) {
        __extends(Mesh, _super);
        function Mesh(game, posX, posY) {
            var _this = _super.call(this, game, posX, posY) || this;
            _this.indexDataBuffer = new XEngine.DataBuffer16(2 * 3);
            _this.vertDataBuffer = new XEngine.DataBuffer32(26 * 4);
            _this.game = game;
            _this.vertexBuffer = _this.game.renderer.resourceManager.createBuffer(_this.gl.ARRAY_BUFFER, _this.vertDataBuffer.getByteCapacity(), _this.gl.STREAM_DRAW);
            _this.indexBuffer = _this.game.renderer.resourceManager.createBuffer(_this.gl.ELEMENT_ARRAY_BUFFER, _this.indexDataBuffer.getByteCapacity(), _this.gl.STREAM_DRAW);
            _this.shader = _this.game.renderer.spriteBatch.shader;
            return _this;
        }
        Mesh.prototype._beginRender = function (gl) {
            return;
        };
        Mesh.prototype.setVertices = function (vertices, indices, uv, vertColors) {
            this.vertDataBuffer.clear();
            this.indexDataBuffer.clear();
            this.vertDataBuffer = new XEngine.DataBuffer32(26 * vertices.length);
            this.indexDataBuffer = new XEngine.DataBuffer16(2 * indices.length);
            var floatBuffer = this.vertDataBuffer.getUsedBufferAsFloat();
            var uintBuffer = this.vertDataBuffer.getUsedBufferAsUint();
            var uintIndexBuffer = this.indexDataBuffer.getUsedBufferAsUint();
            var index = 0;
            var pos = new XEngine.Vector(0, 0);
            this.getWorldMatrix(this.mvMatrix);
            pos = pos.multiplyMatrix(this.mvMatrix);
            var alpha = this.getTotalAlpha();
            for (var vertex in vertices) {
                floatBuffer[index++] = vertices[vertex].x;
                floatBuffer[index++] = vertices[vertex].y;
                floatBuffer[index++] = vertices[vertex].z;
                var x = 0;
                var y = 0;
                if (uv !== undefined) {
                    x = uv[vertex].x;
                    y = uv[vertex].y;
                }
                floatBuffer[index++] = uv[vertex].x;
                floatBuffer[index++] = uv[vertex].y;
                if (vertColors !== undefined) {
                    uintBuffer[index++] = vertColors[vertex];
                }
                else {
                    uintBuffer[index++] = 0xffffff;
                }
                floatBuffer[index++] = alpha;
            }
            index = 0;
            for (var i = 0; i < indices.length; i++) {
                uintIndexBuffer[i] = indices[i];
            }
            this.vertexBuffer.updateResource(floatBuffer, 0);
            this.indexBuffer.updateResource(uintIndexBuffer, 0);
        };
        Mesh.prototype._renderToCanvas = function (gl) {
            var vertexDataBuffer = this._vertDataBuffer;
            this.shader.bind(this.gl);
            this.shader.baseUniforms.pMatrix.value = this.game.camera.pMatrix;
            this.shader.updateUniforms(this.gl);
            this.vertexBuffer.bind();
            this.indexBuffer.bind();
            gl.drawElements(gl.TRIANGLES, vertexDataBuffer.wordLength, gl.UNSIGNED_SHORT, 0);
        };
        Mesh.prototype.reset = function (x, y) {
            this.position.x = x;
            this.position.y = y;
            this.alive = true;
            if (this.start !== undefined) {
                this.start();
            }
            if (this.body) {
                this.body.velocity = new XEngine.Vector(0, 0);
            }
        };
        return Mesh;
    }(XEngine.GameObject));
    XEngine.Mesh = Mesh;
})(XEngine || (XEngine = {}));
var XEngine;
(function (XEngine) {
    var IHash = (function () {
        function IHash() {
        }
        return IHash;
    }());
    XEngine.IHash = IHash;
    var BitmapChar = (function () {
        function BitmapChar(x, y, width, height, xoffset, yoffset, xadvance) {
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
            this.xoffset = xoffset;
            this.yoffset = yoffset;
            this.xadvance = xadvance;
        }
        return BitmapChar;
    }());
    XEngine.BitmapChar = BitmapChar;
    var BitmapData = (function () {
        function BitmapData(xmlDoc) {
            this.chars = new IHash();
            this.kerning = new IHash();
            var charsNode = xmlDoc.children[0].getElementsByTagName("chars")[0];
            var commonNode = xmlDoc.children[0].getElementsByTagName("common")[0];
            var charCount = Number(charsNode.getAttribute("count"));
            var charsArray = charsNode.children;
            this.lineHeight = Number(commonNode.getAttribute("lineHeight"));
            for (var i = 0; i < charCount; i++) {
                var id = Number(charsArray[i].getAttribute("id"));
                var x = Number(charsArray[i].getAttribute("x"));
                var y = Number(charsArray[i].getAttribute("y"));
                var width = Number(charsArray[i].getAttribute("width"));
                var height = Number(charsArray[i].getAttribute("height"));
                var xoffset = Number(charsArray[i].getAttribute("xoffset"));
                var yoffset = Number(charsArray[i].getAttribute("yoffset"));
                var xadvance = Number(charsArray[i].getAttribute("xadvance"));
                this.chars[id] = new BitmapChar(x, y, width, height, xoffset, yoffset, xadvance);
            }
            var kerningNode = xmlDoc.children[0].getElementsByTagName("kernings")[0];
            if (kerningNode !== undefined) {
                var kerningCount = Number(kerningNode.getAttribute("count"));
                var kerningArray = kerningNode.children;
                for (var i = 0; i < kerningCount; i++) {
                    var first = Number(kerningArray[i].getAttribute("first"));
                    var second = Number(kerningArray[i].getAttribute("second"));
                    var amount = Number(kerningArray[i].getAttribute("amount"));
                    if (this.kerning[first] === undefined) {
                        this.kerning[first] = new IHash();
                    }
                    this.kerning[first][second] = amount;
                }
            }
        }
        return BitmapData;
    }());
    XEngine.BitmapData = BitmapData;
})(XEngine || (XEngine = {}));
var XEngine;
(function (XEngine) {
    var InputManager = (function () {
        function InputManager(game) {
            this.game = game;
            this.onKeyDown = new XEngine.Signal();
            this.onKeyUp = new XEngine.Signal();
            this.onClick = new XEngine.Signal();
            this.onInputDown = new XEngine.Signal();
            this.onInputUp = new XEngine.Signal();
            this.onInputMove = new XEngine.Signal();
            this.pointerDown = false;
            this.pointer = new XEngine.Vector(0);
            var _this = this;
            document.addEventListener("keydown", function (event) {
                _this.keyDownHandler.call(_this, event);
            });
            document.addEventListener("keyup", function (event) {
                _this.keyUpHandler.call(_this, event);
            });
            if (this.game.isMobile) {
                this.game.canvas.addEventListener("touchstart", function (event) {
                    _this.inputDownHandler.call(_this, event);
                });
                this.game.canvas.addEventListener("touchend", function (event) {
                    _this.inputUpHandler.call(_this, event);
                });
                this.game.canvas.addEventListener("touchmove", function (event) {
                    _this.inputMoveHandler.call(_this, event);
                });
            }
            else {
                this.game.canvas.addEventListener("mousedown", function (event) {
                    _this.inputDownHandler.call(_this, event);
                });
                this.game.canvas.addEventListener("mouseup", function (event) {
                    _this.inputUpHandler.call(_this, event);
                });
                this.game.canvas.addEventListener("mousemove", function (event) {
                    _this.inputMoveHandler.call(_this, event);
                });
                this.game.canvas.addEventListener("click", function (event) {
                    _this.clickHandler.call(_this, event);
                });
            }
            this._initializeKeys();
        }
        InputManager.prototype._initializeKeys = function () {
            this.keysPressed = new Array();
            for (var item in XEngine.KEY_CODE) {
                this.keysPressed[item] = false;
            }
        };
        InputManager.prototype.isPressed = function (keyCode) {
            return this.keysPressed[keyCode];
        };
        InputManager.prototype.reset = function () {
            this.onKeyUp._destroy();
            this.onKeyDown._destroy();
            this.onClick._destroy();
            this.onInputDown._destroy();
            this.onInputUp._destroy();
            this.onInputMove._destroy();
            this._initializeKeys();
        };
        InputManager.prototype.keyDownHandler = function (event) {
            if (!this.keysPressed[event.keyCode]) {
                this.keysPressed[event.keyCode] = true;
                this.onKeyDown.dispatch(event);
            }
        };
        InputManager.prototype.keyUpHandler = function (event) {
            this.keysPressed[event.keyCode] = false;
            this.onKeyUp.dispatch(event);
        };
        InputManager.prototype.inputDownHandler = function () {
            this.pointerDown = true;
            var inputPos = this.getInputPosition(event);
            this.pointer.x = inputPos.position.x;
            this.pointer.y = inputPos.position.y;
            this.onInputDown.dispatch(inputPos);
            var _this = this;
            var loop = function (array) {
                for (var i = array.length - 1; i >= 0; i--) {
                    var gameObject = array[i];
                    if (XEngine.Group.prototype.isPrototypeOf(gameObject)) {
                        if (loop(gameObject.children)) {
                            return true;
                        }
                    }
                    else {
                        if (!gameObject.inputEnabled) {
                            continue;
                        }
                        if (_this._pointerInsideBounds(gameObject)) {
                            if (gameObject.onInputDown === undefined) {
                                gameObject.onInputDown = new XEngine.Signal();
                            }
                            gameObject.onInputDown.dispatch(event);
                            gameObject.isInputDown = true;
                            gameObject.downPos.setTo(inputPos.position.x, inputPos.position.y);
                            gameObject.posWhenDown.setTo(gameObject.position.x, gameObject.position.y);
                            return true;
                        }
                    }
                }
                return false;
            };
            loop(this.game.updateQueue);
        };
        InputManager.prototype.inputUpHandler = function () {
            this.pointerDown = false;
            var newEvent = {
                position: {
                    x: this.pointer.x,
                    y: this.pointer.y,
                },
            };
            if (this.game.isMobile) {
                this.clickDispatcher(newEvent);
            }
            this.onInputUp.dispatch(newEvent);
            var _this = this;
            var loop = function (array) {
                for (var i = array.length - 1; i >= 0; i--) {
                    var gameObject = array[i];
                    if (XEngine.Group.prototype.isPrototypeOf(gameObject)) {
                        loop(gameObject.children);
                    }
                    else {
                        if (!gameObject.inputEnabled) {
                            continue;
                        }
                        if (gameObject.isInputDown) {
                            if (gameObject.onInputUp === undefined) {
                                gameObject.onInputUp = new XEngine.Signal();
                            }
                            gameObject.onInputUp.dispatch(event);
                            gameObject.isInputDown = false;
                            return true;
                        }
                    }
                }
            };
            loop(this.game.updateQueue);
        };
        InputManager.prototype.inputMoveHandler = function () {
            var inputPos = this.getInputPosition(event);
            this.pointer.x = inputPos.position.x;
            this.pointer.y = inputPos.position.y;
            var _this = this;
            var loop = function (array) {
                for (var i = array.length - 1; i >= 0; i--) {
                    var gameObject = array[i];
                    if (XEngine.Group.prototype.isPrototypeOf(gameObject)) {
                        loop(gameObject.children);
                    }
                    else {
                        if (!gameObject.inputEnabled) {
                            continue;
                        }
                        if (_this._pointerInsideBounds(gameObject)) {
                            if (!gameObject.isInputOver) {
                                if (gameObject.onInputOver === undefined) {
                                    gameObject.onInputOver = new XEngine.Signal();
                                }
                                gameObject.onInputOver.dispatch(event);
                                gameObject.isInputOver = true;
                            }
                        }
                        else if (gameObject.isInputOver) {
                            if (gameObject.onInputLeft === undefined) {
                                gameObject.onInputLeft = new XEngine.Signal();
                            }
                            gameObject.onInputLeft.dispatch(event);
                            gameObject.isInputOver = false;
                        }
                        if (gameObject.pickeable && gameObject.isInputDown) {
                            gameObject.position.setTo(gameObject.posWhenDown.x - (gameObject.downPos.x - inputPos.position.x), gameObject.posWhenDown.y - (gameObject.downPos.y - inputPos.position.y));
                        }
                    }
                }
            };
            this.onInputMove.dispatch(inputPos);
            loop(this.game.updateQueue);
        };
        InputManager.prototype.clickHandler = function (event) {
            var inputPos = this.getInputPosition(event);
            this.clickDispatcher(inputPos);
        };
        InputManager.prototype.clickDispatcher = function (event) {
            this.onClick.dispatch(event);
            var _this = this;
            var loop = function (array) {
                for (var i = array.length - 1; i >= 0; i--) {
                    var gameObject = array[i];
                    if (XEngine.Group.prototype.isPrototypeOf(gameObject)) {
                        if (loop(gameObject.children)) {
                            return true;
                        }
                    }
                    else {
                        if (gameObject || gameObject.inputEnabled) {
                            if (_this._pointerInsideBounds(gameObject)) {
                                if (gameObject.onClick === undefined) {
                                    gameObject.onClick = new XEngine.Signal();
                                }
                                gameObject.onClick.dispatch(event);
                                return true;
                            }
                        }
                    }
                }
                return false;
            };
            loop(this.game.updateQueue);
        };
        InputManager.prototype._pointerInsideBounds = function (gameObject) {
            if (gameObject.getBounds !== undefined) {
                var bounds = gameObject.getBounds();
                var worldPos = gameObject.getWorldPos();
                if (this.pointer.x < (worldPos.x - bounds.width * gameObject.anchor.x)
                    || this.pointer.x > (worldPos.x + bounds.width * (1 - gameObject.anchor.x))) {
                    return false;
                }
                else if (this.pointer.y < (worldPos.y - bounds.height * gameObject.anchor.y)
                    || this.pointer.y > (worldPos.y + bounds.height * (1 - gameObject.anchor.y))) {
                    return false;
                }
                else {
                    return true;
                }
            }
            else {
                return false;
            }
        };
        InputManager.prototype.getInputPosition = function (event) {
            var rect = this.game.canvas.getBoundingClientRect();
            var newEvent = {
                position: {
                    x: event.pageX - (document.documentElement.scrollLeft || document.body.scrollLeft) - rect.left,
                    y: event.pageY - (document.documentElement.scrollTop || document.body.scrollTop) - rect.top,
                },
            };
            if (this.game.isMobile) {
                newEvent = {
                    position: {
                        x: event.touches[0].pageX - (document.documentElement.scrollLeft || document.body.scrollLeft) - rect.left,
                        y: event.touches[0].pageY - (document.documentElement.scrollTop || document.body.scrollTop) - rect.top,
                    },
                };
            }
            newEvent.position.x /= this.game.renderer.scale.x;
            newEvent.position.y /= this.game.renderer.scale.y;
            return newEvent;
        };
        return InputManager;
    }());
    XEngine.InputManager = InputManager;
})(XEngine || (XEngine = {}));
var XEngine;
(function (XEngine) {
    var KEY_CODE;
    (function (KEY_CODE) {
        KEY_CODE[KEY_CODE["BACKSPACE"] = 8] = "BACKSPACE";
        KEY_CODE[KEY_CODE["TAB"] = 9] = "TAB";
        KEY_CODE[KEY_CODE["ENTER"] = 13] = "ENTER";
        KEY_CODE[KEY_CODE["SHIFT"] = 16] = "SHIFT";
        KEY_CODE[KEY_CODE["CTRL"] = 17] = "CTRL";
        KEY_CODE[KEY_CODE["ALT"] = 18] = "ALT";
        KEY_CODE[KEY_CODE["PAUSE"] = 19] = "PAUSE";
        KEY_CODE[KEY_CODE["CAPS_LOCK"] = 20] = "CAPS_LOCK";
        KEY_CODE[KEY_CODE["ESC"] = 27] = "ESC";
        KEY_CODE[KEY_CODE["SPACE"] = 32] = "SPACE";
        KEY_CODE[KEY_CODE["PAGE_UP"] = 33] = "PAGE_UP";
        KEY_CODE[KEY_CODE["PAGE_DOWN"] = 34] = "PAGE_DOWN";
        KEY_CODE[KEY_CODE["END"] = 35] = "END";
        KEY_CODE[KEY_CODE["HOME"] = 36] = "HOME";
        KEY_CODE[KEY_CODE["LEFT"] = 37] = "LEFT";
        KEY_CODE[KEY_CODE["UP"] = 38] = "UP";
        KEY_CODE[KEY_CODE["RIGHT"] = 39] = "RIGHT";
        KEY_CODE[KEY_CODE["DOWN"] = 40] = "DOWN";
        KEY_CODE[KEY_CODE["PRINT_SCREEN"] = 42] = "PRINT_SCREEN";
        KEY_CODE[KEY_CODE["INSERT"] = 45] = "INSERT";
        KEY_CODE[KEY_CODE["DELETE"] = 46] = "DELETE";
        KEY_CODE[KEY_CODE["ZERO"] = 48] = "ZERO";
        KEY_CODE[KEY_CODE["ONE"] = 49] = "ONE";
        KEY_CODE[KEY_CODE["TWO"] = 50] = "TWO";
        KEY_CODE[KEY_CODE["THREE"] = 51] = "THREE";
        KEY_CODE[KEY_CODE["FOUR"] = 52] = "FOUR";
        KEY_CODE[KEY_CODE["FIVE"] = 53] = "FIVE";
        KEY_CODE[KEY_CODE["SIX"] = 54] = "SIX";
        KEY_CODE[KEY_CODE["SEVEN"] = 55] = "SEVEN";
        KEY_CODE[KEY_CODE["EIGHT"] = 56] = "EIGHT";
        KEY_CODE[KEY_CODE["NINE"] = 57] = "NINE";
        KEY_CODE[KEY_CODE["A"] = 65] = "A";
        KEY_CODE[KEY_CODE["B"] = 66] = "B";
        KEY_CODE[KEY_CODE["C"] = 67] = "C";
        KEY_CODE[KEY_CODE["D"] = 68] = "D";
        KEY_CODE[KEY_CODE["E"] = 69] = "E";
        KEY_CODE[KEY_CODE["F"] = 70] = "F";
        KEY_CODE[KEY_CODE["G"] = 71] = "G";
        KEY_CODE[KEY_CODE["H"] = 72] = "H";
        KEY_CODE[KEY_CODE["I"] = 73] = "I";
        KEY_CODE[KEY_CODE["J"] = 74] = "J";
        KEY_CODE[KEY_CODE["K"] = 75] = "K";
        KEY_CODE[KEY_CODE["L"] = 76] = "L";
        KEY_CODE[KEY_CODE["M"] = 77] = "M";
        KEY_CODE[KEY_CODE["N"] = 78] = "N";
        KEY_CODE[KEY_CODE["O"] = 79] = "O";
        KEY_CODE[KEY_CODE["P"] = 80] = "P";
        KEY_CODE[KEY_CODE["Q"] = 81] = "Q";
        KEY_CODE[KEY_CODE["R"] = 82] = "R";
        KEY_CODE[KEY_CODE["S"] = 83] = "S";
        KEY_CODE[KEY_CODE["T"] = 84] = "T";
        KEY_CODE[KEY_CODE["U"] = 85] = "U";
        KEY_CODE[KEY_CODE["V"] = 86] = "V";
        KEY_CODE[KEY_CODE["W"] = 87] = "W";
        KEY_CODE[KEY_CODE["X"] = 88] = "X";
        KEY_CODE[KEY_CODE["Y"] = 89] = "Y";
        KEY_CODE[KEY_CODE["Z"] = 90] = "Z";
        KEY_CODE[KEY_CODE["PAD0"] = 96] = "PAD0";
        KEY_CODE[KEY_CODE["PAD1"] = 97] = "PAD1";
        KEY_CODE[KEY_CODE["PAD2"] = 98] = "PAD2";
        KEY_CODE[KEY_CODE["PAD3"] = 99] = "PAD3";
        KEY_CODE[KEY_CODE["PAD4"] = 100] = "PAD4";
        KEY_CODE[KEY_CODE["PAD5"] = 101] = "PAD5";
        KEY_CODE[KEY_CODE["PAD6"] = 102] = "PAD6";
        KEY_CODE[KEY_CODE["PAD7"] = 103] = "PAD7";
        KEY_CODE[KEY_CODE["PAD8"] = 104] = "PAD8";
        KEY_CODE[KEY_CODE["PAD9"] = 105] = "PAD9";
        KEY_CODE[KEY_CODE["F1"] = 112] = "F1";
        KEY_CODE[KEY_CODE["F2"] = 113] = "F2";
        KEY_CODE[KEY_CODE["F3"] = 114] = "F3";
        KEY_CODE[KEY_CODE["F4"] = 115] = "F4";
        KEY_CODE[KEY_CODE["F5"] = 116] = "F5";
        KEY_CODE[KEY_CODE["F6"] = 117] = "F6";
        KEY_CODE[KEY_CODE["F7"] = 118] = "F7";
        KEY_CODE[KEY_CODE["F8"] = 119] = "F8";
        KEY_CODE[KEY_CODE["F9"] = 120] = "F9";
        KEY_CODE[KEY_CODE["F10"] = 121] = "F10";
        KEY_CODE[KEY_CODE["F11"] = 122] = "F11";
        KEY_CODE[KEY_CODE["F12"] = 123] = "F12";
        KEY_CODE[KEY_CODE["SEMICOLON"] = 186] = "SEMICOLON";
        KEY_CODE[KEY_CODE["PLUS"] = 187] = "PLUS";
        KEY_CODE[KEY_CODE["COMMA"] = 188] = "COMMA";
        KEY_CODE[KEY_CODE["MINUS"] = 189] = "MINUS";
        KEY_CODE[KEY_CODE["PERIOD"] = 190] = "PERIOD";
        KEY_CODE[KEY_CODE["FORWAD_SLASH"] = 191] = "FORWAD_SLASH";
        KEY_CODE[KEY_CODE["BACK_SLASH"] = 220] = "BACK_SLASH";
        KEY_CODE[KEY_CODE["QUOTES"] = 222] = "QUOTES";
    })(KEY_CODE = XEngine.KEY_CODE || (XEngine.KEY_CODE = {}));
})(XEngine || (XEngine = {}));
var XEngine;
(function (XEngine) {
    var Renderer = (function () {
        function Renderer(game, canvas) {
            this.game = game;
            this.clearColor = { r: 0.0, g: 0.0, b: 0.0, a: 0.0 };
            this.scale = new XEngine.Vector(1);
            var options = { stencil: true, antialias: false };
            this.context = canvas.getContext("webgl2", options);
        }
        Renderer.prototype.init = function () {
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
                this.resourceManager = this.game.resourceManager;
                this.spriteBatch = new XEngine.SpriteBatcher.SpriteBatch(this.game, this.context, this);
                this.rectBatch = new XEngine.RectBatcher.RectBatch(this.game, this.context, this);
                this.renderer = null;
                this.sprite = undefined;
            }
        };
        Renderer.prototype.render = function () {
            this.context.clear(this.context.COLOR_BUFFER_BIT);
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
            var arrayLenght = arrayObjects.length;
            for (var i = 0; i < arrayLenght; i++) {
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
var XEngine;
(function (XEngine) {
    var RectBatcher;
    (function (RectBatcher) {
        var Consts = (function () {
            function Consts() {
            }
            Consts.VERTEX_SIZE = 24;
            Consts.INDEX_SIZE = 2;
            Consts.VERTEX_COUNT = 4;
            Consts.INDEX_COUNT = 6;
            Consts.VERTEX_COMPONENT_COUNT = 6;
            Consts.MAX_RECTS = 2000;
            return Consts;
        }());
        RectBatcher.Consts = Consts;
    })(RectBatcher = XEngine.RectBatcher || (XEngine.RectBatcher = {}));
})(XEngine || (XEngine = {}));
var XEngine;
(function (XEngine) {
    var RectBatcher;
    (function (RectBatcher) {
        var RectBatch = (function () {
            function RectBatch(game, gl, renderer) {
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
                this.mask = null;
                this.vertexCount = 0;
                this.init(this.gl);
            }
            RectBatch.prototype.shouldFlush = function () {
                if (this.isFull()) {
                    return true;
                }
                return false;
            };
            RectBatch.prototype.isFull = function () {
                return (this.vertexDataBuffer.getByteLength() >= this.vertexDataBuffer.getByteCapacity());
            };
            RectBatch.prototype.bind = function (shader) {
                if (!shader) {
                    this.shader.bind(this.gl);
                    this.shader.baseUniforms.pMatrix.value = this.game.camera.pMatrix;
                    this.shader.updateUniforms(this.gl);
                }
                else {
                    shader.bind(this.gl);
                    shader.baseUniforms.pMatrix.value = this.game.camera.pMatrix;
                    shader.updateUniforms(this.gl);
                }
                this.vertexBufferObject.bind();
                this.indexBufferObject.bind();
            };
            RectBatch.prototype.flush = function (shader) {
                var gl = this.gl;
                if (this.mask) {
                    this.mask.rendermask(gl);
                }
                var vertexDataBuffer = this.vertexDataBuffer;
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
            };
            RectBatch.prototype.addRect = function (gameObject, shader) {
                if (gameObject.mask !== this.mask || this.shader !== shader) {
                    this.flush(this.shader);
                    this.shader = shader;
                }
                if (gameObject.mask) {
                    this.mask = gameObject.mask;
                }
                this.renderer.setRenderer(this, null);
                var floatBuffer = this.vertexDataBuffer.floatView;
                var uintBuffer = this.vertexDataBuffer.uintView;
                var index = this.vertexDataBuffer.allocate(24);
                var pos = new XEngine.Vector(0, 0);
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
                this.elementCount += 6;
            };
            RectBatch.prototype.init = function (gl) {
                var vertexDataBuffer = new XEngine.DataBuffer32(RectBatcher.Consts.VERTEX_SIZE * RectBatcher.Consts.VERTEX_COUNT * RectBatcher.Consts.MAX_RECTS);
                var indexDataBuffer = new XEngine.DataBuffer16(RectBatcher.Consts.INDEX_SIZE * RectBatcher.Consts.INDEX_COUNT * RectBatcher.Consts.MAX_RECTS);
                var indexBufferObject = this.renderer.resourceManager.createBuffer(gl.ELEMENT_ARRAY_BUFFER, indexDataBuffer.getByteCapacity(), gl.STATIC_DRAW);
                var vertexBufferObject = this.renderer.resourceManager.createBuffer(gl.ARRAY_BUFFER, vertexDataBuffer.getByteCapacity(), gl.STREAM_DRAW);
                var shader = this.renderer.resourceManager.createMaterial(XEngine.SimpleColorMat, "colorShader");
                var indexBuffer = indexDataBuffer.uintView;
                var max = RectBatcher.Consts.MAX_RECTS * RectBatcher.Consts.INDEX_COUNT;
                this.vertexDataBuffer = vertexDataBuffer;
                this.vertexBufferObject = vertexBufferObject;
                this.indexDataBuffer = indexDataBuffer;
                this.indexBufferObject = indexBufferObject;
                this.shader = shader;
                vertexBufferObject.addAttribute(shader.getAttribLocation(gl, "aVertexPosition"), 2, gl.FLOAT, false, RectBatcher.Consts.VERTEX_SIZE, 0);
                vertexBufferObject.addAttribute(shader.getAttribLocation(gl, "vUv"), 2, gl.FLOAT, false, RectBatcher.Consts.VERTEX_SIZE, 8);
                vertexBufferObject.addAttribute(shader.getAttribLocation(gl, "aVertexColor"), 3, gl.UNSIGNED_BYTE, true, RectBatcher.Consts.VERTEX_SIZE, 16);
                vertexBufferObject.addAttribute(shader.getAttribLocation(gl, "in_alpha"), 1, gl.FLOAT, false, RectBatcher.Consts.VERTEX_SIZE, 20);
                for (var indexA = 0, indexB = 0; indexA < max; indexA += RectBatcher.Consts.INDEX_COUNT, indexB += RectBatcher.Consts.VERTEX_COUNT) {
                    indexBuffer[indexA + 0] = indexB + 0;
                    indexBuffer[indexA + 1] = indexB + 1;
                    indexBuffer[indexA + 2] = indexB + 2;
                    indexBuffer[indexA + 3] = indexB + 1;
                    indexBuffer[indexA + 4] = indexB + 3;
                    indexBuffer[indexA + 5] = indexB + 2;
                }
                indexBufferObject.updateResource(indexBuffer, 0);
            };
            return RectBatch;
        }());
        RectBatcher.RectBatch = RectBatch;
    })(RectBatcher = XEngine.RectBatcher || (XEngine.RectBatcher = {}));
})(XEngine || (XEngine = {}));
var XEngine;
(function (XEngine) {
    var SpriteBatcher;
    (function (SpriteBatcher) {
        var Consts = (function () {
            function Consts() {
            }
            Consts.VERTEX_SIZE = 24;
            Consts.INDEX_SIZE = 2;
            Consts.VERTEX_COUNT = 4;
            Consts.INDEX_COUNT = 6;
            Consts.VERTEX_COMPONENT_COUNT = 6;
            Consts.MAX_SPRITES = 2000;
            return Consts;
        }());
        SpriteBatcher.Consts = Consts;
    })(SpriteBatcher = XEngine.SpriteBatcher || (XEngine.SpriteBatcher = {}));
})(XEngine || (XEngine = {}));
var XEngine;
(function (XEngine) {
    var SpriteBatcher;
    (function (SpriteBatcher) {
        var SpriteBatch = (function () {
            function SpriteBatch(game, gl, renderer) {
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
            SpriteBatch.prototype.shouldFlush = function () {
                if (this.isFull()) {
                    return true;
                }
                return false;
            };
            SpriteBatch.prototype.isFull = function () {
                return (this.vertexDataBuffer.getByteLength() >= this.vertexDataBuffer.getByteCapacity());
            };
            SpriteBatch.prototype.bind = function (shader) {
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
            };
            SpriteBatch.prototype.flush = function (shader) {
                var gl = this.gl;
                if (this.mask) {
                    this.mask.rendermask(gl);
                }
                var vertexDataBuffer = this.vertexDataBuffer;
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
            };
            SpriteBatch.prototype.addSprite = function (gameObject, shader) {
                if (gameObject.mask !== this.mask || this.shader !== shader) {
                    this.flush(this.shader);
                    this.shader = shader;
                }
                if (gameObject.mask) {
                    this.mask = gameObject.mask;
                }
                this.renderer.setRenderer(this, gameObject.sprite);
                var floatBuffer = this.vertexDataBuffer.floatView;
                var uintBuffer = this.vertexDataBuffer.uintView;
                var index = this.vertexDataBuffer.allocate(24);
                var objectAlpha = gameObject.getTotalAlpha();
                var pos = new XEngine.Vector(0, 0);
                mat4.identity(gameObject.mvMatrix);
                gameObject.getWorldMatrix(gameObject.mvMatrix);
                pos = pos.multiplyMatrix(gameObject.mvMatrix);
                floatBuffer[index++] = pos.x;
                floatBuffer[index++] = pos.y;
                floatBuffer[index++] = gameObject._uv[0];
                floatBuffer[index++] = gameObject._uv[1];
                uintBuffer[index++] = gameObject.color;
                floatBuffer[index++] = objectAlpha;
                pos.setTo(0, gameObject.height);
                pos = pos.multiplyMatrix(gameObject.mvMatrix);
                floatBuffer[index++] = pos.x;
                floatBuffer[index++] = pos.y;
                floatBuffer[index++] = gameObject._uv[2];
                floatBuffer[index++] = gameObject._uv[3];
                uintBuffer[index++] = gameObject.color;
                floatBuffer[index++] = objectAlpha;
                pos.setTo(gameObject.width, 0);
                pos = pos.multiplyMatrix(gameObject.mvMatrix);
                floatBuffer[index++] = pos.x;
                floatBuffer[index++] = pos.y;
                floatBuffer[index++] = gameObject._uv[4];
                floatBuffer[index++] = gameObject._uv[5];
                uintBuffer[index++] = gameObject.color;
                floatBuffer[index++] = objectAlpha;
                pos.setTo(gameObject.width, gameObject.height);
                pos = pos.multiplyMatrix(gameObject.mvMatrix);
                floatBuffer[index++] = pos.x;
                floatBuffer[index++] = pos.y;
                floatBuffer[index++] = gameObject._uv[6];
                floatBuffer[index++] = gameObject._uv[7];
                uintBuffer[index++] = gameObject.color;
                floatBuffer[index++] = objectAlpha;
                this.currentTexture2D = this.game.cache.image(gameObject.sprite)._texture;
                this.currentSprite = gameObject.sprite;
                this.elementCount += 6;
            };
            SpriteBatch.prototype.init = function (gl) {
                var vertexDataBuffer = new XEngine.DataBuffer32(SpriteBatcher.Consts.VERTEX_SIZE * SpriteBatcher.Consts.VERTEX_COUNT * SpriteBatcher.Consts.MAX_SPRITES);
                var indexDataBuffer = new XEngine.DataBuffer16(SpriteBatcher.Consts.INDEX_SIZE * SpriteBatcher.Consts.INDEX_COUNT * SpriteBatcher.Consts.MAX_SPRITES);
                var indexBufferObject = this.renderer.resourceManager.createBuffer(gl.ELEMENT_ARRAY_BUFFER, indexDataBuffer.getByteCapacity(), gl.STATIC_DRAW);
                var vertexBufferObject = this.renderer.resourceManager.createBuffer(gl.ARRAY_BUFFER, vertexDataBuffer.getByteCapacity(), gl.STREAM_DRAW);
                var shader = this.renderer.resourceManager.createMaterial(XEngine.SpriteMat, "spriteShader");
                var indexBuffer = indexDataBuffer.uintView;
                var max = SpriteBatcher.Consts.MAX_SPRITES * SpriteBatcher.Consts.INDEX_COUNT;
                this.vertexDataBuffer = vertexDataBuffer;
                this.vertexBufferObject = vertexBufferObject;
                this.indexDataBuffer = indexDataBuffer;
                this.indexBufferObject = indexBufferObject;
                this.shader = shader;
                vertexBufferObject.addAttribute(shader.getAttribLocation(gl, "aVertexPosition"), 2, gl.FLOAT, false, SpriteBatcher.Consts.VERTEX_SIZE, 0);
                vertexBufferObject.addAttribute(shader.getAttribLocation(gl, "vUv"), 2, gl.FLOAT, false, SpriteBatcher.Consts.VERTEX_SIZE, 8);
                vertexBufferObject.addAttribute(shader.getAttribLocation(gl, "aVertexColor"), 3, gl.UNSIGNED_BYTE, true, SpriteBatcher.Consts.VERTEX_SIZE, 16);
                vertexBufferObject.addAttribute(shader.getAttribLocation(gl, "in_alpha"), 1, gl.FLOAT, false, SpriteBatcher.Consts.VERTEX_SIZE, 20);
                for (var indexA = 0, indexB = 0; indexA < max; indexA += SpriteBatcher.Consts.INDEX_COUNT, indexB += SpriteBatcher.Consts.VERTEX_COUNT) {
                    indexBuffer[indexA + 0] = indexB + 0;
                    indexBuffer[indexA + 1] = indexB + 1;
                    indexBuffer[indexA + 2] = indexB + 2;
                    indexBuffer[indexA + 3] = indexB + 1;
                    indexBuffer[indexA + 4] = indexB + 3;
                    indexBuffer[indexA + 5] = indexB + 2;
                }
                indexBufferObject.updateResource(indexBuffer, 0);
            };
            return SpriteBatch;
        }());
        SpriteBatcher.SpriteBatch = SpriteBatch;
    })(SpriteBatcher = XEngine.SpriteBatcher || (XEngine.SpriteBatcher = {}));
})(XEngine || (XEngine = {}));
var XEngine;
(function (XEngine) {
    var Uniforms;
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
    var ShaderCompiler = (function () {
        function ShaderCompiler() {
        }
        ShaderCompiler.compileVertexShader = function (verxtexString) {
            verxtexString = verxtexString.replace("#XBaseParams", this.vertexBaseParams.join("\n"));
            verxtexString += this.vertexMain.join("\n");
            return verxtexString;
        };
        ShaderCompiler.compileFragmentShader = function (fragmentString) {
            fragmentString = fragmentString.replace("#XBaseParams", this.fragmentBaseParams.join("\n"));
            return fragmentString;
        };
        ShaderCompiler.vertexBaseParams = [
            "in vec3 aVertexPosition;",
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
            "vertPos = pMatrix * vec4(aVertexPosition, 1.0);",
            "uv = vUv;",
            "vColor = aVertexColor;",
            "alpha = in_alpha;",
            "mainPass();",
            "gl_Position = vertPos;",
            "}",
        ];
        return ShaderCompiler;
    }());
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
    var Material = (function () {
        function Material(vertexCode, fragmentCode, uniforms) {
            if (uniforms === void 0) { uniforms = {}; }
            this.uniforms = uniforms;
            this.baseUniforms = JSON.parse(JSON.stringify(XEngine.ShaderUniforms));
            this.vertColAtt = null;
            this.vertColAtt = null;
            this.shaderProgram = null;
            this.compiled = false;
            this.vertexCode = vertexCode;
            this.fragmentCode = fragmentCode;
        }
        Material.prototype.initializeShader = function (gl) {
            var vertString = "";
            var fragmentString = "";
            for (var i = 0; i < this.vertexCode.length; i++) {
                vertString += this.vertexCode[i] + "\n";
            }
            vertString = XEngine.ShaderCompiler.compileVertexShader(vertString);
            for (var j = 0; j < this.fragmentCode.length; j++) {
                fragmentString += this.fragmentCode[j] + "\n";
            }
            fragmentString = XEngine.ShaderCompiler.compileFragmentShader(fragmentString);
            var vertexShader;
            var fragmentShader;
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
        };
        Material.prototype.setUniforms = function (gl) {
            gl.useProgram(this.shaderProgram);
            this.vertPosAtt = gl.getAttribLocation(this.shaderProgram, "aVertexPosition");
            this.vertColAtt = gl.getAttribLocation(this.shaderProgram, "aVertexColor");
            this.vertUvAtt = gl.getAttribLocation(this.shaderProgram, "vUv");
            this.vertAlphaAtt = gl.getAttribLocation(this.shaderProgram, "in_alpha");
            for (var property in this.uniforms) {
                if (this.uniforms.hasOwnProperty(property)) {
                    this.uniforms[property].gpuPosition = gl.getUniformLocation(this.shaderProgram, property);
                }
            }
            for (var property in this.baseUniforms) {
                if (this.baseUniforms.hasOwnProperty(property)) {
                    this.baseUniforms[property].gpuPosition = gl.getUniformLocation(this.shaderProgram, property);
                }
            }
        };
        Material.prototype.getAttribLocation = function (gl, attr) {
            return gl.getAttribLocation(this.shaderProgram, attr);
        };
        Material.prototype._beginRender = function (gl) {
            if (!this.compiled) {
                this.initializeShader(gl);
            }
            gl.useProgram(this.shaderProgram);
        };
        Material.prototype.bind = function (gl) {
            if (!this.compiled) {
                this.initializeShader(gl);
            }
            gl.useProgram(this.shaderProgram);
        };
        Material.prototype._setUniform = function (uniform, gl) {
            var valueType = uniform.type;
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
        };
        Material.prototype.updateUniforms = function (gl) {
            for (var property in this.uniforms) {
                if (this.uniforms.hasOwnProperty(property)) {
                    this._setUniform(this.uniforms[property], gl);
                    this.uniforms[property].prevVal = this.uniforms[property].value;
                }
            }
            for (var property in this.baseUniforms) {
                if (this.baseUniforms.hasOwnProperty(property)) {
                    this._setUniform(this.baseUniforms[property], gl);
                    this.baseUniforms[property].prevVal = this.baseUniforms[property].value;
                }
            }
        };
        return Material;
    }());
    XEngine.Material = Material;
})(XEngine || (XEngine = {}));
var XEngine;
(function (XEngine) {
    var MaterialLib;
    (function (MaterialLib) {
        var MaterialLibObject = (function () {
            function MaterialLibObject() {
            }
            return MaterialLibObject;
        }());
        MaterialLib.MaterialLibObject = MaterialLibObject;
        var Sprite = (function (_super) {
            __extends(Sprite, _super);
            function Sprite() {
                return _super !== null && _super.apply(this, arguments) || this;
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
            return Sprite;
        }(MaterialLibObject));
        MaterialLib.Sprite = Sprite;
        var SimpleMaterial = (function (_super) {
            __extends(SimpleMaterial, _super);
            function SimpleMaterial() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            SimpleMaterial.vertexShader = [
                "#version 300 es",
                "#XBaseParams",
                "uniform mat4 mvpMatrix;",
                "void mainPass() {",
                "vertPos = vertPos * mvpMatrix;",
                "}",
            ];
            SimpleMaterial.fragmentShader = [
                "#version 300 es",
                "precision mediump float;",
                "#XBaseParams",
                "void main(void) {",
                "fragColor = vec4(uv.x, uv.y, 0.0, 1.0);",
                "}",
            ];
            return SimpleMaterial;
        }(MaterialLibObject));
        MaterialLib.SimpleMaterial = SimpleMaterial;
        var SimpleColor = (function (_super) {
            __extends(SimpleColor, _super);
            function SimpleColor() {
                return _super !== null && _super.apply(this, arguments) || this;
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
            return SimpleColor;
        }(MaterialLibObject));
        MaterialLib.SimpleColor = SimpleColor;
        var CircleColor = (function (_super) {
            __extends(CircleColor, _super);
            function CircleColor() {
                return _super !== null && _super.apply(this, arguments) || this;
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
            return CircleColor;
        }(MaterialLibObject));
        MaterialLib.CircleColor = CircleColor;
    })(MaterialLib = XEngine.MaterialLib || (XEngine.MaterialLib = {}));
})(XEngine || (XEngine = {}));
var XEngine;
(function (XEngine) {
    var CircleMat = (function (_super) {
        __extends(CircleMat, _super);
        function CircleMat() {
            return _super.call(this, XEngine.MaterialLib.CircleColor.vertexShader, XEngine.MaterialLib.CircleColor.fragmentShader) || this;
        }
        CircleMat.shader = new CircleMat();
        return CircleMat;
    }(XEngine.Material));
    XEngine.CircleMat = CircleMat;
})(XEngine || (XEngine = {}));
var XEngine;
(function (XEngine) {
    var SimpleColorMat = (function (_super) {
        __extends(SimpleColorMat, _super);
        function SimpleColorMat() {
            return _super.call(this, XEngine.MaterialLib.SimpleColor.vertexShader, XEngine.MaterialLib.SimpleColor.fragmentShader) || this;
        }
        SimpleColorMat.shader = new SimpleColorMat();
        return SimpleColorMat;
    }(XEngine.Material));
    XEngine.SimpleColorMat = SimpleColorMat;
})(XEngine || (XEngine = {}));
var XEngine;
(function (XEngine) {
    var SimpleMaterial = (function (_super) {
        __extends(SimpleMaterial, _super);
        function SimpleMaterial() {
            var _this = this;
            var uniforms = {
                mvpMatrix: {
                    value: null,
                    type: XEngine.Uniforms.MAT4X4,
                },
            };
            _this = _super.call(this, XEngine.MaterialLib.SimpleMaterial.vertexShader, XEngine.MaterialLib.SimpleMaterial.fragmentShader, uniforms) || this;
            return _this;
        }
        SimpleMaterial.prototype._beginRender = function (gl) {
            XEngine.Material.prototype._beginRender.call(this, gl);
        };
        SimpleMaterial.shader = new SimpleMaterial();
        return SimpleMaterial;
    }(XEngine.Material));
    XEngine.SimpleMaterial = SimpleMaterial;
})(XEngine || (XEngine = {}));
var XEngine;
(function (XEngine) {
    var SpriteMat = (function (_super) {
        __extends(SpriteMat, _super);
        function SpriteMat() {
            return _super.call(this, XEngine.MaterialLib.Sprite.vertexShader, XEngine.MaterialLib.Sprite.fragmentShader) || this;
        }
        SpriteMat.prototype._setTexture = function (texture) {
            this.texture = texture;
        };
        SpriteMat.prototype._beginRender = function (gl) {
            XEngine.Material.prototype._beginRender.call(this, gl);
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, this.texture);
        };
        SpriteMat.shader = new SpriteMat();
        return SpriteMat;
    }(XEngine.Material));
    XEngine.SpriteMat = SpriteMat;
})(XEngine || (XEngine = {}));
var XEngine;
(function (XEngine) {
    var DataBuffer16 = (function () {
        function DataBuffer16(byteSize) {
            this.wordLength = 0;
            this.wordCapacity = byteSize / 4;
            this.buffer = new ArrayBuffer(byteSize);
            this.intView = new Int16Array(this.buffer);
            this.uintView = new Uint16Array(this.buffer);
        }
        DataBuffer16.prototype.clear = function () {
            this.wordLength = 0;
        };
        DataBuffer16.prototype.getByteLength = function () {
            return this.wordLength * 4;
        };
        DataBuffer16.prototype.getByteCapacity = function () {
            return this.buffer.byteLength;
        };
        DataBuffer16.prototype.allocate = function (wordSize) {
            var currentLength = this.wordLength;
            this.wordLength += wordSize;
            return currentLength;
        };
        DataBuffer16.prototype.getUsedBufferAsInt = function () {
            return this.intView.subarray(0, this.wordLength);
        };
        DataBuffer16.prototype.getUsedBufferAsUint = function () {
            return this.uintView.subarray(0, this.wordLength);
        };
        return DataBuffer16;
    }());
    XEngine.DataBuffer16 = DataBuffer16;
})(XEngine || (XEngine = {}));
var XEngine;
(function (XEngine) {
    var DataBuffer32 = (function () {
        function DataBuffer32(byteSize) {
            this.wordLength = 0;
            this.wordCapacity = byteSize / 4;
            this.buffer = new ArrayBuffer(byteSize);
            this.floatView = new Float32Array(this.buffer);
            this.intView = new Int32Array(this.buffer);
            this.uintView = new Uint32Array(this.buffer);
        }
        DataBuffer32.prototype.clear = function () {
            this.wordLength = 0;
        };
        DataBuffer32.prototype.getByteLength = function () {
            return this.wordLength * 4;
        };
        DataBuffer32.prototype.getByteCapacity = function () {
            return this.buffer.byteLength;
        };
        DataBuffer32.prototype.allocate = function (wordSize) {
            var currentLength = this.wordLength;
            this.wordLength += wordSize;
            return currentLength;
        };
        DataBuffer32.prototype.getUsedBufferAsFloat = function () {
            return this.floatView.subarray(0, this.wordLength);
        };
        DataBuffer32.prototype.getUsedBufferAsInt = function () {
            return this.intView.subarray(0, this.wordLength);
        };
        DataBuffer32.prototype.getUsedBufferAsUint = function () {
            return this.uintView.subarray(0, this.wordLength);
        };
        return DataBuffer32;
    }());
    XEngine.DataBuffer32 = DataBuffer32;
})(XEngine || (XEngine = {}));
var XEngine;
(function (XEngine) {
    var IndexBuffer = (function () {
        function IndexBuffer(gl, buffer) {
            this.gl = gl;
            this.bufferType = gl.ELEMENT_ARRAY_BUFFER;
            this.buffer = buffer;
        }
        IndexBuffer.SetDiry = function () {
            IndexBuffer.CurrentIndexBuffer = null;
        };
        IndexBuffer.prototype.updateResource = function (bufferData, offset) {
            var gl = this.gl;
            IndexBuffer.CurrentIndexBuffer = this;
            gl.bindBuffer(this.bufferType, this.buffer);
            gl.bufferSubData(this.bufferType, offset, bufferData);
        };
        IndexBuffer.prototype.bind = function () {
            var gl = this.gl;
            var buffer = this.buffer;
            IndexBuffer.CurrentIndexBuffer = this;
            gl.bindBuffer(this.bufferType, buffer);
        };
        return IndexBuffer;
    }());
    XEngine.IndexBuffer = IndexBuffer;
})(XEngine || (XEngine = {}));
var XEngine;
(function (XEngine) {
    var ResourceManager = (function () {
        function ResourceManager(gl) {
            this.gl = gl;
            this.shaderCache = new Array();
        }
        ResourceManager.prototype.createBuffer = function (target, initialDataOrSize, usage) {
            var gl = this.gl;
            var buffer = gl.createBuffer();
            gl.bindBuffer(target, buffer);
            gl.bufferData(target, initialDataOrSize, usage);
            switch (target) {
                case gl.ARRAY_BUFFER:
                    return new XEngine.VertexBuffer(gl, buffer);
                case gl.ELEMENT_ARRAY_BUFFER:
                    return new XEngine.IndexBuffer(gl, buffer);
            }
        };
        ResourceManager.prototype.createMaterial = function (shaderClass, shaderName) {
            var shader;
            if (shaderName !== undefined) {
                if (!this.shaderCache[shaderName]) {
                    shader = new shaderClass();
                    shader.initializeShader(this.gl);
                    this.shaderCache[shaderName] = shader;
                }
                else {
                    shader = this.shaderCache[shaderName];
                }
            }
            else {
                shader = new shaderClass();
                shader.initializeShader(this.gl);
            }
            return shader;
        };
        return ResourceManager;
    }());
    XEngine.ResourceManager = ResourceManager;
})(XEngine || (XEngine = {}));
var XEngine;
(function (XEngine) {
    var WRAP_MODE;
    (function (WRAP_MODE) {
        WRAP_MODE[WRAP_MODE["CLAMP"] = 0] = "CLAMP";
        WRAP_MODE[WRAP_MODE["WRAP"] = 1] = "WRAP";
    })(WRAP_MODE = XEngine.WRAP_MODE || (XEngine.WRAP_MODE = {}));
    var Texture2D = (function () {
        function Texture2D(name, width, height, wrapMode) {
            if (wrapMode === void 0) { wrapMode = WRAP_MODE.CLAMP; }
            this.imageName = name;
            this.frameWidth = width;
            this.frameHeight = height;
            this._texture = null;
            this.ready = false;
            this.wrapMode = wrapMode;
        }
        Texture2D.prototype.createTexture = function (gl) {
            if (this.imageName == null) {
                return;
            }
            this._texture = gl.createTexture();
            var internalFormat = gl.RGBA;
            var srcFormat = gl.RGBA;
            var srcType = gl.UNSIGNED_BYTE;
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
        };
        return Texture2D;
    }());
    XEngine.Texture2D = Texture2D;
})(XEngine || (XEngine = {}));
var XEngine;
(function (XEngine) {
    var VertexBuffer = (function () {
        function VertexBuffer(gl, buffer) {
            this.gl = gl;
            this.bufferType = gl.ARRAY_BUFFER;
            this.buffer = buffer;
            this.attributes = new Array();
        }
        VertexBuffer.SetDiry = function () {
            VertexBuffer.CurrentVertexBuffer = null;
        };
        VertexBuffer.prototype.addAttribute = function (index, size, type, normalized, stride, offset) {
            this.attributes.push({
                index: index,
                size: size,
                type: type,
                normalized: normalized,
                stride: stride,
                offset: offset,
            });
        };
        VertexBuffer.prototype.updateResource = function (bufferData, offset) {
            var gl = this.gl;
            VertexBuffer.CurrentVertexBuffer = this;
            gl.bindBuffer(this.bufferType, this.buffer);
            gl.bufferSubData(this.bufferType, offset, bufferData);
        };
        VertexBuffer.prototype.bind = function () {
            var gl = this.gl;
            var buffer = this.buffer;
            var attributes = this.attributes;
            var attributesLength = attributes.length;
            VertexBuffer.CurrentVertexBuffer = this;
            gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
            for (var index = 0; index < attributesLength; ++index) {
                var element = attributes[index];
                if (element !== undefined && element !== null) {
                    gl.enableVertexAttribArray(element.index);
                    gl.vertexAttribPointer(element.index, element.size, element.type, element.normalized, element.stride, element.offset);
                }
            }
        };
        return VertexBuffer;
    }());
    XEngine.VertexBuffer = VertexBuffer;
})(XEngine || (XEngine = {}));
var XEngine;
(function (XEngine) {
    var Easing;
    (function (Easing) {
        var Linear = (function () {
            function Linear() {
            }
            Linear.None = function (t) {
                return t;
            };
            return Linear;
        }());
        Easing.Linear = Linear;
        var Quad = (function () {
            function Quad() {
            }
            Quad.In = function (t) {
                return t * t;
            };
            Quad.Out = function (t) {
                return t * (2 - t);
            };
            Quad.InOut = function (t) {
                return t < .5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
            };
            return Quad;
        }());
        Easing.Quad = Quad;
        var Cubic = (function () {
            function Cubic() {
            }
            Cubic.In = function (t) {
                return t * t * t;
            };
            Cubic.Out = function (t) {
                return (--t) * t * t + 1;
            };
            Cubic.InOut = function (t) {
                return t < .5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
            };
            return Cubic;
        }());
        Easing.Cubic = Cubic;
        var Quart = (function () {
            function Quart() {
            }
            Quart.In = function (t) {
                return t * t * t * t;
            };
            Quart.Out = function (t) {
                return 1 - (--t) * t * t * t;
            };
            Quart.InOut = function (t) {
                return t < .5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t;
            };
            return Quart;
        }());
        Easing.Quart = Quart;
        var Quint = (function () {
            function Quint() {
            }
            Quint.In = function (t) {
                return t * t * t * t * t;
            };
            Quint.Out = function (t) {
                return 1 + (--t) * t * t * t * t;
            };
            Quint.InOut = function (t) {
                return t < .5 ? 16 * t * t * t * t * t : 1 + 16 * (--t) * t * t * t * t;
            };
            return Quint;
        }());
        Easing.Quint = Quint;
        var Sin = (function () {
            function Sin() {
            }
            Sin.In = function (t) {
                if (t === 0) {
                    return 0;
                }
                if (t === 1) {
                    return 1;
                }
                return Math.cos(t * Math.PI / 2);
            };
            Sin.Out = function (t) {
                if (t === 0) {
                    return 0;
                }
                if (t === 1) {
                    return 1;
                }
                return Math.sin(t * Math.PI / 2);
            };
            Sin.InOut = function (t) {
                if (t === 0) {
                    return 0;
                }
                if (t === 1) {
                    return 1;
                }
                return 0.5 * (1 - Math.cos(Math.PI * t));
            };
            return Sin;
        }());
        Easing.Sin = Sin;
        var Expo = (function () {
            function Expo() {
            }
            Expo.In = function (t) {
                return t === 0 ? 0 : Math.pow(1024, t - 1);
            };
            Expo.Out = function (t) {
                return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
            };
            Expo.InOut = function (t) {
                if (t === 0) {
                    return 0;
                }
                if (t === 1) {
                    return 1;
                }
                if ((t *= 2) < 1) {
                    return 0.5 * Math.pow(1024, t - 1);
                }
                return 0.5 * (-Math.pow(2, -10 * (t - 1)) + 2);
            };
            return Expo;
        }());
        Easing.Expo = Expo;
        var Circular = (function () {
            function Circular() {
            }
            Circular.In = function (t) {
                return 1 - Math.sqrt(1 - t * t);
            };
            Circular.Out = function (t) {
                return Math.sqrt(1 - (--t * t));
            };
            Circular.InOut = function (t) {
                if ((t *= 2) < 1) {
                    return -0.5 * (Math.sqrt(1 - t * t) - 1);
                }
                return 0.5 * (Math.sqrt(1 - (t -= 2) * t) + 1);
            };
            return Circular;
        }());
        Easing.Circular = Circular;
        var Back = (function () {
            function Back() {
            }
            Back.In = function (t) {
                var s = 1.70158;
                return t * t * ((s + 1) * t - s);
            };
            Back.Out = function (t) {
                var s = 1.70158;
                return --t * t * ((s + 1) * t + s) + 1;
            };
            Back.InOut = function (t) {
                var s = 1.70158 * 1.525;
                if ((t *= 2) < 1) {
                    return 0.5 * (t * t * ((s + 1) * t - s));
                }
                return 0.5 * ((t -= 2) * t * ((s + 1) * t + s) + 2);
            };
            return Back;
        }());
        Easing.Back = Back;
        var Bounce = (function () {
            function Bounce() {
            }
            Bounce.In = function (t) {
                return 1 - Bounce.Out(1 - t);
            };
            Bounce.Out = function (t) {
                if (t < (1 / 2.75)) {
                    return 7.5625 * t * t;
                }
                else if (t < (2 / 2.75)) {
                    return 7.5625 * (t -= (1.5 / 2.75)) * t + 0.75;
                }
                else if (t < (2.5 / 2.75)) {
                    return 7.5625 * (t -= (2.25 / 2.75)) * t + 0.9375;
                }
                else {
                    return 7.5625 * (t -= (2.625 / 2.75)) * t + 0.984375;
                }
            };
            Bounce.InOut = function (t) {
                if (t < 0.5) {
                    return XEngine.Easing.Bounce.In(t * 2) * 0.5;
                }
                return XEngine.Easing.Bounce.Out(t * 2 - 1) * 0.5 + 0.5;
            };
            return Bounce;
        }());
        Easing.Bounce = Bounce;
    })(Easing = XEngine.Easing || (XEngine.Easing = {}));
})(XEngine || (XEngine = {}));
var XEngine;
(function (XEngine) {
    var Tween = (function () {
        function Tween(target) {
            this.started = false;
            this.isPendingDestroy = false;
            this.started = false;
            this.target = target;
            this.fromProperties = new Array();
            this.properties = new Array();
            this.duration = 0;
            this.autoStart = true;
            this.easing = undefined;
            this.delay = 0;
            this.repeat = 0;
            this.runCount = 0;
            this.isRunning = false;
            this.progress = 0;
            this.time = 0;
            this.yoyo = false;
            this.onComplete = new XEngine.Signal();
            this.onCompleteLoop = new XEngine.Signal();
        }
        Tween.prototype.play = function () {
            this.started = true;
            var _this = this;
            var timer = setTimeout(function () {
                clearTimeout(timer);
                _this.startTween();
            }, this.delay);
        };
        Tween.prototype.to = function (properties, duration, ease, autoStart, delay, repeat, yoyo) {
            for (var property in properties) {
                if (typeof properties[property] === "string") {
                    properties[property] = this.target[property] + Number(properties[property]);
                }
                this.fromProperties[property] = this.target[property];
            }
            this.properties = properties;
            this.duration = duration;
            this.easing = ease;
            this.autoStart = autoStart || true;
            this.delay = delay || 0;
            this.repeat = repeat || 0;
            this.yoyo = yoyo || false;
            return this;
        };
        Tween.prototype.from = function (properties) {
            for (var property in properties) {
                this.fromProperties[property] = properties[property];
            }
            return this;
        };
        Tween.prototype.complete = function () {
            this.time = this.duration;
            for (var property in this.properties) {
                this.target[property] = this.fromProperties[property];
            }
        };
        Tween.prototype.update = function (deltaTime) {
            if (this.target === undefined || this.target == null) {
                this.destroy();
                return;
            }
            if ((this.progress === 1)) {
                if (this.repeat === -1 || this.runCount <= this.repeat) {
                    this.onCompleteLoop.dispatch();
                    this.time = 0;
                    this.progress = 0;
                    this.play();
                }
                else {
                    this.onComplete.dispatch();
                    this.destroy();
                }
                return;
            }
            this.progress = XEngine.Mathf.clamp(this.time / this.duration, 0, 1);
            for (var property in this.properties) {
                var t = this.progress;
                if (this.yoyo) {
                    if (t <= 0.5) {
                        t *= 2;
                    }
                    else {
                        var t2 = (t - 0.5) * 2;
                        t = XEngine.Mathf.lerp(1, 0, t2);
                    }
                }
                this.target[property] = XEngine.Mathf.lerp(this.fromProperties[property], this.properties[property], this.easing(t));
            }
            this.time += deltaTime;
        };
        Tween.prototype.destroy = function () {
            this.isRunning = false;
            this.isPendingDestroy = true;
            if (this.onComplete !== undefined) {
                this.onComplete._destroy();
            }
            if (this.onCompleteLoop !== undefined) {
                this.onCompleteLoop._destroy();
            }
            delete this.onComplete;
            delete this.onCompleteLoop;
            delete this.fromProperties;
            delete this.properties;
        };
        Tween.prototype.startTween = function () {
            this.runCount++;
            for (var property in this.properties) {
                this.target[property] = this.fromProperties[property];
            }
            this.isRunning = true;
        };
        return Tween;
    }());
    XEngine.Tween = Tween;
})(XEngine || (XEngine = {}));
var XEngine;
(function (XEngine) {
    var TweenManager = (function () {
        function TweenManager(game) {
            this.game = game;
            this.tweens = new Array();
        }
        TweenManager.prototype.add = function (target) {
            var tween = new XEngine.Tween(target);
            this.tweens.push(tween);
            return tween;
        };
        TweenManager.prototype.update = function (deltaMillis) {
            for (var i = 0; i < this.tweens.length; i++) {
                var tween = this.tweens[i];
                if (tween.isPendingDestroy) {
                    delete this.tweens[i];
                    this.tweens.splice(i, 1);
                    i--;
                }
                else if (tween.isRunning) {
                    tween.update(deltaMillis);
                }
                else if (tween.autoStart && !tween.started) {
                    tween.play();
                }
            }
        };
        TweenManager.prototype.destroy = function () {
            for (var i = this.tweens.length - 1; i >= 0; i--) {
                this.tweens[i].destroy();
                delete this.tweens[i];
            }
            delete this.tweens;
            this.tweens = new Array();
        };
        return TweenManager;
    }());
    XEngine.TweenManager = TweenManager;
})(XEngine || (XEngine = {}));
//# sourceMappingURL=XEngine.js.map