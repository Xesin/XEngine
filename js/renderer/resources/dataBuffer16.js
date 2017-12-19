XEngine.DataBuffer16 = function(byteSize)
{
	this.wordLength = 0;
	this.wordCapacity = byteSize / 4;
	this.buffer = new ArrayBuffer(byteSize);
	this.intView = new Int16Array(this.buffer);
	this.uintView = new Uint16Array(this.buffer);
}

XEngine.DataBuffer16.prototype = {
	clear:function(){
		this.wordLength = 0;
	},

	getByteLength:function(){
		return this.wordLength * 2;
	},

	getByteCapacity: function(){
		return this.buffer.byteLength;
	},

	allocate:function(wordSize){
		var currentLength = this.wordLength;
		this.wordLenght += wordSize;
		return currentLength;
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