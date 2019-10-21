/// <reference path="../core/Scenes/Scene.ts" />
let actor : XEngine2.TestActor = null;
declare var dat: any;
namespace XEngine2 {
	export class TestScene extends Scene {

		private lightColor: string;
		private dirLight: DirectionalLight;

		private columnsMat: BlinnPhongMaterial;

		private activatedPost: boolean;

		public preload()
		{
			this.game.loader.image('test', 'img/angry_unicorn.png');
			this.game.loader.obj('img/sponza.obj', 'img/sponza.mtl');
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

			this.dirLight = new DirectionalLight(this.game);
			this.dirLight.transform.rotation.x = 85;
			this.dirLight.transform.rotation.y = 45;

			// let pointLightColor = new Color(0.9,0.4,0.8,1.0);
            // pointLightColor.fromHexString("#f2f7a5");
			
			// let pointLight = new SpotLight(game);

			// this["pointLight"] = pointLight;
			// pointLight.transform.position.y = 20;
			// pointLight.color = pointLightColor;
			// pointLight.intensity = 5000;
			// pointLight.radius = 5000;
			// pointLight.castShadow = true;
			
			actor = this.Instantiate(XEngine2.TestActor) as TestActor;
			actor.rootComponent.transform.position.x = 0;
			actor.rootComponent.transform.position.y = 0;
			actor.rootComponent.transform.position.z = 0;
			for (const meshName in this.game.cache.geometries) 
            {

				const mesh = this.game.cache.geometries[meshName];
				let meshActor = this.Instantiate(XEngine2.StaticMeshActor, meshName) as StaticMeshActor;
				meshActor.rootComponent.transform.scale.setTo(0.10);
				meshActor.staticMesh.Mesh = mesh;
			}

			// let quad = this.Instantiate(XEngine2.StaticMeshActor, "QuadTest") as StaticMeshActor;
			// quad.Transform.position.y = 0;
			// quad.staticMesh.Mesh = new XEngine2.BasicGeometries.SphereMesh(BlinnPhongMaterial.SharedInstance, 10, 25,25);
			
			// this.columnsMat = (this.actors[6] as StaticMeshActor).staticMesh.Mesh.materials[0] as BlinnPhongMaterial;

			// this.columnsMat.renderQueue = RenderQueue.TRANSPARENT;
			// this.columnsMat.alphaClip.value = 0;
			// this.columnsMat.blendMode = BlendMode.Multiply;


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