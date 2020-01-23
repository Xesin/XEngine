import { Audio } from "./Audio";
import { Vector3, Game } from "../XEngine";
import { AudioEngine } from "./AudioEngine";

export class AudioInstance {

    private sourceAudio: Audio;
    private audioSourceNode: AudioBufferSourceNode;
    private audioContext: AudioEngine;
    private position: Vector3;
    private loop: boolean;
    private startedAtTime: number;
    private pauseTime: number;
    private game: Game;

    public isPlaying: boolean;
    public isPaused: boolean;

    constructor(
        audio: Audio
        , audioContext: AudioEngine
        , game: Game
        , position: Vector3 = null
        , loop = false) {
        this.sourceAudio = audio;
        this.audioSourceNode = null;
        this.audioContext = audioContext;
        this.position = position;
        this.loop = loop;
        this.pauseTime = 0;
        this.startedAtTime = 0;
        this.game = game;
    }

    public start(offset = 0) {
        if (!this.isPlaying) {
            let _this = this;
            if (this.position) {
                this.audioSourceNode = this.audioContext.createAudioSourceNodeAtPosition(this.sourceAudio, this.position);
            } else {
                this.audioSourceNode = this.audioContext.createAudioSourceNode(this.sourceAudio);
            }
            this.audioSourceNode.loop = this.loop;
            this.audioSourceNode.onended = function(event) {
                if (!_this.isPaused) {
                    _this.startedAtTime = _this.game.time.elapsedTime;
                }
            };
            this.startedAtTime = this.game.time.elapsedTime - offset * 1000;
            this.audioSourceNode.start(0, offset);
            this.isPlaying = true;
            this.isPaused = false;
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
}
