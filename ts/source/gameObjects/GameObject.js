"use strict";
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
            this.indexBuffer = this.game.renderer.resourceManager.createBuffer(gl.ELEMENT_ARRAY_BUFFER, this._vertDataBuffer.getByteCapacity(), gl.STATIC_DRAW);
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
        GameObject.prototype._setBuffers = function () {
            var context = this.gl;
            this.shader.bind(context);
            this.vertexBuffer.addAttribute(this.shader.vertPosAtt, 2, context.FLOAT, false, 24, 0);
            this.vertexBuffer.addAttribute(this.shader.vertUvAtt, 2, context.FLOAT, false, 24, 8);
            this.vertexBuffer.addAttribute(this.shader.vertColAtt, 3, context.UNSIGNED_BYTE, true, 24, 16);
            this.vertexBuffer.addAttribute(this.shader.vertAlphaAtt, 1, context.FLOAT, false, 24, 20);
        };
        GameObject.prototype._setVertices = function (width, height, color, uv) {
            var floatBuffer = this._vertDataBuffer.floatView;
            var uintBuffer = this._vertDataBuffer.uintView;
            var index = 0;
            var pos = new XEngine.Vector(0, 0);
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
        };
        return GameObject;
    }());
    XEngine.GameObject = GameObject;
})(XEngine || (XEngine = {}));
