import {BasicLoader, Loader} from "./_module/Loader";
import {BitmapData} from "../core/Render/Resources/Texture/BitmapData";

export class BitmapXMLLoader implements BasicLoader {
    public imageName: string;
    public imageUrl: string;
    public completed: boolean;
    public frameWidth: number;
    public frameHeight: number;
    public isLoading: boolean;
    public xmlUrl: string;

    private loader: Loader;

    constructor (imageName, imageUrl, xmlUrl, loader) {
        this.isLoading = false;
        this.imageName = imageName;
        this.imageUrl = imageUrl;
        this.xmlUrl = xmlUrl;
        this.completed = false;
        this.loader = loader;
        this.frameWidth = 0;
        this.frameHeight = 0;
        this.loader.image(this.imageName, this.imageUrl);
    }

    public load() {
        this.isLoading = true;
        this.loadXML();
    }

    public loadXML() {
        let _this = this;
        let request = new XMLHttpRequest();
        request.open("GET", _this.xmlUrl, true);
        let handler = function () {
            if (request.status === 200) {
                let returnedXML = request.response;
                let parser = new DOMParser();
                let xmlDoc = parser.parseFromString(returnedXML, "text/xml");
                _this.loader.game.cache.bitmapData[_this.imageName] = new BitmapData(xmlDoc);
            }
            _this.completed = true;
            _this.loader._notifyCompleted();
        };
        request.onload = handler;
        request.send();
    }
}

