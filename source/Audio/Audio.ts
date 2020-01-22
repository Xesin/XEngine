
export class Audio {
    public buffer: AudioBuffer;
    public audioName: string;
    public decoded: boolean;

    constructor(buffer: AudioBuffer, audioName: string) {
        this.buffer = buffer;
        this.audioName = audioName;
        this.decoded = false;
    }

}
