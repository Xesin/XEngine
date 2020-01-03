import {Game} from "../Game";
import {Scene} from "./Scene";
import {Renderer} from "../Render/Renderer";

export class SceneManager {

    public currentScene: Scene;
    private game: Game;
    private scenes: Array<Scene>;

    constructor(game: Game) {
        this.game = game;
        this.scenes = new Array();
        this.currentScene = null;
    }

    public add(scene: Scene) {
        this.scenes[scene.name] = scene;
    }

    /**
     * Arranca un estado
     * @method XEngine.StateManager#start
     * @param {String} sceneName - KeyName del estado
     */
    public start(sceneName: string) {
        let _this = this;
        if (_this.currentScene != null) {
            _this.game.destroy();
            // if (_this.currentScene.destroy !== undefined) {
            //     _this.currentScene.destroy();
            // }
            delete _this.currentScene;
            _this.currentScene = null;
        }
        let scene = _this.scenes[sceneName];

        if (scene == null) {
            console.error("no scene for name " + sceneName);
            return;
        }

        _this.currentScene = scene;
        _this.currentScene.preload();
        _this.game.loader._startPreload();
        _this.game.scale.updateScale();
    }

    public restart() {
        this.start(this.currentScene.name);
    }

    public update(deltaTime: number) {
        if (this.currentScene != null && this.currentScene !== undefined) {
            this.currentScene.update(deltaTime);
        }
    }

    public render(renderer: Renderer) {
        if (this.currentScene != null && this.currentScene !== undefined) {
            this.currentScene.Render(renderer);
        }
    }
}
