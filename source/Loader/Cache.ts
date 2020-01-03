import {IDict, Game} from "../core/Game";
import {Texture2D} from "../core/Render/Resources/Texture/Texture2D";
import {BitmapData} from "../core/Render/Resources/Texture/BitmapData";
import {Material} from "../core/Render/Resources/Materials/_module/Materials";
import {StaticMesh} from "../core/Render/Resources/Mesh/StaticMesh";


export class Cache {

    public images: IDict<Texture2D>;
    public audios: IDict<any>;
    public json: IDict<any>;
    public bitmapData: IDict<BitmapData>;
    public geometries: IDict<StaticMesh>;
    public materials: IDict<Material>;
    private game: Game;

    constructor (game: Game) {
        this.game = game;
        this.images = new IDict();
        this.audios = new IDict();
        this.json = new IDict();
        this.geometries = new IDict<StaticMesh>();
        this.materials = new IDict<Material>();
        this.bitmapData = new IDict<BitmapData>();
    }

    public image(imageName: string): Texture2D {
        if (this.images[imageName] === undefined) {
            console.error("No hay imagen para el nombre: " + imageName);
        } else {
            return this.images[imageName];
        }
    }

    public audio(audioName: string) {
        if (this.audios[audioName] === undefined) {
            console.error("No hay audio para el nombre: " + audioName);
        } else {
            return this.audios[audioName];
        }
    }

    public getJson(jsonName: string) {
        return this.json[jsonName];
    }

    public getBitmap(bitmapName: string) {
        return this.bitmapData[bitmapName];
    }

    public getGeometry(geoName: string) {
        if (this.geometries[geoName] === undefined) {
            console.error("No hay geometria para el nombre: " + geoName);
        } else {
            return this.geometries[geoName];
        }
    }

    /**
     * Borra toda la cache
     * @method XEngine.Cache#clearChache
     */
    public clearCache() {
        delete this.images;
        delete this.audios;
        delete this.json;
        delete this.geometries;
        delete this.materials;
        this.images = new IDict();
        this.audios = new IDict();
        this.json = new IDict();
        this.geometries = new IDict<StaticMesh>();
        this.materials = new IDict<Material>();
        this.bitmapData = new IDict<BitmapData>();
    }
}

