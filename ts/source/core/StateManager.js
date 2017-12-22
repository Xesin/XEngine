"use strict";
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
