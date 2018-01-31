//Para quitar warnings por las cosas que están en otro js
/* global XEngine*/
var game;
function initGame(){
   console.log('Arrancando El juego');
   game = new XEngine.Game(1280, 720, 'contenedor');							//iniciamos el juego
   game.frameLimit = 120;
   game.scale.scaleType = XEngine.Scale.SHOW_ALL;
   game.state.add('unicorns', Start);
   game.state.add('anim', AnimScene);
   game.state.add('shader', CustomShader);
   game.state.add('gimp', Gimp);
   game.state.start('unicorns');


   game.setBackgroundColor(100,100,100, 255);
}

var Start = function (game) {
	
};

var circle;

Start.prototype = {
	
	preload: function () {
		this.game.load.bitmapFont('font1', 'img/font.png', 'img/font.fnt');
	},
	
	start: function () {
		this.game.autoCulling = true;
		this.game.add.bitmapText(100,0,'font1', 'HolaMundoVo');
	},
	
	update : function (deltaTime) {
	},
	
	fin: function () {
		
	},
};