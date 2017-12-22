"use strict";
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
        Vector.prototype.setTo = function (x, y) {
            if (y === void 0) { y = x; }
            this.x = x;
            this.y = y;
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
            return this;
        };
        Vector.prototype.multiplyMatrix = function (matrix) {
            var x = this.x, y = this.y;
            var out = new Array(3);
            this.x = x * matrix[0] + y * matrix[4] + matrix[8] + matrix[12];
            this.y = x * matrix[1] + y * matrix[5] + matrix[9] + matrix[13];
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
