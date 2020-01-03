import {Game} from "../Game";
import {Component} from "./Component";
import {Transform, Box} from "../../Math/Mathf";
import {MeshGroup} from "../Render/Resources/Mesh/MeshGroup";
import {Renderer} from "../Render/Renderer";

export class SceneComponent extends Component {
    public transform: Transform;
    public hidden: boolean;
    public bounds: Box;

    constructor(game: Game, name = "") {
        super(game, name);
        this.transform = new Transform();
        this.hidden = false;
    }

    public setupAttachtment(component: SceneComponent) {
        super.setupAttachtment(component);
        this.transform.parent = component.transform;
    }

    // tslint:disable-next-line: no-empty
    public render(renderer: Renderer) {

    }

    public getAllRenderableGroups(): Array<MeshGroup> {
        return null;
    }

    public getBounds(): Box {
        if (!this.bounds) {
            this.bounds = new Box();
        }

        return this.bounds;
    }
}
