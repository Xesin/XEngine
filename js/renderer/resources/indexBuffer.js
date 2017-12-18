var CurrentIndexBuffer = null;

XEngine.IndexBuffer = function(gl, buffer){
	this.gl = gl;
	this.bufferType = gl.ELEMENT_ARRAY_BUFFER;
	this.buffer = buffer;
}

XEngine.IndexBuffer.prototype = {
	updateResource: function(bufferData, offset){
		var gl = this.gl;
		
		//if (CurrentIndexBuffer !== this)
		{
			CurrentIndexBuffer = this;
			gl.bindBuffer(this.bufferType, this.buffer);
		}
		gl.bufferSubData(this.bufferType, offset, bufferData);
	},

	bind:function(){
		var gl = this.gl;
		var buffer = this.buffer;

		//if(CurrentIndexBuffer !== this)
		{
			CurrentIndexBuffer = this;
			gl.bindBuffer(this.bufferType, buffer);
		}
	}
}

XEngine.IndexBuffer.SetDirty = function () 
{
    CurrentIndexBuffer = null;
};