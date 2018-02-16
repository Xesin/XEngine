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
		// this.game.load.image('checker', 'img/checker.jpg');
	},
	
	start: function () {
		// for(var i = 0; i < 200; i++) {
			// this.text = this.game.add.existing(new XEngine.CubeMesh(this.game, XEngine.Mathf.randomIntRange(-100,100), XEngine.Mathf.randomIntRange(-100,100), -200.0, 100), true, true);	
		var boxGeom = new XEngine.BoxGeometry(1, 1, 1);
		var sphereGeom = new XEngine.SphereGeometry(1, 30, 30);
		this.text = this.game.add.mesh(0, 0, -20, boxGeom);	
		this.text = this.game.add.mesh(2, 0, -20, boxGeom);	
		this.text = this.game.add.mesh(-2, 0, -20, boxGeom);	
		this.text = this.game.add.mesh(1, 2, -20, boxGeom);	
		this.text = this.game.add.mesh(0, -2, -20, sphereGeom);	
		this.text.shader._setTexture(this.game.cache.image('unicorn')._texture);
		this.game.add.sprite(10, 10, 'unicorn');
		// text = this.text;
		
	},
	
	update : function (deltaTime) {
		// text.rotation += 20 * deltaTime;
		this.text.transform.rotation.x += 10* deltaTime;
		this.text.transform.rotation.y += 5* deltaTime;
		this.text.transform.rotation.z += 2* deltaTime;
		// this.text.scale.setTo(XEngine.Mathf.lerp(0.2, 1.2, Math.abs(Math.cos(this.game.time.elapsedTime / 400))));
	},
	
	fin: function () {
		
	},
};