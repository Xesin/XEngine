import { Audio } from "./Audio";
import { Vector3, Game } from "../../XEngine";
import { AudioEngine } from "./AudioEngine";
import { Signal } from "../../Signals/Signal";

export class AudioSource {

    private sourceAudio: Audio;
    private audioSourceNode: AudioBufferSourceNode;
    private audioContext: AudioContext;
    private audioEngine: AudioEngine;
    private loop: boolean;
    private startedAtTime: number;
    private pauseTime: number;
    private game: Game;
    private panner: PannerNode;
    private _refDistance = 300;
    private _rollOffFactor = 1.0;

    public isPlaying: boolean;
    public isPaused: boolean;
    public is3D: boolean;
    public position: Vector3;
    public onStop: Signal;

    constructor(
        audio: Audio
        , audioContext: AudioContext
        , audioEngine: AudioEngine
        , game: Game
        , loop = false
        , is3D = false
        , position: Vector3 = null) {
        this.sourceAudio = audio;
        this.audioSourceNode = null;
        this.audioContext = audioContext;
        this.audioEngine = audioEngine;
        this.position = position;
        this.loop = loop;
        this.pauseTime = 0;
        this.startedAtTime = 0;
        this.game = game;
        this.is3D = is3D;
        this.onStop = new Signal();
        if (this.is3D && !this.position) {
            this.position = new Vector3(0, 0, 0);
        }
    }

    private createAudioSource() {
        let source = this.audioContext.createBufferSource();
        source.buffer = this.sourceAudio.buffer;
        let panner = null;
        let _this = this;
        if (this.is3D) {
            panner = this.audioContext.createPanner();
            this.panner = panner;
            panner.setPosition(this.position.x, this.position.y, this.position.z);
            panner.coneInnerAngle = 360,
            panner.coneOuterAngle = 0;
            panner.coneOuterGain = 0.5;
            panner.maxDistance = this.refDistance;
            panner.rolloffFactor = this.rollOffFactor;

            if (this.sourceAudio.audioMixer) {
                this.sourceAudio.audioMixer.connect(panner, this.audioEngine.gainNode);
            } else {
                panner.connect(this.audioEngine.gainNode);
            }

            source.connect(panner);
        } else {
            if (this.sourceAudio.audioMixer) {
                this.sourceAudio.audioMixer.connect(source, this.audioEngine.gainNode);
            } else {
                source.connect(this.audioEngine.gainNode);
            }
        }

        source.onended = function() {
            _this.onStop.dispatch();
        };

        return source;
    }

    public update() {
        if (this.is3D) {
            this.panner.setPosition(this.position.x, this.position.y, this.position.z);
        }
    }

    public start(offset = 0) {
        if (!this.isPlaying) {
            let _this = this;
            this.audioSourceNode = this.createAudioSource();
            this.audioSourceNode.loop = this.loop;
            this.audioSourceNode.onended = function(event) {
                if (!_this.isPaused) {
                    _this.onStop.dispatch();
                }
            };
            this.startedAtTime = this.game.time.elapsedTime - offset * 1000;
            this.audioSourceNode.start(0, offset);
            this.isPlaying = true;
            this.isPaused = false;
        }
    }

    public destroy() {
        if (this.isPlaying) {
            this.audioSourceNode.stop();
            this.audioSourceNode = null;
            this.panner = null;
        }
    }

    private offsetPauseTime() {
        if (this.pauseTime > this.sourceAudio.buffer.duration) {
            this.pauseTime -= this.sourceAudio.buffer.duration;
            this.offsetPauseTime();
        }
    }

    public resume() {
        if (this.isPaused) {
            this.offsetPauseTime();
            console.log(this.pauseTime);
            this.start(this.pauseTime);
        }
    }

    public stop() {
        if (this.isPlaying) {
            this.audioSourceNode.stop();
            this.pauseTime = 0;
        }
        this.isPlaying = false;
    }

    public pause() {
        if (this.isPlaying) {
            this.isPaused = true;
            this.pauseTime = (this.game.time.elapsedTime - this.startedAtTime) / 1000;
            this.audioSourceNode.stop();
        }
        this.isPlaying = false;
    }

    public set refDistance(v: number) {
        this._refDistance = v;
        if (this.panner) {
            this.panner.refDistance = v;
        }
    }

    public get refDistance(): number {
        return this._refDistance;
    }

    public set rollOffFactor(v: number) {
        this._rollOffFactor = v;
        if (this.panner) {
            this.panner.rolloffFactor = v;
        }
    }

    public get rollOffFactor(): number {
        return this._rollOffFactor;
    }
}
