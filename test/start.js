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
		this.game.load.obj('img/sponza2.obj');
	},
	
	start: function () {
		for(geom in this.game.cache.geometries){
			this.text = this.game.add.mesh(0, 0, 0, this.game.cache.geometries[geom]);
		}
		this.rot = 0;

		this.game.camera.transform.position.y = 30;
		this.game.camera.transform.position.x = -10;
		this.game.camera.lookAt.x = -500;
		this.game.camera.lookAt.y = 5;
		this.game.camera.lookAt.z = 50;
		

		this.game.input.onInputMove.add(this.onMove, this);
	},

	onMove: function(pointer) {
	},
	
	update : function (deltaTime) {

		if(this.game.input.isDown(XEngine.KEY_CODE.W)){
			this.game.camera.transform.position.add(this.game.camera.transform.forward().scalar(40*deltaTime));
		}else if(this.game.input.isDown(XEngine.KEY_CODE.S)){
			this.game.camera.transform.position.sub(this.game.camera.transform.forward().scalar(40*deltaTime));
		}

		if(this.game.input.isDown(XEngine.KEY_CODE.D)){
			this.rot += deltaTime * 1.5;
		}else if(this.game.input.isDown(XEngine.KEY_CODE.A)){
			this.rot -= deltaTime * 1.5;
		}

		if(this.game.input.isDown(XEngine.KEY_CODE.R)){
			this.game.camera.transform.position.y += 20 * deltaTime;
		}else if(this.game.input.isDown(XEngine.KEY_CODE.F)){
			this.game.camera.transform.position.y -= 20 * deltaTime;
		}

		this.game.camera.lookAt.x = Math.cos(this.rot) * 200 + this.game.camera.transform.position.x;
		this.game.camera.lookAt.z = Math.sin(this.rot) * 200 + this.game.camera.transform.position.z;
		this.game.camera.lookAt.y = this.game.camera.transform.position.y;
	},
	
	fin: function () {
		
	},
};