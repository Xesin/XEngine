import {BasicLoader, Loader} from "./_module/Loader";
import { Audio } from "../Audio/Audio";

export class AudioLoader implements BasicLoader {
    public audioName: string;
    public audioUrl: string;
    public completed: boolean;
    public isLoading: boolean;
    private loader: Loader;

    constructor (audioName: string, audioUrl: string, loader: Loader) {
        this.audioName = audioName;
        this.audioUrl = audioUrl;
        this.completed = false;
        this.loader = loader;
        this.isLoading = false;
    }

    public load() {
        let _this = this;
        this.isLoading = true;
        let newAudio = new Audio(null, this.audioName);
        let request = new XMLHttpRequest();
        request.open("GET", _this.audioUrl, true);
        request.responseType = "arraybuffer";
        let handler = function () {
            let cachedAudio = _this.loader.game.cache.audios[_this.audioName];
            if (request.status === 200) {
                _this.loader.game.audioEngine.decodeAudioData(request.response, function (buffer: AudioBuffer) {
                    cachedAudio.buffer = buffer;
                    cachedAudio.decoded = true;
                    _this.completed = true;
                    _this.loader._notifyCompleted();
                }, function (error: DOMException) {
                    console.error(error.message);
                    _this.completed = true;
                    _this.loader._notifyCompleted();
                });
            } else {
                _this.completed = true;
                _this.loader._notifyCompleted();
            }
        };
        request.onload = handler;
        _this.loader.game.cache.audios[_this.audioName] = newAudio;
        request.send();
    }
}
