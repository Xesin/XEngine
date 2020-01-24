import { SceneComponent } from "../SceneComponent";
import { Game } from "../../Game";
import { Emitter } from "../../ParticleSystem/Emitter";
import { MeshGroup } from "../../Render/Renderer";

export class ParticleSystemComponent extends SceneComponent {

    public emitters: Array<Emitter>;

    constructor(game: Game, name = "") {
        super(game, name);
        this.emitters = new Array();
        this.bCanUpdate = true;
    }

    public update(deltaTime: number) {
        super.update(deltaTime);

        for (let i = 0; i < this.emitters.length; i++) {
            const emitter = this.emitters[i];
            emitter.update(deltaTime * 1000);
        }
    }

    public getAllRenderableGroups(): Array<MeshGroup> {
        return null;
    }
}
