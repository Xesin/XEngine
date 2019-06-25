/// <reference path="../core2/Scenes/Scene.ts" />
let actor : XEngine2.Actor = null;
namespace XEngine2 {
	export class TestScene extends Scene {

		public preload()
		{
			this.game.loader.image('test', 'img/angry_unicorn.png');
		}

		public start()
		{
			// this.game.time.frameLimit = 60;
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