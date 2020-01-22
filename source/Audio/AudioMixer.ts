import { AudioMixerGroup } from "./AudioMixerGroup";
import { IDict } from "../core/Game";

export class AudioMixer {

    private context: AudioContext;
    private gainNode: GainNode;
    private mixerGroup: AudioMixerGroup;
    private effects: IDict<AudioNode>;


    constructor(context: AudioContext) {
        this.context = context;
        this.gainNode = this.context.createGain();
        this.gainNode.gain.value = 1;
        this.effects = new IDict();
    }

    public attachToGroup(mixerGroup: AudioMixerGroup) {
        this.mixerGroup = mixerGroup;
    }

    public connect(previousNode: AudioNode): AudioNode {
        let currentNode = previousNode;
        if (this.mixerGroup) {
            currentNode = this.mixerGroup.connect(currentNode);
        }
        for (const key in this.effects) {
            if (this.effects.hasOwnProperty(key)) {
                const effect = this.effects[key];
                effect.connect(currentNode);
                currentNode = effect;
            }
        }

        this.gainNode.connect(currentNode);

        return this.gainNode;
    }

    public addLowPassFilter(): BiquadFilterNode {
        let lowPassNode = this.context.createBiquadFilter();
        this.effects.lowpass = lowPassNode;
        return lowPassNode;
    }

    public addIIRFilter(feedForward: Array<number>, feedBackward: Array<number>): IIRFilterNode {
        let effectNode = this.context.createIIRFilter(feedForward, feedBackward);
        this.effects.iir = effectNode;
        return effectNode;
    }

    public set gain(v: number) {
        this.gainNode.gain.value = v;
    }

    public get gain(): number {
        return this.gainNode.gain.value;
    }

}
