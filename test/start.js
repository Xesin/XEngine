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
		this.game.load.bitmapFont('font1', 'img/font.png', 'img/font.fnt');
		this.game.load.image('unicorn', 'img/angry_unicorn.png');
		this.game.load.image('checker', 'img/checker.jpg');
	},
	
	start: function () {
		// for(var i = 0; i < 200; i++) {
			// this.text = this.game.add.existing(new XEngine.CubeMesh(this.game, XEngine.Mathf.randomIntRange(-100,100), XEngine.Mathf.randomIntRange(-100,100), -200.0, 100), true, true);	
		
		this.text = this.game.add.existing(new XEngine.CubeMesh(this.game, 0, 0, -200, 50, 0x003099), true, true);	
		// text = this.text;
		
	},
	
	update : function (deltaTime) {
		// text.rotation += 20 * deltaTime;
		this.text.transform.rotation.x += 10* deltaTime;
		this.text.transform.rotation.y += 5* deltaTime;
		this.text.transform.rotation.z += 2* deltaTime;

		this.sphere.transform.rotation.x += 20* deltaTime;
		this.sphere.transform.rotation.y += 10* deltaTime;
		this.sphere.transform.rotation.z += -32* deltaTime;

		
		// this.text.scale.setTo(XEngine.Mathf.lerp(0.2, 1.2, Math.abs(Math.cos(this.game.time.elapsedTime / 400))));
	},
	
	fin: function () {
		
	},
};