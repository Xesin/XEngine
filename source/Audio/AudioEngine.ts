import { Audio } from "./Audio";
import { Vector3 } from "../XEngine";
import { Game } from "../core/Game";
import { AudioMixerGroup } from "./AudioMixerGroup";
import { AudioMixer } from "./AudioMixer";

export class AudioEngine {

    private context: AudioContext;
    private game: Game;
    private gain: GainNode;
    public globalVolume: number;

    // tslint:disable-next-line: no-empty
    constructor(game: Game) {
        this.game = game;
    }

    public initialize() {
        this.context = new AudioContext();
        this.gain = this.context.createGain();
        this.gain.connect(this.context.destination);
        this.globalVolume = 1;
        this.gain.gain.value = 1;
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
            this.gain.gain.value = this.globalVolume;
        }
    }

    public decodeAudioData(data: ArrayBuffer, successCallback: DecodeSuccessCallback, errorCallback: DecodeErrorCallback) {
        if (this.context) {
            this.context.decodeAudioData(data, successCallback, errorCallback);
        } else {
            errorCallback(new DOMException("AudioContext is not initialized"));
        }
    }

    public playAudio(audio: Audio, time = 0): AudioBufferSourceNode {
        let source = this.context.createBufferSource();
        source.buffer = audio.buffer;
        let destinationNode: AudioNode = this.gain;
        if (audio.audioMixer) {
            destinationNode = audio.audioMixer.connect(destinationNode);
        }
        source.connect(destinationNode);
        source.start(time);

        return source;
    }

    public playAudioAtPosition(audio: Audio, position: Vector3, time = 0): AudioBufferSourceNode {
        let source = this.context.createBufferSource();
        let panner = this.context.createPanner();
        panner.setPosition(position.x, position.y, position.z);
        panner.coneInnerAngle = 5,
        panner.coneOuterAngle = 10;
        panner.coneOuterGain = 0.5;
        panner.maxDistance = 200;
        panner.rolloffFactor = 1.0;

        panner.connect(this.gain);

        let destinationNode: AudioNode = panner;
        if (audio.audioMixer) {
            destinationNode = audio.audioMixer.connect(destinationNode);
        }

        source.buffer = audio.buffer;
        source.connect(destinationNode);
        source.loop = true;
        source.start(time);

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
}
