"use strict";
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
