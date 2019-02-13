//Para quitar warnings por las cosas que están en otro js
/* global XEngine*/
var game;
function initGame(){
   console.log('Arrancando El juego');
   game = new XEngine.Game(1280, 720, 'contenedor');							//iniciamos el juego
   game.frameLimit = 120;
   game.scale.scaleType = XEngine.Scale.SHOW_ALL;
   game.state.add('start', Start);
   game.state.add('sponza', XEngine.Test);
   game.state.start('start');


   game.setBackgroundColor(100,100,100, 255);
}

function setLight(value, value1, value2) {
	for(var mat in game.cache.materials){
		game.cache.materials[mat].uniforms["light[0].position"].value.setTo(value, value1, value2);
	}
}

function setNormal(value, value1, value2) {
	for(var mat in game.cache.materials){
		game.cache.materials[mat].baseUniforms["normalIntensity"].value = value;
	}
}

var Start = function (game) {
	
};

var circle;
var text;

Start.prototype = {
	
	preload: function () {
		this.game.load.obj('img/sponza.obj', 'img/sponza.mtl');
		this.game.load.onCompleteFile.add(this.onCompleteFile, this);
		// this.game.load.image('normal', 'img/textures/spnza_bricks_a_ddn.tga');
		
	},
	
	start: function () {
		this.game.state.start("sponza");
	},

	onCompleteFile: function(progress) {

	},

	render: function(renderer){
		this.game.camera.render(renderer);
	},

	
	fin: function () {
		
	},

};
