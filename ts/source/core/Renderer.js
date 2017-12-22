var XEngine;
(function (XEngine) {
    var Renderer = (function () {
        function Renderer() {
        }
        Renderer.prototype.Renderer = function () {
            console.log("test");
            this.game.test("fasdf");
        };
        Renderer.prototype.test = function (var1) {
            console.log("test");
        };
        return Renderer;
    }());
})(XEngine || (XEngine = {}));
