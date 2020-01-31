import { Actor, Game } from "../XEngine";
import { CanvasComponent } from "../core/Components/UI/CanvasComponent";
import { TextComponent } from "../core/Components/UI/TextComponent";

    export class CanvasContainer extends Actor {

        public canvas: CanvasComponent;

        constructor(game: Game) {
            super(game);
            this.canUpdate = true;


            this.canvas = new CanvasComponent(game);
            this.rootComponent = this.canvas;
            // this.canvas.setupAttachtment(this.rootComponent);

            let textElement = new TextComponent(game, "TestFont", "TextLabel");
            textElement.transform.position.y = 1080 / 2;
            textElement.transform.position.x = 1920 / 2;
            textElement.text = "0 %";
            this.canvas.addElement(textElement);
        }

        public setLabel(text: string) {
            (this.canvas.elements[0] as TextComponent).text = text;
        }
    }
