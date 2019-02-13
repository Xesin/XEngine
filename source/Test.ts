namespace XEngine {
	export class Test {
		public game: Game;

		private velocity: number;
		
		public start () {
	
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
			
			for(let geom in this.game.cache.geometries){
				let mesh = this.game.add.mesh(0, 0, 0, this.game.cache.geometries[geom]);
				mesh.transform.scale.setTo(0.25);
			}

			// let material = new PBRMaterial();
			// material.lightOn = true;
			// material.metallic = 1;

			// this.game.add.mesh(0, 0, 0, new SphereGeometry(5, 32, 32), material);
	
			this.game.camera.transform.position.y = 0;
			this.velocity = 90;
			
	
			this.game.input.onInputMove.add(this.onMove, this);
		}
	
		public onMove(pointer) {
		}
		
		public update (deltaTime) {
	
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
				this.game.camera.transform.rotation.y -= this.velocity *deltaTime;
			}else if(this.game.input.isDown(XEngine.KEY_CODE.Q) || this.game.input.isDown(XEngine.KEY_CODE.LEFT)){
				this.game.camera.transform.rotation.y += this.velocity *deltaTime;
			}
	
			if(this.game.input.isDown(XEngine.KEY_CODE.R)){
				this.game.camera.transform.position.y += 45 * deltaTime;
			}else if(this.game.input.isDown(XEngine.KEY_CODE.F)){
				this.game.camera.transform.position.y -= 45 * deltaTime;
			}
	
			if(this.game.input.isDown(XEngine.KEY_CODE.UP)){
				this.game.camera.transform.rotation.x += this.velocity *deltaTime;
			}else if(this.game.input.isDown(XEngine.KEY_CODE.DOWN)){
				this.game.camera.transform.rotation.x -= this.velocity *deltaTime;
			}
			this.game.camera.transform.rotation.x = XEngine.Mathf.clamp(this.game.camera.transform.rotation.x, -80, 80);
		}
	
		public render(renderer) {
			this.game.camera.renderScene(renderer);
		}
		
		public fin () {
			
		}
	}
}