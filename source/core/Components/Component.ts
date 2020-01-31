import {Game} from "../Game";
import {EObject} from "../EObject";

export class Component extends EObject {
    public parent: Component;
    public bCanUpdate: boolean;
    public bInitialized: boolean;
    public game: Game;
    public name: string;

    constructor(game: Game, name = "") {
        super();
        this.bCanUpdate = false;
        this.game = game;
        this.name = name;
    }

    public setupAttachtment(parent: Component) {
        this.parent = parent;
    }

    // tslint:disable-next-line: no-empty
    public update(deltaTime: number) {

    }

    // tslint:disable-next-line: no-empty
    public beginPlay() {
        this.bInitialized = true;
    }
}
