import { Audio } from "./Audio";
import { Vector3 } from "../XEngine";
import { Game } from "../core/Game";
import { AudioMixerGroup } from "./AudioMixerGroup";
import { AudioMixer } from "./AudioMixer";
import { AudioSource } from "./AudioSource";
import { AudioSourceComponent } from "../core/Components/Audio/AudioSourceComponent";
import { AudioPlayerActor } from "../core/GameObjects/AudioPlayerActor";

export class AudioEngine {

    private context: AudioContext;
    private game: Game;
    public gainNode: GainNode;
    public globalVolume: number;

    // tslint:disable-next-line: no-empty
    constructor(game: Game) {
        this.game = game;
    }

    public initialize() {
        if (this.context) {
            return;
        }
        this.context = new AudioContext();
        this.gainNode = this.context.createGain();
        this.gainNode.connect(this.context.destination);
        this.globalVolume = 1;
        this.gainNode.gain.value = 1;
        let _this = this;
        document.addEventListener("visibilitychange", function() {
            console.log(document.hidden, document.visibilityState);
            if (document.hidden) {
                _this.context.suspend();
            } else {
                _this.context.resume();
            }
          }, false);
    }

    public update() {
        if (this.context) {
            let camera = this.game.sceneManager.currentScene.mainCamera;
            let position = camera.transform.WorldPosition;
            let orientation = camera.transform.forward();
            this.context.listener.setPosition(position.x, position.y, position.z);
            this.context.listener.setOrientation(
                orientation.x, orientation.y, orientation.z
                , 0
                , 1
                , 0);
            this.gainNode.gain.value = this.globalVolume;
        }
    }

    public decodeAudioData(data: ArrayBuffer, successCallback: DecodeSuccessCallback, errorCallback: DecodeErrorCallback) {
        if (this.context) {
            this.context.decodeAudioData(data, successCallback, errorCallback);
        } else {
            errorCallback(new DOMException("AudioContext is not initialized"));
        }
    }

    public playAudio(audio: Audio, loop = false): AudioPlayerActor {
        let playerActor = this.game.sceneManager.currentScene.Instantiate(AudioPlayerActor, "AutoAudioCompoennt") as AudioPlayerActor;
        playerActor.audioSource.is3DSound = false;
        playerActor.audioSource.loop = loop;
        playerActor.audioSource.audio = audio;
        playerActor.autoDestroy = true;

        return playerActor;
    }

    public createAudio(audio: Audio, time = 0, loop = false): AudioSource {
        let instance = new AudioSource(audio, this.context, this, this.game, loop);
        return instance;
    }

    public playAudioAtPosition(audio: Audio, position: Vector3, loop = false): AudioPlayerActor {
        let playerActor = this.game.sceneManager.currentScene.Instantiate(AudioPlayerActor, "AutoAudioCompoennt") as AudioPlayerActor;
        playerActor.audioSource.is3DSound = true;
        playerActor.audioSource.loop = loop;
        playerActor.Transform.position.setTo(position.x, position.y, position.z);
        playerActor.autoDestroy = true;
        playerActor.audioSource.audio = audio;

        return playerActor;
    }

    public pauseAudio() {
        this.context.suspend();
    }

    public resumeAudio() {
        this.context.resume();
    }

    public createMixerGroup(): AudioMixerGroup {
        let group = new AudioMixerGroup(this.context);
        return group;
    }

    public createMixer(): AudioMixer {
        let group = new AudioMixer(this.context);
        return group;
    }

    public set volume(v: number) {
        this.gainNode.gain.value = v;
    }

    public get volume(): number {
        return this.gainNode.gain.value;
    }
}
