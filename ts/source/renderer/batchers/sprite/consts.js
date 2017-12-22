"use strict";
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
