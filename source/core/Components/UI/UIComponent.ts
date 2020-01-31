import { SceneComponent } from "../SceneComponent";
import { CanvasComponent } from "./CanvasComponent";
import { Game } from "../../Game";
import { RectTransform } from "../../../Math/RectTransform";

export class UIComponent extends SceneComponent {
    public parent: CanvasComponent;
    public name: string;
    public transform: RectTransform;

    constructor (game: Game, name: string) {
        super(game);
        this.name = name ||  Math.random() + "";
    }
}
