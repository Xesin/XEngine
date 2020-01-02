import {Game} from "../../Game"
import {Light} from "./Light"


export class PointLight extends Light {

    public radius : number;

    constructor(game: Game)
    {
        super(game);
        this.radius = 100;
        this.castShadow = false;
    }
}
