//Para quitar warnings por las cosas que están en otro js
/* global XEngine*/
var game;
function initGame(){
   console.log('Arrancando El juego');
   game = new XEngine.Game(1200, 720, 'contenedor');							//iniciamos el juego
   game.frameLimit = 120;
   game.scale.scaleType = XEngine.Scale.SHOW_ALL;
   game.state.add('space', Start);
   game.state.start('space');


   game.setBackgroundColor('rgb(100,100,100)');
}

var Start = function (game) {
	
};

Start.prototype = {
	
	preload: function () {
		
		//this.game.load.image('candy', 'img/candy0.png');
	},
	
	start: function () {
		/*this.game.physics.startSystem();
		//this.candy = this.game.add.sprite(0,0, 'candy');
		//this.game.tween.add(this.candy.position).to({x : 200}, 1000, XEngine.Easing.Linear);
		var candy = this.game.add.sprite(100, 200, 'candy');
		candy.frame = 1;
		candy.animation.add('candy', [0,1,2,3], 100, true);
		candy.animation.play('candy');
		var text = this.game.add.text(100,160, 'Hello World', 30, 'Roboto');
		text.strokeWidth = 3;
		text.anchor.setTo(0.5);
		this.angle = this.game.add.text(0,0, '0', 20);
		this.angle.color = 'red';*/
		this.stats = new Stats()
		document.body.appendChild(this.stats.dom)
		for(var i = 0; i< 2000; i++){
			this.game.add.rect(XEngine.Mathf.randomRange(0, 1200),XEngine.Mathf.randomRange(0, 720),30, 30);
		}
	},
	
	update : function (deltaTime) {
		/*var angle = XEngine.Mathf.angleBetween(100, 160, this.game.input.pointer.x, this.game.input.pointer.y);
		this.angle.text = Math.cos(angle);*/
		this.stats.update();
	},
	
	fin: function () {
		
	},
};