import {Component} from "../Components/Component";
import {SceneComponent} from "../Components/SceneComponent";
import {Game} from "../Game";
import {EObject} from "../EObject";
import {Vector3, Transform} from "../../Math/Mathf";

export class Actor extends EObject {
    public rootComponent: SceneComponent;
    public hidden: boolean;
    public canUpdate: boolean;
    public game: Game;
    public name: string;

    constructor(game: Game, name = "") {
        super();
        this.rootComponent = new SceneComponent(game, name);
        this.hidden = false;
        this.game = game;
        this.canUpdate = false;
        this.name = name;
    }

    // tslint:disable-next-line: no-empty
    public OnSpawn(): void {

    }

    // tslint:disable-next-line: no-empty
    public OnBeginPlay(): void {

    }

    // tslint:disable-next-line: no-empty
    public OnDestroy(): void {

    }

    public update(deltaTime: number) {
        let components = this.GetComponents<Component>(Component);
        components.forEach(component => {
            if (!component.bInitialized) {
                component.beginPlay();
            }
            if (component.bCanUpdate) {
                component.update(deltaTime);
            }
        });
    }

    public getActorForwardVector(): Vector3 {
        if (this.Transform) {
            return this.Transform.forward();
        }
        return Vector3.zero;
    }

    public getActorRightVector(): Vector3 {
        if (this.Transform) {
            return this.Transform.right();
        }
        return Vector3.right;
    }


    public get Transform(): Transform {
        return this.rootComponent ? this.rootComponent.transform : null;
    }


    public GetComponents<T extends Component>(className: typeof Component): Array<T> {
        let result = new Array<Component>();
        Object.keys(this).forEach(key => {
            let object = this[key] as Component;
            if ((object instanceof className) && result.indexOf(object) === -1) {
                result.push(object);
            }
        });
        return result as Array<T>;
    }

    public GetComponent<T extends Component>(): T {
        let result = new Array<T>();
        Object.keys(this).forEach(key => {
            let object = this[key];
            if (object as T) {
                return object;
            }
        });
        return null;
    }
}
