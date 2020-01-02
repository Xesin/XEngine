import {StaticMeshComponent} from "../Components/Mesh/StaticMeshComponent"
import {Game} from "../Game"
import {Actor} from "./Actor"

export class StaticMeshActor extends Actor
{
    public staticMesh: StaticMeshComponent;

    constructor(game: Game, name: string = "StaticMeshActor")
    {
        super(game, name);

        this.staticMesh = new StaticMeshComponent(game);
        this.rootComponent = this.staticMesh;
    }
}
