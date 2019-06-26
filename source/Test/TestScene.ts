/// <reference path="../core2/Scenes/Scene.ts" />
let actor : XEngine2.Actor = null;
namespace XEngine2 {
	export class TestScene extends Scene {

		public preload()
		{
			this.game.loader.image('test', 'img/angry_unicorn.png');
			this.game.loader.obj('img/sponza.obj', 'img/sponza.mtl');
		}

		public start()
		{
			BasicMaterial.SharedInstance.albedo.value = this.game.cache.image('test');
			this.game.time.frameLimit = 60;
			actor = this.Instantiate(XEngine2.TestActor);
			actor.rootComponent.transform.position.x = 0;
			actor.rootComponent.transform.position.y = -0.5;
			actor.rootComponent.transform.position.z = -5;
			actor.rootComponent.transform.scale.setTo(0.5);



			// actor = this.Instantiate(XEngine2.TestActor);
			// actor.rootComponent.transform.position.x = -2;
			// actor.rootComponent.transform.position.y = -0.5;
			// actor.rootComponent.transform.position.z = -5;
			
		}

		public update (deltaTime: number) {
			super.update(deltaTime);

			if(this.game.input.isDown(KEY_CODE.W))
			{
				let fwVector = this.mainCamera.transform.forward();
				fwVector.scalar(100 * deltaTime);
				this.mainCamera.transform.position.sub(fwVector);

			}
			if(this.game.input.isDown(KEY_CODE.S))
			{
				let fwVector = this.mainCamera.transform.forward();
				fwVector.scalar(100 * deltaTime);
				this.mainCamera.transform.position.add(fwVector);
			}

			if(this.game.input.isDown(KEY_CODE.SPACE))
			{
				this.mainCamera.transform.position.y += 100 * deltaTime;

			}

			if(this.game.input.isDown(KEY_CODE.CTRL))
			{
				this.mainCamera.transform.position.y -= 100 * deltaTime;

			}

			if(this.game.input.isDown(KEY_CODE.Q))
			{
				this.mainCamera.transform.rotation.y -= 50 * deltaTime;

			}

			if(this.game.input.isDown(KEY_CODE.E))
			{
				this.mainCamera.transform.rotation.y += 50 * deltaTime;

			}
		}
	}
}

let game = null;

function initGame(){
	console.log('Arrancando El juego');
	game = new XEngine2.Game(1280, 720, 'contenedor', XEngine2.ScaleType.PRESERVE_ASPECT);							//iniciamos el juego
	game.sceneManager.add(new XEngine2.TestScene('test', game));
	game.sceneManager.start('test');
 
	game.setBackgroundColor(100,100,100, 255);
 }