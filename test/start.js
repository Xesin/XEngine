//Para quitar warnings por las cosas que están en otro js
/* global XEngine*/
var game;
function initGame(){
   console.log('Arrancando El juego');
   game = new XEngine.Game(1280, 720, 'contenedor');							//iniciamos el juego
   game.frameLimit = 120;
   game.scale.scaleType = XEngine.Scale.SHOW_ALL;
   game.state.add('unicorns', Start);
   game.state.start('unicorns');


   game.setBackgroundColor(100,100,100, 255);
}

var Start = function (game) {
	
};

var circle;
var text;

Start.prototype = {
	
	preload: function () {
		this.game.load.bitmapFont('font1', 'img/font.png', 'img/font.fnt');
	},
	
	start: function () {
		text = this.game.add.mesh(500, 420);

		var vertices = new Array();
		vertices[0]  = new XEngine.Vector(0, 0, -1);
		vertices[1]  = new XEngine.Vector(1, 0, -1);
		vertices[2]  = new XEngine.Vector(1, 1, -1);
		vertices[3]  = new XEngine.Vector(0, 1, -1);

		vertices[4]  = new XEngine.Vector(0, 0, 0);
		vertices[5]  = new XEngine.Vector(0, 0, 0);
		vertices[6]  = new XEngine.Vector(0, 0, 0);
		vertices[7]  = new XEngine.Vector(0, 0, 0);

		vertices[8]  = new XEngine.Vector(0, 0, 0);
		vertices[9]  = new XEngine.Vector(0, 0, 0);
		vertices[10] = new XEngine.Vector(0, 0, 0);
		vertices[11] = new XEngine.Vector(0, 0, 0);

		vertices[12] = new XEngine.Vector(0, 0, 0);
		vertices[13] = new XEngine.Vector(0, 0, 0);
		vertices[14] = new XEngine.Vector(0, 0, 0);
		vertices[15] = new XEngine.Vector(0, 0, 0);

		vertices[16] = new XEngine.Vector(0, 0, 0);
		vertices[17] = new XEngine.Vector(0, 0, 0);
		vertices[18] = new XEngine.Vector(0, 0, 0);
		vertices[19] = new XEngine.Vector(0, 0, 0);

		vertices[20] = new XEngine.Vector(0, 0, 0);
		vertices[21] = new XEngine.Vector(0, 0, 0);
		vertices[22] = new XEngine.Vector(0, 0, 0);
		vertices[23] = new XEngine.Vector(0, 0, 0);


		var indices = new Array();
		indices[0] = 0;
		indices[1] = 1;
		indices[2] = 2;

		indices[3] = 2;
		indices[4] = 1;
		indices[5] = 3;

		indices[6] = 0;
		indices[7] = 0;
		indices[8] = 0;

		indices[9] = 0;
		indices[10] = 0;
		indices[11] = 0;

		indices[12] = 0;
		indices[13] = 0;
		indices[14] = 0;

		indices[15] = 0;
		indices[16] = 0;
		indices[17] = 0;

		indices[18] = 0;
		indices[19] = 0;
		indices[20] = 0;

		indices[21] = 0;
		indices[22] = 0;
		indices[23] = 0;

		indices[24] = 0;
		indices[25] = 0;
		indices[26] = 0;

		indices[27] = 0;
		indices[28] = 0;
		indices[29] = 0;

		indices[0] = 0;
		indices[0] = 0;
		indices[0] = 0;

		indices[0] = 0;
		indices[0] = 0;
		indices[0] = 0;
		
		text.setVertices(vertices, indices);

		mat4.ortho(this.game.camera.pMatrix, 45, 1280/720, 0.1, 1000);
	},
	
	update : function (deltaTime) {
		//text.rotation += 20 * deltaTime;
	},
	
	fin: function () {
		
	},
};