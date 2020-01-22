import { Audio } from "./Audio";
import { Vector3 } from "../XEngine";
import { Game } from "../core/Game";
import { Mathf, Mat4x4, Vector4 } from "../Math/Mathf";

export class AudioEngine {

    private context: AudioContext;
    private game: Game;
    // tslint:disable-next-line: no-empty
    constructor(game: Game) {
        this.game = game;
    }

    public initialize() {
        this.context = new AudioContext();
    }

    public update() {
        if (this.context) {
            let camera = this.game.sceneManager.currentScene.mainCamera;
            let modelMatrix = camera.transform.Matrix;
            let position = new Vector3(0, 0, 0).multiplyMatrix(modelMatrix);
            let rotation = camera.transform.forward();
            this.context.listener.setPosition(position.x, position.y, position.z);
            this.context.listener.setOrientation(
                rotation.x, rotation.y, rotation.z
                , 0
                , 1
                , 0);
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
        source.connect(this.context.destination);
        source.start(time);

        return source;
    }

    public playAudioAtPosition(audio: Audio, position: Vector3, time = 0): AudioBufferSourceNode {
        let source = this.context.createBufferSource();
        let panner = this.context.createPanner();
        let gain = this.context.createGain();
        gain.gain.value = 1.0;
        panner.setPosition(position.x, position.y, position.z);
        panner.coneInnerAngle = 5,
        panner.coneOuterAngle = 10;
        panner.coneOuterGain = 0.5;
        panner.maxDistance = 200;
        panner.rolloffFactor = 1.0;
        panner.connect(this.context.destination);

        gain.connect(panner);

        source.buffer = audio.buffer;
        source.connect(gain);
        source.start(time);

        return source;
    }
}
