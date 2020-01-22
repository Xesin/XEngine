

import {Scene, DirectionalLight, Color, SpotLight, Game, KEY_CODE,
    KEY_ACTION, StaticMeshActor, Renderer, RenderTarget, Easing, ScaleType, SphereMesh} from "../XEngine";
import { TestActor } from "./TestActor";
import { CanvasComponent } from "../core/Components/UI/CanvasComponent";
import { LoadingScene } from "./LoadingScene";
import { BlinnPhongMaterial, BasicMaterial } from "../core/Render/Resources/Materials/_module/Materials";
import { Vector3 } from "../Math/Mathf";

declare var dat: any;
let actor: TestActor = null;

export class TestScene extends Scene {

    // private dirLight: DirectionalLight;
    // private spotLight: SpotLight;

    public static game;

    public preload() {
        this.game.loader.audio("music", "img/BlastProcessing.ogg");
    }

    public start() {
        this.game.time.frameLimit = 60;

        this.game.input.createAction("Fire", [KEY_CODE.L, KEY_CODE.MOUSE_LEFT_CLICK]);
        this.game.input.createAxis("MoveForward", [KEY_CODE.W, KEY_CODE.S, KEY_CODE.UP, KEY_CODE.DOWN], [1, -1, 1, -1]);
        this.game.input.createAxis("MoveRight", [KEY_CODE.A, KEY_CODE.D], [1, -1]);
        this.game.input.createAxis("LookLeft", [KEY_CODE.MOUSE_X], [1]);
        this.game.input.createAxis("LookUp", [KEY_CODE.MOUSE_Y], [-1]);

        this.game.input.bindAction("Fire", KEY_ACTION.PRESSED, this, function() {
            this.activatedPost = !this.activatedPost;
        });

        // let pointLightColor = new Color(0.9, 0.4, 0.8, 1.0);
        // pointLightColor.fromHexString("#f2f7a5");

        // this.dirLight = new DirectionalLight(this.game);
        // this.dirLight.transform.rotation.x = 85;
        // this.dirLight.transform.rotation.y = 45;
        // this.dirLight.color = pointLightColor;
        // this.dirLight.castShadow = true;

        // this.spotLight = new SpotLight(this.game);

        // this.spotLight.transform.position.y = 20;
        // this.spotLight.color = pointLightColor;
        // this.spotLight.spotAngle = 85;
        // this.spotLight.intensity = 600;
        // this.spotLight.distance = 2000;
        // this.spotLight.castShadow = false;

        // this.game.tween.add(this.spotLight.transform.position).to({x: 70}, 20000, Easing.Quad.InOut, true, 0, -1, true).from({x: -70});
        // this.game.tween.add(this.spotLight.transform.rotation).to({y: 180}, 7000, Easing.Quad.InOut, true, 0, -1, true).from({y: -180});

        actor = this.Instantiate(TestActor) as TestActor;
        actor.rootComponent.transform.position.x = 0;
        actor.rootComponent.transform.position.y = 0;
        actor.rootComponent.transform.position.z = -10;

        // for (const meshName in this.game.cache.geometries) {
        //     if (meshName) {
        //         const mesh = this.game.cache.geometries[meshName];
        //         let meshActor = this.Instantiate(StaticMeshActor, meshName) as StaticMeshActor;
        //         meshActor.rootComponent.transform.scale.setTo(0.10);
        //         meshActor.staticMesh.Mesh = mesh;
        //     }
        // }

        // for (const meshName in this.game.cache.geometries) {
        //     if (meshName) {
        //         const mesh = this.game.cache.geometries[meshName];
        //         let meshActor = this.Instantiate(StaticMeshActor, meshName) as StaticMeshActor;
        //         meshActor.rootComponent.transform.scale.setTo(0.10);
        //         meshActor.staticMesh.Mesh = mesh;
        //         meshActor.rootComponent.transform.position.x = 400;
        //     }
        // }

        let mat = this.game.createMaterialFromBase(BasicMaterial) as BasicMaterial;
        // let mat2 = this.game.createMaterialFromBase(BasicMaterial) as BasicMaterial;

        let geom = new SphereMesh(mat, 5, 5, 5);
        // let geom2 = new SphereMesh(mat2, 5, 5, 5);
        let sphereActor = this.Instantiate(StaticMeshActor, `mesh`) as StaticMeshActor;
        sphereActor.Transform.position.setTo(0, 0, 0);
        sphereActor.staticMesh.Mesh = geom;
        // for (let i = 0; i < 100; i ++) {
        //     let actor = this.Instantiate(StaticMeshActor, `mesh${i}`) as StaticMeshActor;
        //     actor.Transform.position.setTo(i, 0, 0);
        //     actor.staticMesh.Mesh = geom;
        // }

        // for (let j = 0; j < 100; j ++) {
        //     let actor = this.Instantiate(StaticMeshActor, `mesh${j}`) as StaticMeshActor;
        //     actor.Transform.position.setTo(0, 0, j);
        //     actor.staticMesh.Mesh = geom2;
        // }
        let mixer = this.game.audioEngine.createMixer();
        let mixerGroup = this.game.audioEngine.createMixerGroup();
        mixer.attachToGroup(mixerGroup);
        mixer.addLowPassFilter();
        let audio = this.game.cache.audio("music");
        audio.audioMixer = mixer;

        this.game.audioEngine.playAudioAtPosition(audio, new Vector3(), 0);
    }
}

export function initGame() {
    console.log("Arrancando El juego");
    let game = new Game(1920, 1080, "contenedor", ScaleType.PRESERVE_ASPECT);
    TestScene.game = game;
    game.sceneManager.add(new LoadingScene("loading", game));
    game.sceneManager.add(new TestScene("test", game));
    game.sceneManager.start("loading");
    game.setBackgroundColor(100, 100, 100, 255);
 }
