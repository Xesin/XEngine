XEngine.DataBuffer = function(byteSize)
{
	this.wordLength = 0;
	this.wordCapacity = byteSize / 4;
	this.buffer = new ArrayBuffer(byteSize);
	this.floatView = new Float32Array(this.buffer);
	this.intView = new Int32Array(this.buffer);
	this.uintView = new Uint32Array(this.buffer);
}

XEngine.DataBuffer.prototype = {
	clear:function(){
		this.wordLength = 0;
	},

	getByteLength:function(){
		return this.wordLength * 4;
	},

	getByteCapacity: function(){
		return this.buffer.byteLength;
	},

	allocate:function(wordSize){
		var currentLength = this.wordLength;
		this.wordLength += wordSize;
		return currentLength;
	},

	getUsedBufferAsFloat: function ()
    {
        return this.floatView.subarray(0, this.wordLength);
    },

    getUsedBufferAsInt: function ()
    {
        return this.intView.subarray(0, this.wordLength);
    },

    getUsedBufferAsUint: function ()
    {
        return this.uintView.subarray(0, this.wordLength);
    }
}