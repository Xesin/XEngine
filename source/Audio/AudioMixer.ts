import { AudioMixerGroup } from "./AudioMixerGroup";
import { IDict } from "../core/Game";

export class AudioMixer {

    private context: AudioContext;
    private gainNode: GainNode;
    private mixerGroup: AudioMixerGroup;
    private effects: IDict<AudioNode>;
    private destinationNode: AudioNode;
    private alreadyConnected: boolean;

    constructor(context: AudioContext) {
        this.context = context;
        this.gainNode = this.context.createGain();
        this.gainNode.gain.value = 1;
        this.effects = new IDict();
    }

    public attachToGroup(mixerGroup: AudioMixerGroup) {
        this.mixerGroup = mixerGroup;
    }

    public connect(previousNode: AudioNode, destinationNode: AudioNode) {
        this.destinationNode = destinationNode;
        previousNode.connect(this.gainNode);

        if (!this.alreadyConnected) {
            this.rewireConnection();
            this.alreadyConnected = true;
        }
    }

    private rewireConnection() {
        let currentNode: AudioNode = this.gainNode;
        for (const key in this.effects) {
            if (this.effects.hasOwnProperty(key)) {
                const effect = this.effects[key];
                currentNode.disconnect();
                currentNode.connect(effect);
                currentNode = effect;
            }
        }

        if (this.mixerGroup) {
            currentNode.disconnect();
            currentNode = this.mixerGroup.connect(currentNode);
        }
        currentNode.disconnect();
        currentNode.connect(this.destinationNode);
    }

    public addLowPassFilter(): BiquadFilterNode {
        let lowPassNode = this.context.createBiquadFilter();
        this.effects.lowpass = lowPassNode;
        if (this.alreadyConnected) {
            this.rewireConnection();
        }
        return lowPassNode;
    }

    public addHigPassFilter(): BiquadFilterNode {
        let lowPassNode = this.context.createBiquadFilter();
        this.effects.highpass = lowPassNode;
        lowPassNode.type = "highpass";
        lowPassNode.frequency.value = 2200;
        if (this.alreadyConnected) {
            this.rewireConnection();
        }
        return lowPassNode;
    }

    public addIIRFilter(feedForward: Array<number>, feedBackward: Array<number>): IIRFilterNode {
        let effectNode = this.context.createIIRFilter(feedForward, feedBackward);
        this.effects.iir = effectNode;
        if (this.alreadyConnected) {
            this.rewireConnection();
        }
        return effectNode;
    }

    public set volume(v: number) {
        this.gainNode.gain.value = v;
    }

    public get volume(): number {
        return this.gainNode.gain.value;
    }

}
