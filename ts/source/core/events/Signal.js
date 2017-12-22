"use strict";
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
