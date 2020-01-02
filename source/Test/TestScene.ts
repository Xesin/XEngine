

declare var dat: any;

import {Scene} from "../core/XEngine"
import {DirectionalLight} from "../core/Components/Lights/DirectionalLight"
import {KEY_CODE} from "../Input/KeyCodes"
import {Renderer} from "../core/Render/Renderer"
import {RenderTarget} from "../core/Render/Resources/Texture/RenderTarget"
import {Game, ScaleType} from "../core/XEngine"

export class TestScene extends Scene {

    private lightColor: string;
    private dirLight: DirectionalLight;


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

        // this.game.input.bindAction("Fire", KEY_ACTION.PRESSED, this, function()
        // {
        // 	this.activatedPost = !this.activatedPost;
        // });

        // let pointLightColor = new Color(0.9,0.4,0.8,1.0);
        // pointLightColor.fromHexString("#f2f7a5");

        // this.dirLight = new DirectionalLight(this.game);
        // this.dirLight.transform.rotation.x = 85;
        // this.dirLight.transform.rotation.y = 45;
        // this.dirLight.color = pointLightColor;

        
        
        // let pointLight = new SpotLight(game);

        // this["pointLight"] = pointLight;
        // pointLight.transform.position.y = 20;
        // pointLight.color = pointLightColor;
        // pointLight.spotAngle = 85;
        // pointLight.intensity = 600;
        // pointLight.distance = 5000;
        // pointLight.castShadow = true;

        // this.game.tween.add(pointLight.transform.position).to({x: 70}, 20000, Easing.Quad.InOut, true, 0, -1, true).from({x: -70});
        // this.game.tween.add(pointLight.transform.rotation).to({y: 180}, 7000, Easing.Quad.InOut, true, 0, -1, true).from({y: -180});
        // for (const meshName in this.game.cache.geometries) 
        // {

        // 	const mesh = this.game.cache.geometries[meshName];
        // 	let meshActor = this.Instantiate(XEngine2.StaticMeshActor, meshName) as StaticMeshActor;
        // 	meshActor.rootComponent.transform.scale.setTo(0.10);
        // 	meshActor.staticMesh.Mesh = mesh;
        // }

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

    }
}


let game = null;

export function initGame(){
	console.log('Arrancando El juego');
	game = new Game(1920, 1080, 'contenedor', ScaleType.PRESERVE_ASPECT);							//iniciamos el juego
	game.sceneManager.add(new TestScene('test', game));
	game.sceneManager.start('test');
 
	game.setBackgroundColor(100,100,100, 255);
 }