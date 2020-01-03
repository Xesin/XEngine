import {BasicLoader, Loader} from "./_module/Loader";

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
        let newAudio = {
            audio: null,
            audioName: _this.audioName,
            decoded: false,
        };
        let request = new XMLHttpRequest();
        request.open("GET", _this.audioUrl, true);
        request.responseType = "arraybuffer";
        let handler = function () {
            let audioRef = _this.loader.game.cache.audios[_this.audioName];
            if (request.status === 200) {
                _this.loader.game.audioContext.decodeAudioData(request.response, function (buffer) {
                    audioRef.audio = buffer;
                    audioRef.decoded = true;
                    _this.completed = true;
                    _this.loader._notifyCompleted();
                }, function () {
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
