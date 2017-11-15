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
		
		this.game.load.jsonSpriteSheet('player', 'img/animations.png', 'img/man.json');
		this.game.load.image('test2', 'img/angry_unicorn.png');
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
			var rect = this.game.add.sprite(XEngine.Mathf.randomRange(-500, 1800),XEngine.Mathf.randomRange(-500, 1400),'test2');
			rect.setColor(XEngine.Mathf.randomRange(0, 1), XEngine.Mathf.randomRange(0, 1), XEngine.Mathf.randomRange(0, 1));
		}

		/*
		this.unicorn = this.game.add.sprite(200, 200, 'test2');
		this.sprite = this.game.add.sprite(this.game.width / 2, this.game.height / 2, 'player');
		this.sprite.anchor.setTo(0.5);
		this.sprite.scale.setTo(1.5);
		this.sprite.animation.add('idle', ['manIdle.0000', 'manIdle.0001', 'manIdle.0002', 'manIdle.0003', 'manIdle.0004', 'manIdle.0005', 'manIdle.0006', 'manIdle.0007', 'manIdle.0008', 'manIdle.0009'], 75, true);
		this.sprite.animation.add('jump', ['manJump.0002', 'manJump.0003', 'manJump.0004', 'manJump.0005'], 120, false);
		this.sprite.animation.add('walk',['manWalk.0001', 'manWalk.0002', 'manWalk.0003', 'manWalk.0004', 'manWalk.0005', 'manWalk.0006', 'manWalk.0007', 'manWalk.0008'], 100, true);
		this.sprite.animation.play('idle');
		
		this.unicorn.parent = this.sprite;
		this.unicorn.anchor.setTo(0.5);
		var button = this.game.add.button(80, 80, 'test2', 'player', 'test2', 'test2');
		button.fixedToCamera = true;
		button.onClick.addOnce(function(){console.log("Click!")}, this);

		this.game.add.circle(300, 300, 50, 50);*/
	},
	
	update : function (deltaTime) {
		/*var angle = XEngine.Mathf.angleBetween(100, 160, this.game.input.pointer.x, this.game.input.pointer.y);
		this.angle.text = Math.cos(angle);*/
		this.stats.update();
		//this.game.camera.position.y += 1.0;
		/*if(this.game.input.isPressed(XEngine.KeyCode.D)){
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
		//this.game.camera.position.x += 100 * deltaTime;
		this.unicorn.rotation += 45 * deltaTime; 
		this.sprite.rotation += 45 * deltaTime; */
	},
	
	fin: function () {
		
	},
};