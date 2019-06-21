/// <reference path="../core2/Scenes/Scene.ts" />
namespace XEngine2 {
	export class TestScene extends Scene {

		public start()
		{
			this.Instantiate(XEngine2.TestActor);
		}

		public update (deltaTime: number) {

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