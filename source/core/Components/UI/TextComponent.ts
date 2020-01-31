import { UIComponent } from "./UIComponent";
import { Game } from "../../Game";
import { Color } from "../../../Math/Color";
import { BitmapData } from "../../Render/Resources/Texture/BitmapData";
import { Material, Topology, MeshGroup } from "../../Render/Renderer";
import { FontMaterial } from "../../Render/Resources/Materials/FontMaterial";
import { StaticMesh } from "../../Render/Resources/Mesh/StaticMesh";

export class TextComponent extends UIComponent {

    public bitmapData: BitmapData;
    public font: string;
    public size: number;
    public textColor: Color;

    protected _text: string;
    protected _textMaterial: FontMaterial;
    protected _mesh: StaticMesh;
    protected atlasWidth: number;
    protected atlasHeight: number;

    constructor(game: Game, font: string, name: string = null) {
        super(game, name);

        this.font = font;
        this.size = 12;
        this.textColor = new Color(1, 1, 1, 1);
        this._textMaterial = FontMaterial.SharedInstance;
        this._mesh = new StaticMesh([], [], [], [], [], [this._textMaterial], Topology.TRIANGLES);
        this._mesh.castShadows = false;
        this._text = "";
        this.setFont(font);
    }

    public setFont(font: string) {
        this.bitmapData = this.game.cache.getBitmap(font);

        let fontImage = this.game.cache.image(font);
        this._textMaterial.fontMap = fontImage;
        if (fontImage) {
            this.atlasWidth = fontImage.width || 512;
            this.atlasHeight = fontImage.height || 512;
        }
    }

    private updateMesh() {
        if (this.bitmapData) {
            this._mesh.destroy();
            this._mesh.vertexData = new Array();
            this._mesh.uvData = new Array();
            this._mesh.indexData = new Array();
            let charArray = this.text.split("");
            let startX = 0;
            let startY = 0;
            let maxX = 0;
            let renderedChars = 0;
            for (let i = 0; i < charArray.length; i++) {
                let char = charArray[i];
                if (char !== undefined) {
                    let charCode = char.charCodeAt(0);
                    let charData = this.bitmapData.chars[charCode];
                    if (charData != null) {
                        if (charCode !== 32 && charCode !== 10) {
                            if (i !== 0) {
                                let prevCharCode = charArray[i - 1].charCodeAt(0);
                                if (this.bitmapData.kerning[prevCharCode] !== undefined
                                    && this.bitmapData.kerning[prevCharCode][charCode] !== undefined) {
                                    startX += this.bitmapData.kerning[prevCharCode][charCode];
                                }
                            }

                            let uvs = [
                                charData.x / this.atlasWidth, 1 - ((charData.y + charData.height) / this.atlasHeight),
                                (charData.x + charData.width) / this.atlasWidth, 1 - ((charData.y + charData.height) / this.atlasHeight),
                                (charData.x + charData.width) / this.atlasWidth, 1 - (charData.y / this.atlasHeight),
                                charData.x / this.atlasWidth, 1 - (charData.y / this.atlasHeight),
                            ];

                            let vertices = [
                                startX , startY, 0,
                                startX + charData.width, startY, 0,
                                startX + charData.width,  startY + charData.height, 0,
                                startX,  startY + charData.height, 0,
                            ];
                            let firstIndex = renderedChars * 4;
                            let indices = [
                                firstIndex,  firstIndex + 1, firstIndex + 2,          firstIndex, firstIndex + 2, firstIndex + 3,
                            ];

                            this._mesh.vertexData = this._mesh.vertexData.concat(vertices);
                            this._mesh.uvData = this._mesh.uvData.concat(uvs);
                            this._mesh.indexData = this._mesh.indexData.concat(indices);
                            renderedChars++;
                        }
                        startX += charData.xadvance - charData.xoffset + 5;
                        if (startX > maxX) {
                            maxX = startX;
                        }
                    } else if (charCode === 10) {
                        startY += this.bitmapData.lineHeight;
                        if (startX > startX) {
                            maxX = startX;
                        }
                        startX = 0;
                    }
                }
            }

            this._mesh.addGroup(0, this._mesh.vertexData.length / 3, 0, this._mesh.indexData);
        }
    }

    public set text(v: string) {
        if (v !== this._text) {
            this._text = v;
            this.updateMesh();
        }
    }


    public get text(): string {
        return this._text;
    }

    public getAllRenderableGroups(): Array<MeshGroup> {
        return this._mesh.groups;
    }
}
