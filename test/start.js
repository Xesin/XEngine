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
		// this.game.load.image('normal', 'img/textures/spnza_bricks_a_ddn.tga');
	},
	
	start: function () {
		var dirLight = this.game.add.pointLight(200.0, 200.0);
		dirLight.transform.position.setTo(0.0, 100.0, 0.0);
		dirLight = this.game.add.pointLight(200.0, 100.0);
		dirLight.transform.position.setTo(400.0, 100.0, 0.0);
		for(geom in this.game.cache.geometries){
			let mesh = this.game.add.mesh(0, 0, 0, this.game.cache.geometries[geom]);
		}

		// var mat = new XEngine.PhongMaterial();
		// // mat.setNormal(this.game.cache.images['normal']._texture, this.game.context);
		// var sphereGeom = new XEngine.SphereGeometry(20, 40, 40);
		// this.game.add.mesh(-10, 0, 50, sphereGeom, mat);

		this.rot = 0;

		this.game.camera.transform.position.y = 60;
		// this.game.camera.transform.position.x = -10;
		this.game.camera.lookAt.x = -500;
		this.game.camera.lookAt.y = 5;
		this.game.camera.lookAt.z = 50;
		

		this.game.input.onInputMove.add(this.onMove, this);
	},

	onMove: function(pointer) {
	},
	
	update : function (deltaTime) {

		if(this.game.input.isDown(XEngine.KEY_CODE.W)){
			this.game.camera.transform.position.add(this.game.camera.transform.forward().scalar(180*deltaTime));
		}else if(this.game.input.isDown(XEngine.KEY_CODE.S)){
			this.game.camera.transform.position.sub(this.game.camera.transform.forward().scalar(180*deltaTime));
		}

		if(this.game.input.isDown(XEngine.KEY_CODE.D)){
			this.game.camera.transform.position.add(this.game.camera.transform.right().scalar(180*deltaTime));
		}else if(this.game.input.isDown(XEngine.KEY_CODE.A)){
			this.game.camera.transform.position.sub(this.game.camera.transform.right().scalar(180*deltaTime));
		}

		if(this.game.input.isDown(XEngine.KEY_CODE.E)){
			this.rot += deltaTime * 1.5;
		}else if(this.game.input.isDown(XEngine.KEY_CODE.Q)){
			this.rot -= deltaTime * 1.5;
		}

		if(this.game.input.isDown(XEngine.KEY_CODE.R)){
			this.game.camera.transform.position.y += 90 * deltaTime;
		}else if(this.game.input.isDown(XEngine.KEY_CODE.F)){
			this.game.camera.transform.position.y -= 90 * deltaTime;
		}

		this.game.camera.lookAt.x = Math.cos(this.rot) * 200 + this.game.camera.transform.position.x;
		this.game.camera.lookAt.z = Math.sin(this.rot) * 200 + this.game.camera.transform.position.z;
		this.game.camera.lookAt.y = this.game.camera.transform.position.y;
	},
	
	fin: function () {
		
	},
};