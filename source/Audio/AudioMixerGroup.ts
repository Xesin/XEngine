
export class AudioMixerGroup {

    private context: AudioContext;
    private gainNode: GainNode;

    constructor(context: AudioContext) {
        this.context = context;
        this.gainNode = this.context.createGain();
        this.gainNode.gain.value = 1;
    }

    public connect(previuosNode: AudioNode): AudioNode {
        previuosNode.connect(this.gainNode);
        return this.gainNode;
    }

    public set volume(v: number) {
        this.gainNode.gain.value = v;
    }

    public get volume(): number {
        return this.gainNode.gain.value;
    }
}
