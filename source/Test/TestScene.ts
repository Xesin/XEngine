/// <reference path="../core2/Scenes/Scene.ts" />
let actor : XEngine2.TestActor = null;
declare var dat: any;
namespace XEngine2 {
	export class TestScene extends Scene {

		private lightColor: string;
		public dirLight: DirectionalLight;

		private columnsMat: BlinnPhongMaterial;

		private activatedPost: boolean;

		public preload()
		{
			this.game.loader.image('test', 'img/angry_unicorn.png');
			// this.game.loader.obj('img/sponza.obj', 'img/sponza.mtl');
		}

		public start()
		{
			this.activatedPost = false;
			this.game.time.frameLimit = 60;

			this.game.input.createAction("Fire", [KEY_CODE.L, KEY_CODE.MOUSE_LEFT_CLICK]);
			this.game.input.createAxis("MoveForward", [KEY_CODE.W, KEY_CODE.S, KEY_CODE.UP, KEY_CODE.DOWN], [1, -1, 1, -1]);
			this.game.input.createAxis("MoveRight", [KEY_CODE.A, KEY_CODE.D], [1, -1]);
			this.game.input.createAxis("LookLeft", [KEY_CODE.MOUSE_X], [1]);
			this.game.input.createAxis("LookUp", [KEY_CODE.MOUSE_Y], [-1]);

			this.game.input.bindAction("Fire", KEY_ACTION.PRESSED, this, function()
			{
				this.activatedPost = !this.activatedPost;
			});

			this.dirLight = new DirectionalLight(game);
            this.dirLight.transform.rotation.y = 45;
            this.dirLight.transform.rotation.x = 85;
			this.dirLight.intensity = 0.7;
			this.dirLight.color.fromHexString("#f0dc81");

			let pointLightColor = new Color(0.9,0.4,0.8,1.0);
            pointLightColor.fromHexString("#f2f7a5");
			
			let pointLight = new PointLight(game);

			this["pointLight"] = pointLight;
			pointLight.transform.position.y = 20;
			pointLight.color = pointLightColor;
			
			actor = this.Instantiate(XEngine2.TestActor) as TestActor;
			actor.rootComponent.transform.position.x = 0;
			actor.rootComponent.transform.position.y = 0;
			actor.rootComponent.transform.position.z = 0;
			for (const meshName in this.game.cache.geometries) 
            {
				const mesh = this.game.cache.geometries[meshName];
				let meshActor = this.Instantiate(XEngine2.StaticMeshActor, meshName) as StaticMeshActor;
				meshActor = meshActor;
				meshActor.rootComponent.transform.scale.setTo(0.10);
				meshActor.staticMesh.Mesh = mesh;
			}

			let quad = this.Instantiate(XEngine2.StaticMeshActor, "QuadTest") as StaticMeshActor;
			quad.Transform.position.y = 0;
			quad.staticMesh.Mesh = new XEngine2.BasicGeometries.SphereMesh(BlinnPhongMaterial.SharedInstance, 10, 25,25);
			
			// this.columnsMat = (this.actors[6] as StaticMeshActor).staticMesh.Mesh.materials[0] as BlinnPhongMaterial;

			// this.columnsMat.renderQueue = RenderQueue.TRANSPARENT;
			// this.columnsMat.alphaClip.value = 0;
			// this.columnsMat.blendMode = BlendMode.Multiply;

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

			// controller = gui.add(this.columnsMat.color.value, 'w', 0, 1);
			// controller.name('alpha');
			// controller.listen();
			// controller.onChange(function(value){
			// 	_that.onAlphaChange(this.object, value);
			// });

			controller = gui.add(this.dirLight, 'shadowBias', 0, 1);
			controller.name('bias');
			controller.listen();

			controller = gui.add(pointLight, 'intensity', 0, 2000);
			controller.name('pointLight intensity');
			controller.listen();
			controller.onChange(function(value){
				this.object.value = value;
			});

			controller = gui.add(pointLight, 'radius', 0, 200);
			controller.name('radius');
			controller.listen();
			controller.onChange(function(value){
				this.object.value = value;
			});

		}

		private onFloatValueChange(object: any, value: any) {
			if(value == 0.0) value = 0.0000001;
			object.value = value;
		}

		private onValueChange(object: any, value: any) {
			this.dirLight.color.fromHexString(value);
		}

		private onAlphaChange(object: any, value: any)
		{
			(this.columnsMat.color.value as Vector4).w = value;
		}

		public onWillRenderImage(renderer: Renderer, src: RenderTarget, dst: RenderTarget)
		{
			if(this.activatedPost){
				renderer.blit(src, dst, DesaturatePostMaterial.SharedInstance);
			}
		}
	}
}

let game = null;

function initGame(){
	console.log('Arrancando El juego');
	game = new XEngine2.Game(1920, 1080, 'contenedor', XEngine2.ScaleType.PRESERVE_ASPECT);							//iniciamos el juego
	game.sceneManager.add(new XEngine2.TestScene('test', game));
	game.sceneManager.start('test');
 
	game.setBackgroundColor(100,100,100, 255);
 }