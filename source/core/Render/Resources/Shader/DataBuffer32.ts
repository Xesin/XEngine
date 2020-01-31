export class DataBuffer32 {
    public wordLength: number;
    public wordCapacity: number;
    public buffer: ArrayBuffer;
    public floatView: Float32Array;
    public intView: Int32Array;
    public uintView: Uint32Array;

    constructor(byteSize: number) {
        this.wordLength = 0;
        this.wordCapacity = byteSize / 4;
        this.buffer = new ArrayBuffer(byteSize);
        this.floatView = new Float32Array(this.buffer);
        this.intView = new Int32Array(this.buffer);
        this.uintView = new Uint32Array(this.buffer);
    }

    public clear() {
        this.wordLength = 0;
    }

    public getByteLength(): number {
        return this.wordLength * 4;
    }

    public getByteCapacity(): number {
        return this.buffer.byteLength;
    }

    public allocate(wordSize): number {
        let currentLength = this.wordLength;
        this.wordLength += wordSize;
        return currentLength;
    }

    public getUsedBufferAsFloat(): Float32Array {
        return this.floatView.subarray(0, this.wordLength);
    }

    public getUsedBufferAsInt(): Int32Array {
        return this.intView.subarray(0, this.wordLength);
    }

    public getUsedBufferAsUint(): Uint32Array {
        return this.uintView.subarray(0, this.wordLength);
    }
}
