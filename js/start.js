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
   game.state.start('anim');


   game.setBackgroundColor(100,100,100, 255);
}

var Start = function (game) {
	
};

var circle;

Start.prototype = {
	
	preload: function () {
		this.game.load.image('test2', 'img/angry_unicorn.png');
	},
	
	start: function () {
		this.game.autoCulling = false;
		for(var i = 0; i< 1000; i++){
			var rect = this.game.add.sprite(XEngine.Mathf.randomRange(-5000, 5200),XEngine.Mathf.randomRange(-2000, 2000),'test2');
			rect.setColor(XEngine.Mathf.randomRange(0, 1), XEngine.Mathf.randomRange(0, 1), XEngine.Mathf.randomRange(0, 1));
			rect.__proto__.update = function(deltaTime){
				this.rotation += deltaTime * 45;
			}
		}

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