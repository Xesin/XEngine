var Sponza = function (game) {
	
};

var circle;
var text;

Sponza.prototype = {
	
	preload: function () {
		// this.game.load.image('normal', 'img/textures/spnza_bricks_a_ddn.tga');
	},
	
	start: function () {
		var dirLight = this.game.add.directionalLight(1.0);
		dirLight.transform.rotation.setTo(0.1, 0.8, 0.8);
		var dirLight = this.game.add.pointLight(50.0, 20);
		dirLight.transform.position.setTo(-280, 50.0, 112.0);
		dirLight.lightColor.y = 0.2;
		dirLight.lightColor.z = 0.2;
		dirLight = this.game.add.pointLight(50, 20);
		dirLight.transform.position.setTo(-280.0, 50, -112);
		dirLight.lightColor.y = 0.2;
		dirLight.lightColor.z = 0.2;
		dirLight = this.game.add.pointLight(50, 20);
		dirLight.transform.position.setTo(280.0, 50, -112);
		dirLight.lightColor.y = 0.2;
		dirLight.lightColor.z = 0.2;
		dirLight = this.game.add.pointLight(50.0, 20);
		dirLight.transform.position.setTo(280, 50.0, 112.0);
		dirLight.lightColor.y = 0.2;
		dirLight.lightColor.z = 0.2;

		
		// var dirLight = this.game.add.pointLight(3000.0, 10.0);
		// dirLight.transform.position.setTo(0, 200.0, 0);
		
		for(geom in this.game.cache.geometries){
			let mesh = this.game.add.mesh(0, 0, 0, this.game.cache.geometries[geom]);
			mesh.transform.scale.setTo(0.25);
		}

		// var mat = new XEngine.PhongMaterial();
		// // mat.setNormal(this.game.cache.images['normal']._texture, this.game.context);
		// var sphereGeom = new XEngine.SphereGeometry(20, 40, 40);
		// this.game.add.mesh(-10, 0, 50, sphereGeom, mat);

		this.rot = 0;
		this.upOffset = 0;
		this.game.camera.transform.position.y = 60;
		// this.game.camera.transform.position.x = -10;
		this.game.camera.lookAt.x = -500;
		this.game.camera.lookAt.y = 5;
		this.game.camera.lookAt.z = 50;
		this.velocity = 90;
		

		this.game.input.onInputMove.add(this.onMove, this);
	},

	onMove: function(pointer) {
	},
	
	update : function (deltaTime) {

		if(this.game.input.isDown(XEngine.KEY_CODE.W)){
			this.game.camera.transform.position.sub(this.game.camera.transform.forward().scalar(this.velocity *deltaTime));
		}else if(this.game.input.isDown(XEngine.KEY_CODE.S)){
			this.game.camera.transform.position.add(this.game.camera.transform.forward().scalar(this.velocity *deltaTime));
		}

		if(this.game.input.isDown(XEngine.KEY_CODE.D)){
			this.game.camera.transform.position.add(this.game.camera.transform.right().scalar(this.velocity *deltaTime));
		}else if(this.game.input.isDown(XEngine.KEY_CODE.A)){
			this.game.camera.transform.position.sub(this.game.camera.transform.right().scalar(this.velocity *deltaTime));
		}

		if(this.game.input.isDown(XEngine.KEY_CODE.E) || this.game.input.isDown(XEngine.KEY_CODE.RIGHT)){
			this.rot += deltaTime * 1.5;
		}else if(this.game.input.isDown(XEngine.KEY_CODE.Q) || this.game.input.isDown(XEngine.KEY_CODE.LEFT)){
			this.rot -= deltaTime * 1.5;
		}

		if(this.game.input.isDown(XEngine.KEY_CODE.R)){
			this.game.camera.transform.position.y += 45 * deltaTime;
		}else if(this.game.input.isDown(XEngine.KEY_CODE.F)){
			this.game.camera.transform.position.y -= 45 * deltaTime;
		}

		if(this.game.input.isDown(XEngine.KEY_CODE.UP)){
			this.upOffset += 1.5 * deltaTime;
		}else if(this.game.input.isDown(XEngine.KEY_CODE.DOWN)){
			this.upOffset -= 1.5 * deltaTime;
		}

		this.game.camera.lookAt.x = Math.cos(this.rot) + this.game.camera.transform.position.x;
		this.game.camera.lookAt.z = Math.sin(this.rot) + this.game.camera.transform.position.z;
		this.game.camera.lookAt.y = this.upOffset + this.game.camera.transform.position.y;
	},
	
	fin: function () {
		
	},
};