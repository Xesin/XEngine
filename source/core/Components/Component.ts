import {Game} from "../Game"
import {EObject} from "../EObject"

export class Component extends EObject {
    public parent: Component;
    public bCanUpdate: boolean;
    public game: Game;
    public name: string;

    constructor(game: Game, name: string = "")
    {
        super();
        this.bCanUpdate = false;
        this.game = game;
        this.name = name;
    }

    public setupAttachtment(parent: Component){
        this.parent = parent;
    }


    public update(deltaTime: number)
    {

    }
}
