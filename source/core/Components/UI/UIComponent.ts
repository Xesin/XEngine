import { SceneComponent } from "../SceneComponent";
import { CanvasComponent } from "./CanvasComponent";
import { Game } from "../../Game";

export class UIComponent extends SceneComponent {
    public parent: CanvasComponent;
    public name: string;

    constructor (game: Game, name: string) {
        super(game);
        this.name = name ||  Math.random() + "";
    }
}
