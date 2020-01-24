import { SceneComponent } from "../SceneComponent";
import { Game } from "../../Game";
import { Audio } from "../../../Audio/Audio";
import { AudioSource } from "../../../Audio/AudioSource";
import { Signal } from "../../../Signals/Signal";

export class AudioSourceComponent extends SceneComponent {

    private _audio: Audio;
    private audioSource: AudioSource;

    public is3DSound: boolean;
    public loop: boolean;
    public autoStart: boolean;
    public onAudioStop: Signal;

    constructor(game: Game, name: string) {
        super(game, name);
        this.bCanUpdate = true;
        this.onAudioStop = new Signal();
    }

    public beginPlay() {
        super.beginPlay();
        if (this.autoStart && this.audioSource) {
            this.audioSource.start();
        }
    }

    public update(deltaTime: number) {
        super.update(deltaTime);
        if (this.audioSource) {
            this.audioSource.update();
        }
    }

    public destroy() {
        super.destroy();
        if (this.audioSource) {
            this.audioSource.destroy();
            this.onAudioStop._destroy();
        }
    }

    public play() {
        if (this.audioSource.isPlaying) {
            this.audioSource.stop();
        }
        this.audioSource.start();
    }

    public pause() {
        this.audioSource.pause();
    }

    public stop() {
        this.audioSource.stop();
    }

    private OnStop() {
        this.onAudioStop.dispatch();
    }

    public set audio(v: Audio) {
        if (this.audioSource) {
            this.audioSource.onStop.remove(this);
            this.audioSource.stop();
            this.audioSource = null;
        }
        this._audio = v;
        if (this._audio) {
            this.audioSource = this.game.audioEngine.createAudio(this._audio, 0, this.loop);
            this.audioSource.onStop.add(this.OnStop, this);
            this.audioSource.is3D = this.is3DSound;
            this.audioSource.position = this.transform.position;
        }
    }

    public get audio(): Audio {
        return this._audio;
    }

}
