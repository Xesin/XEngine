//Para quitar warnings por las cosas que están en otro js
/* global XEngine*/
var game;
function initGame(){
   console.log('Arrancando El juego');
   game = new XEngine.Game(1200, 720, 'contenedor');							//iniciamos el juego
   game.frameLimit = 120;
   game.scale.scaleType = XEngine.Scale.SHOW_ALL;
   game.state.add('unicorns', Start);
   game.state.add('anim', AnimScene);
   game.state.add('shader', CustomShader);
   game.state.add('gimp', Gimp);
   game.state.start('anim');


   game.setBackgroundColor(100,100,100, 255);
}

var Start = function (game) {
	
};

var circle;

Start.prototype = {
	
	preload: function () {
		this.game.load.image('test2', 'img/angry_unicorn.png');
		this.game.load.image('back1', 'img/back1.jpg');
	},
	
	start: function () {
		this.game.autoCulling = true;
		for(var i = 0; i< 20000; i++){
			var rect = this.game.add.image(XEngine.Mathf.randomRange(-5000, 5200),XEngine.Mathf.randomRange(-2000, 2000),'test2');
			rect.setColor(XEngine.Mathf.randomRange(0x000000, 0xffffff));
		}

		var img = this.game.add.image(0, 0, 'back1');
		img.width /= 4;
		img.height /= 4;
		this.game.input.onKeyUp.add(function(event){
            if(event.keyCode == XEngine.KeyCode.ONE){
               	this.game.input.onKeyUp._destroy();
				this.game.input.onClick._destroy();
                this.game.state.start('anim')
            }
            if(event.keyCode == XEngine.KeyCode.THREE){
                this.game.input.onKeyUp._destroy();
				this.game.input.onClick._destroy();
                this.game.state.start('shader');
            }
        },this);
		this.game.input.onClick.add(function(){
			this.game.input.onKeyUp._destroy();
			this.game.input.onClick._destroy();
			this.game.state.start('shader');
        },this);
	},
	
	update : function (deltaTime) {
	},
	
	fin: function () {
		
	},
};