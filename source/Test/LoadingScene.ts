

import {Scene} from "../XEngine";
import { StaticMeshActor } from "../core/Game";
import { SphereMesh } from "../core/Render/Renderer";
import { BlinnPhongMaterial } from "../core/Render/Resources/Materials/_module/Materials";
import { CanvasContainer } from "./CanvasContainer";

export class LoadingScene extends Scene {

    private actor: CanvasContainer;

    public preload() {
        this.game.loader.bitmapFont("TestFont", "img/font.png", "img/font.fnt");
    }

    public start() {
        this.game.loader.obj("img/sponza.obj", "img/sponza.mtl");

        this.actor = this.Instantiate(CanvasContainer, "loadingActor") as CanvasContainer;

        this.game.loader.onCompleteFile.add(this.onCompleteFile, this);
        this.game.loader.onLoadingComplete.addOnce(this.onLoadedCompleted, this);

        this.game.loader.startLoading();
    }

    private onCompleteFile(progress: number) {
        this.actor.setLabel((progress * 100).toLocaleString("es-ES", {maximumFractionDigits: 2}) + " %");
    }

    public onLoadedCompleted() {
        this.game.time.addTimer(200, false, true, true).onCompleted.addOnce(function() {
            this.actor.setLabel("Press any key");
            this.game.input.onKeyDown.addOnce(function() {
                this.game.sceneManager.start("test");
            }, this);
        }, this);

    }
}
