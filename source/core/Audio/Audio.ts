import { AudioMixer } from "./AudioMixer";

export class Audio {
    public buffer: AudioBuffer;
    public audioName: string;
    public decoded: boolean;
    public audioMixer: AudioMixer;

    constructor(buffer: AudioBuffer, audioName: string) {
        this.buffer = buffer;
        this.audioName = audioName;
        this.decoded = false;
    }

}
