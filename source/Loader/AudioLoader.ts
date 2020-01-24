import {BasicLoader, Loader} from "./_module/Loader";
import { Audio } from "../Audio/Audio";

export class AudioLoader implements BasicLoader {
    public audioName: string;
    public audioUrl: Array<string>;
    public completed: boolean;
    public isLoading: boolean;
    private loader: Loader;

    constructor (audioName: string, audioUrl: Array<string>, loader: Loader) {
        this.audioName = audioName;
        this.audioUrl = audioUrl;
        this.completed = false;
        this.loader = loader;
        this.isLoading = false;
    }

    private attemptLoad(attemptNumber: number, callback: Function) {
        if (attemptNumber > this.audioUrl.length - 1) {
            this.completed = true;
            callback.apply(this, false);
        }
        let _this = this;
        let request = new XMLHttpRequest();
        request.open("GET", this.audioUrl[attemptNumber], true);
        request.responseType = "arraybuffer";
        let handler = function () {
            let cachedAudio = _this.loader.game.cache.audios[_this.audioName];
            if (request.status === 200) {
                _this.loader.game.audioEngine.decodeAudioData(request.response, function (buffer: AudioBuffer) {
                    cachedAudio.buffer = buffer;
                    cachedAudio.decoded = true;
                    _this.completed = true;
                    callback.apply(_this, [true]);
                }, function (error: DOMException) {
                    console.error(error.message);
                    _this.attemptLoad(++attemptNumber, callback);
                });
            } else {
                _this.attemptLoad(++attemptNumber, callback);
            }
        };
        request.onload = handler;
        request.send();
    }

    public load() {
        let _this = this;
        this.isLoading = true;
        let newAudio = new Audio(null, this.audioName);

        let attemptNumber = 0;
        let handler = function (success: boolean) {
            _this.completed = true;
            _this.loader._notifyCompleted();
        };
        this.attemptLoad(attemptNumber, handler);

        _this.loader.game.cache.audios[_this.audioName] = newAudio;
    }
}
