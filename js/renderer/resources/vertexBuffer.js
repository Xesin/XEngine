var CurrentVertexBuffer = null;

XEngine.VertexBuffer = function(gl, buffer){
	this.gl = gl;
	this.bufferType = gl.ARRAY_BUFFER;
	this.buffer = buffer;
	this.attributes = [];
}

XEngine.VertexBuffer.prototype = {
	addAttribute: function(index, size, type, normalized, stride, offset){
		this.attributes.push({
			index:index,
			size: size,
			type: type,
			normalized: normalized,
			stride: stride,
			offset: offset
		});
	},

	updateResource: function(bufferData, offset){
		var gl = this.gl;
		
		//if (CurrentVertexBuffer !== this)
		{
			CurrentVertexBuffer = this;
			gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
		}
		gl.bufferSubData(gl.ARRAY_BUFFER, offset, bufferData);
	},

	bind:function(){
		var gl = this.gl;
		var buffer = this.buffer;
		var attributes = this.attributes;
		var attributesLength = attributes.length;

		//if(CurrentVertexBuffer !== this){
			CurrentVertexBuffer = this;
			gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

			for (var index = 0; index < attributesLength; ++index)
            {
                var element = attributes[index];
    
                if (element !== undefined && element !== null)
                {
                    gl.enableVertexAttribArray(element.index);
                    gl.vertexAttribPointer(
                        element.index,
                        element.size,
                        element.type,
                        element.normalized,
                        element.stride,
                        element.offset
                    );
                }
            }
		//}
	}
}

XEngine.VertexBuffer.SetDirty = function () 
{
    CurrentVertexBuffer = null;
};