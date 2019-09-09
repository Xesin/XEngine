/// <reference path="../core2/Scenes/Scene.ts" />
let actor : XEngine2.TestActor = null;
declare var dat: any;
namespace XEngine2 {
	export class TestScene extends Scene {

		private lightColor: string;
		public dirLight: DirectionalLight;

		public preload()
		{
			this.game.loader.image('test', 'img/angry_unicorn.png');
			this.game.loader.obj('img/sponza.obj', 'img/sponza.mtl');
		}

		public start()
		{
			this.game.time.frameLimit = 60;

			this.game.input.createAction("Fire", [KEY_CODE.L]);
			this.game.input.createAxis("MoveForward", [KEY_CODE.W, KEY_CODE.S, KEY_CODE.UP, KEY_CODE.DOWN], [1, -1, 1, -1]);
			this.game.input.createAxis("MoveRight", [KEY_CODE.A, KEY_CODE.D], [1, -1]);
			this.game.input.createAxis("LookLeft", [KEY_CODE.MOUSE_X], [1]);
			this.game.input.createAxis("LookUp", [KEY_CODE.MOUSE_Y], [1]);

			this.dirLight = new DirectionalLight(game);
            this.dirLight.transform.rotation.y = 45;
            this.dirLight.transform.rotation.z = -75;
			this.dirLight.intensity = 0.7;
			this.dirLight.color.fromHexString("#f0dc81");
			
			actor = this.Instantiate(XEngine2.TestActor) as TestActor;
			actor.rootComponent.transform.position.x = 0;
			actor.rootComponent.transform.position.y = -20;
			actor.rootComponent.transform.position.z = -5;
			actor.rootComponent.transform.scale.setTo(0.5);
			for (const meshName in this.game.cache.geometries) 
            {
               
				const mesh = this.game.cache.geometries[meshName];
				let meshActor = this.Instantiate(XEngine2.StaticMeshActor, meshName) as StaticMeshActor;
				meshActor = meshActor;
				meshActor.rootComponent.transform.scale.setTo(0.10);
				meshActor.staticMesh.Mesh = mesh;
            }


			// actor = this.Instantiate(XEngine2.TestActor);
			// actor.rootComponent.transform.position.x = -2;
			// actor.rootComponent.transform.position.y = -0.5;
			// actor.rootComponent.transform.position.z = -5;


			let gui = new dat.GUI();
			let _that = this;

			let controller = gui.add(this.dirLight, 'intensity', 0, 10);
			controller.name('intensity');
			controller.listen();
			controller.onChange(function(value){
				_that.onFloatValueChange(this.object, value);
			});

			
			this.lightColor = '#' + this.dirLight.color.getHexString();
			
			controller = gui.addColor( this, 'lightColor', this.lightColor).name('color1');
			controller.onChange(function(value)
			{
				_that.onValueChange(this.object, value);
			});

		}

		private onFloatValueChange(object: any, value: any) {
			if(value == 0.0) value = 0.0000001;
			object.value = value;
		}

		private onValueChange(object: any, value: any) {
			this.dirLight.color.fromHexString(value);
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