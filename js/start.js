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


   game.setBackgroundColor(100,100,100, 255);
}

var Start = function (game) {
	
};

var circle;

Start.prototype = {
	
	preload: function () {
		
		this.game.load.spriteSheet('test', 'img/animations.png', 136, 204);
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
		/*for(var i = 0; i< 2000; i++){
			var rect = this.game.add.rect(XEngine.Mathf.randomRange(0, 1200),XEngine.Mathf.randomRange(0, 720),30, 30);
			rect.setColor(XEngine.Mathf.randomRange(0, 1), XEngine.Mathf.randomRange(0, 1), XEngine.Mathf.randomRange(0, 1));
		}*/

		this.sprite = this.game.add.sprite(this.game.width / 2, this.game.height / 2, 'test');
		this.sprite.anchor.setTo(0.5);
		this.sprite.scale.setTo(1.5);
		this.sprite.animation.add('idle', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 75, true);
		//Set de la animaci?n de saltar
		this.sprite.animation.add('jump', [10, 11, 12, 13], 120, false);
		//Set de la animaci?n de andar
		this.sprite.animation.add('walk', [21, 22, 23, 24, 25, 26, 27, 28], 100, true);
		this.sprite.animation.play('idle');                                                //Arrancamos el idle
	},
	
	update : function (deltaTime) {
		/*var angle = XEngine.Mathf.angleBetween(100, 160, this.game.input.pointer.x, this.game.input.pointer.y);
		this.angle.text = Math.cos(angle);*/
		this.stats.update();
		//this.game.camera.position.y += 1.0;
		if(this.game.input.isPressed(XEngine.KeyCode.D)){
			this.sprite.position.x += 200 * deltaTime;
			this.sprite.animation.play('walk');
		}
		if(this.game.input.isPressed(XEngine.KeyCode.A)){
			this.sprite.position.x -= 200 * deltaTime;
			this.sprite.animation.play('walk');
		}
		if(this.game.input.isPressed(XEngine.KeyCode.W)){
			this.sprite.position.y -= 200 * deltaTime;
		}
		if(this.game.input.isPressed(XEngine.KeyCode.S)){
			this.sprite.position.y += 200 * deltaTime;
		}
	},
	
	fin: function () {
		
	},
};