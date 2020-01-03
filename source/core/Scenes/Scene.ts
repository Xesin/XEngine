import {Game} from "../Game";
import {Actor} from "../GameObjects/Actor";
import {CameraComponent} from "../Components/Camera/CameraComponent";
import {Component} from "../Components/Component";
import {Transform} from "../../Math/Mathf";
import {Renderer} from "../Render/Renderer";
import {RenderTarget} from "../Render/Resources/Texture/RenderTarget";

export class Scene {
    public actors: Array<Actor>;
    public game: Game;
    public name: string;
    public mainCamera: CameraComponent;

    constructor(name: string, game: Game) {
        this.name = name;
        this.game = game;
        this.actors = new Array();
        this.mainCamera = new CameraComponent(game);
    }

    public Instantiate(actorToInstantiate: typeof Actor, name = "", transform: Transform = null): Actor {
        let instancedActor = new actorToInstantiate(this.game, name) as Actor;
        if (transform) {
            instancedActor.rootComponent.transform = transform;
        }

        this.actors.push(instancedActor);

        return instancedActor;
    }

    // tslint:disable-next-line: no-empty
    public preload() {

    }

    // tslint:disable-next-line: no-empty
    public start() {

    }

    public update(deltaTime: number) {
        this.actors.forEach(actor => {
            if (actor.canUpdate) {
                actor.update(deltaTime);
            }
        });
        this.actors.removePending();
    }

    public Render(renderer: Renderer, camera = this.mainCamera) {
        if (camera != null) {
            renderer.render(this, camera);
        }
    }

    // tslint:disable-next-line: no-empty
    public onWillRenderImage(renderer: Renderer, src: RenderTarget, dst: RenderTarget) {

    }


    public FindAll<T extends Actor>(className: typeof Actor): Array<T> {
        let result = new Array<Actor>();
        this.actors.forEach(actor => {
            if ((actor instanceof className) && result.indexOf(actor) === -1) {
                result.push(actor);
            }
        });
        return result as Array<T>;
    }

    public Find<T extends Actor>(className: typeof Actor): T {
        this.actors.forEach(actor => {
            if (actor instanceof className) {
                return actor;
            }
        });
        return null;
    }

    public FindComponents<T extends Component>(className: typeof Component): Array<T> {
        let result = new Array<Component>();
        Object.keys(this).forEach(key => {
            let object = this[key] as Component;
            if ((object instanceof className) && result.indexOf(object) === -1) {
                result.push(object);
            }
        });
        this.actors.forEach(actor => {
            Object.keys(actor).forEach(key => {
                let object = actor[key] as Component;
                if ((object instanceof className) && result.indexOf(object) === -1) {
                    result.push(object);
                }
            });
        });
        return result as Array<T>;
    }

    public FindComponent<T extends Component>(): T {
        this.actors.forEach(actor => {
        Object.keys(actor).forEach(key => {
                let object = actor[key];
                if (object as T) {
                    return object;
                }
            });
        });
        return null;
    }
}
