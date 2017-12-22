"use strict";
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
                this.currentTexture2D = this.game.cache.image(gameObject.sprite)._texture;
                this.currentSprite = gameObject.sprite;
                this.elementCount += 6;
            };
            SpriteBatch.prototype.init = function (gl) {
                var vertexDataBuffer = new XEngine.DataBuffer32(SpriteBatcher.Consts.VERTEX_SIZE * SpriteBatcher.Consts.VERTEX_COUNT * SpriteBatcher.Consts.MAX_SPRITES);
                var indexDataBuffer = new XEngine.DataBuffer16(SpriteBatcher.Consts.INDEX_SIZE * SpriteBatcher.Consts.INDEX_COUNT * SpriteBatcher.Consts.MAX_SPRITES);
                var indexBufferObject = this.renderer.resourceManager.createBuffer(gl.ELEMENT_ARRAY_BUFFER, indexDataBuffer.getByteCapacity(), gl.STATIC_DRAW);
                var vertexBufferObject = this.renderer.resourceManager.createBuffer(gl.ARRAY_BUFFER, vertexDataBuffer.getByteCapacity(), gl.STREAM_DRAW);
                var shader = this.renderer.resourceManager.createShader(XEngine.SpriteShader);
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
