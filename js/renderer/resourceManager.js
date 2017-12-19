XEngine.ResourceManager = function(gl){
    this.gl = gl;
}

XEngine.ResourceManager.prototype= {
    createBuffer: function(target, initialDataOrSize, usage){
        var gl = this.gl;
        var buffer = gl.createBuffer();

        gl.bindBuffer(target, buffer);
        gl.bufferData(target, initialDataOrSize, usage);

        switch(target){
            case gl.ARRAY_BUFFER:
                return new XEngine.VertexBuffer(gl, buffer);
            case gl.ELEMENT_ARRAY_BUFFER:
                return new XEngine.IndexBuffer(gl, buffer);
        }
    },

    createShader: function(shaderClass){
        var shader = new shaderClass();
        shader.initializeShader(this.gl);
        return shader;
    }
}