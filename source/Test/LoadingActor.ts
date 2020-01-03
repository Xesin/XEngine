import { Actor, StaticMeshComponent, CameraComponent, Game } from "../XEngine";
import { CanvasComponent } from "../core/Components/UI/CanvasComponent";
import { TextComponent } from "../core/Components/UI/TextComponent";

    export class LoadingActor extends Actor {

        public canvas: CanvasComponent;

        constructor(game: Game) {
            super(game);
            this.canUpdate = true;


            this.canvas = new CanvasComponent(game);
            this.rootComponent = this.canvas;
            // this.canvas.setupAttachtment(this.rootComponent);

            let textElement = new TextComponent(game, "TestFont", "TextLabel");
            textElement.text = "0 %";
            this.canvas.addElement(textElement);
        }

        public setLabel(text: string) {
            (this.canvas.elements[0] as TextComponent).text = text;
        }
    }
