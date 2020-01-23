import { Audio } from "./Audio";
import { Vector3 } from "../XEngine";
import { Game } from "../core/Game";
import { AudioMixerGroup } from "./AudioMixerGroup";
import { AudioMixer } from "./AudioMixer";
import { AudioInstance } from "./AudioInstance";

export class AudioEngine {

    private context: AudioContext;
    private game: Game;
    private gainNode: GainNode;
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

    public playAudio(audio: Audio, time = 0, loop = false): AudioInstance {
        let instance = new AudioInstance(audio, this, this.game, loop);
        instance.start(time);

        return instance;
    }

    public createAudioSourceNode(audio: Audio): AudioBufferSourceNode {
        let source = this.context.createBufferSource();
        source.buffer = audio.buffer;
        if (audio.audioMixer) {
            audio.audioMixer.connect(source, this.gainNode);
        }

        return source;
    }

    public playAudioAtPosition(audio: Audio, position: Vector3, time = 0, loop = false): AudioInstance {
        let instance = new AudioInstance(audio, this, this.game, loop, position);
        instance.start(time);

        return instance;
    }

    public createAudioSourceNodeAtPosition(audio: Audio, position: Vector3): AudioBufferSourceNode {
        let source = this.context.createBufferSource();
        let panner = this.context.createPanner();
        panner.setPosition(position.x, position.y, position.z);
        panner.coneInnerAngle = 5,
        panner.coneOuterAngle = 10;
        panner.coneOuterGain = 0.5;
        panner.maxDistance = 200;
        panner.rolloffFactor = 1.0;


        if (audio.audioMixer) {
            audio.audioMixer.connect(panner, this.gainNode);
        } else {
            panner.connect(this.gainNode);
        }


        source.buffer = audio.buffer;
        source.connect(panner);

        return source;
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
