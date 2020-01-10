import { SceneComponent } from "../SceneComponent";
import { UIComponent } from "./UIComponent";
import { Game } from "../../Game";
import { MeshGroup } from "../../../XEngine";
import { Mat4x4 } from "../../../Math/Mathf";

export class CanvasComponent extends SceneComponent {

    public elements: Array<UIComponent>;
    public isInWorldSpace: boolean;

    constructor (game: Game) {
        super(game);

        this.elements = new Array();
        this.isInWorldSpace = false;
    }

    public addElement(uiElement: UIComponent) {
        uiElement.parent = this;
        this.elements.push(uiElement);
    }

    public removeElement(uiElement: UIComponent) {
        this.elements.splice(this.elements.indexOf(uiElement), 1);
    }

    public getAllRenderableGroups(): Array<MeshGroup> {
        let groups = new Array<MeshGroup>();
        for (let i = 0; i < this.elements.length; i++) {
            if (!this.elements[i].hidden) {
                groups = groups.concat(this.elements[i].getAllRenderableGroups());
            }
        }

        return groups;
    }

    public getProjectionMatrix(): Mat4x4 {
        return new Mat4x4().ortho(0, this.game.width, 0, this.game.height, 0, 100);
    }
}
