//Para quitar warnings por las cosas que están en otro js
/* global XEngine*/
var game;
function initGame(){
   console.log('Arrancando El juego');
   game = new XEngine.Game(1280, 720, 'contenedor');							//iniciamos el juego
   game.frameLimit = 120;
   game.scale.scaleType = XEngine.Scale.SHOW_ALL;
   game.state.add('unicorns', Start);
   game.state.start('unicorns');


   game.setBackgroundColor(100,100,100, 255);
}

var Start = function (game) {
	
};

var circle;
var text;

Start.prototype = {
	
	preload: function () {
		//this.game.load.bitmapFont('font1', 'img/font.png', 'img/font.fnt');
	},
	
	start: function () {
		text = this.game.add.mesh(0,0,-0.01);

		var vertices = [
			50.0,  50.0, 0.0,
			0.0,  50.0, 0.0,
			50.0, 0.0, 0.0,
			0.0, 0.0, 0.0
		]

		var indices = [
			0, 2, 3,
			0, 3, 1,
		];
		
		text.setVertices(vertices, indices);
		//mat4.ortho(this.game.camera.pMatrix, 45, 1280/720, 0.1, 1000);
	},
	
	update : function (deltaTime) {
		//text.rotation += 20 * deltaTime;
	},
	
	fin: function () {
		
	},
};