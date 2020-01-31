import {Game} from "../Game";
import {Actor} from "./Actor";
import { AudioSourceComponent } from "../Components/Audio/AudioSourceComponent";

export class AudioPlayerActor extends Actor {
    public audioSource: AudioSourceComponent;
    public autoDestroy: boolean;

    constructor(game: Game, name = "StaticMeshActor") {
        super(game, name);
        this.canUpdate = true;
        this.audioSource = new AudioSourceComponent(game, "audioComponent");
        this.audioSource.autoStart = true;
        this.audioSource.onAudioStop.add(this.onAudioStop, this);
        this.autoDestroy = false;
        this.rootComponent = this.audioSource;
    }

    private onAudioStop() {
        if (this.autoDestroy) {
            this.destroy();
        }
    }
}
