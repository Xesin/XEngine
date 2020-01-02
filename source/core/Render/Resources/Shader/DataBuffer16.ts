

export class DataBuffer16 {
	public wordLength: number;
	public wordCapacity: number;
	public buffer: ArrayBuffer;
	public intView: Int16Array;
	public uintView: Uint16Array;

	constructor(byteSize: number) {
		this.wordLength = 0;
		this.wordCapacity = byteSize / 4;
		this.buffer = new ArrayBuffer(byteSize);
		this.intView = new Int16Array(this.buffer);
		this.uintView = new Uint16Array(this.buffer);
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

	public getUsedBufferAsInt(): Int16Array {
		return this.intView.subarray(0, this.wordLength);
	}

	public getUsedBufferAsUint(): Uint16Array {
		return this.uintView.subarray(0, this.wordLength);
	}
}
