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
		this.game.load.image('unicorn', 'img/angry_unicorn.png');
	},
	
	start: function () {
		// for(var i = 0; i < 200; i++) {
		// 	this.text = this.game.add.existing(new XEngine.CubeMesh(this.game, XEngine.Mathf.randomIntRange(-100,100), XEngine.Mathf.randomIntRange(-100,100), -500.0, 100), true, true);	
		// }
		this.text = this.game.add.existing(new XEngine.CubeMesh(this.game, 0, 0, -500.0, 100), true, true);	
		this.text = this.game.add.existing(new XEngine.CubeMesh(this.game, 200, 0, -500.0, 100), true, true);	
		
		text = this.text;
		this.text.shader._setTexture(this.game.cache.image('unicorn')._texture);
		
	},
	
	update : function (deltaTime) {
		//text.rotation += 20 * deltaTime;
		this.text.rotation3D.x = 270;
		// this.text.rotation3D.y += 90 * deltaTime;
		// this.text.rotation3D.z += 90 * deltaTime;

		// this.text.scale.setTo(XEngine.Mathf.lerp(0.2, 1.2, Math.abs(Math.cos(this.game.time.elapsedTime / 400))));
	},
	
	fin: function () {
		
	},
};