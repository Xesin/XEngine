/// <reference path="../core2/Scenes/Scene.ts" />
let actor : XEngine2.TestActor = null;
declare var dat: any;
namespace XEngine2 {
	export class TestScene extends Scene {

		private lightColor: string;

		public preload()
		{
			this.game.loader.image('test', 'img/angry_unicorn.png');
			this.game.loader.obj('img/sponza.obj', 'img/sponza.mtl');
		}

		public start()
		{
			this.game.time.frameLimit = 60;
			actor = this.Instantiate(XEngine2.TestActor) as TestActor;
			actor.rootComponent.transform.position.x = 0;
			actor.rootComponent.transform.position.y = -0.5;
			actor.rootComponent.transform.position.z = -5;
			actor.rootComponent.transform.scale.setTo(0.5);



			// actor = this.Instantiate(XEngine2.TestActor);
			// actor.rootComponent.transform.position.x = -2;
			// actor.rootComponent.transform.position.y = -0.5;
			// actor.rootComponent.transform.position.z = -5;


			let gui = new dat.GUI();
			let _that = this;

			let controller = gui.add(actor.dirLight, 'intensity', 0, 10);
			controller.name('intensity');
			controller.listen();
			controller.onChange(function(value){
				_that.onFloatValueChange(this.object, value);
			});

			
			this.lightColor = '#' + actor.dirLight.color.getHexString();
			
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
			actor.dirLight.color.fromHexString(value);
		}

		public update (deltaTime: number) {
			super.update(deltaTime);

			if( this.game.input.isDown(KEY_CODE.W) )
			{
				let fwVector = this.mainCamera.transform.forward();
				fwVector.scalar(50 * deltaTime);
				this.mainCamera.transform.position.add(fwVector);

			}
			else if(this.game.input.isDown(KEY_CODE.S))
			{
				let fwVector = this.mainCamera.transform.forward();
				fwVector.scalar(50 * deltaTime);
				this.mainCamera.transform.position.sub(fwVector);
			}

			if(this.game.input.isDown(KEY_CODE.SPACE))
			{
				this.mainCamera.transform.position.y -= 50 * deltaTime;

			}
			else if(this.game.input.isDown(KEY_CODE.CTRL))
			{
				this.mainCamera.transform.position.y += 50 * deltaTime;

			}

			if(this.game.input.isDown(KEY_CODE.Q))
			{
				this.mainCamera.transform.rotation.y -= 90 * deltaTime;

			} 
			else if(this.game.input.isDown(KEY_CODE.E))
			{
				this.mainCamera.transform.rotation.y += 90 * deltaTime;

			}

			if(this.game.input.isDown(KEY_CODE.D))
			{
				let rightVector = this.mainCamera.transform.right();
				rightVector.scalar(50 * deltaTime);
				this.mainCamera.transform.position.sub(rightVector);

			}
			else if(this.game.input.isDown(KEY_CODE.A))
			{
				let rightVector = this.mainCamera.transform.right();
				rightVector.scalar(50 * deltaTime);
				this.mainCamera.transform.position.add(rightVector);
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