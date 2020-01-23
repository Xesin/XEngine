import { SceneComponent } from "../SceneComponent";
import { Game } from "../../Game";
import { Audio } from "../../../Audio/Audio";
import { AudioSource } from "../../../Audio/AudioSource";

export class AudioSourceComponent extends SceneComponent {

    private _audio: Audio;
    private audioSource: AudioSource;

    public is3DSound: boolean;
    public loop: boolean;

    constructor(game: Game, name: string) {
        super(game, name);
    }

    public update(deltaTime: number) {
        if (this.audioSource) {
            this.audioSource.update();
        }
    }

    public set audio(v: Audio) {
        if (this.audioSource) {
            this.audioSource.stop();
            this.audioSource = null;
        }
        this._audio = v;
        if (this._audio) {
            this.audioSource = this.game.audioEngine.createAudio(this._audio, 0, this.loop);
            this.audioSource.is3D = this.is3DSound;
            this.audioSource.position = this.transform.position;
        }
    }

    public get audio(): Audio {
        return this._audio;
    }

}
