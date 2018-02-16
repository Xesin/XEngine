/// <reference path="Geometry.ts"/>
namespace XEngine {

	export class BoxGeometry extends Geometry {
		constructor(sizeW = 1, sizeH = 1, sizeZ = 1) {
			let vertices = [
				// Cara delantera
				-sizeW, -sizeH, sizeZ, 0, 0, 0, 1,
				sizeW, -sizeH, sizeZ, 0, 0, 0, 1,
				sizeW,  sizeH, sizeZ, 0, 0, 0, 1,
				-sizeW,  sizeH, sizeZ, 0, 0, 0, 1,

				// Cara trasera
				-sizeW, -sizeH, -sizeZ, 0, 0, 0, 1,
				-sizeW,  sizeH, -sizeZ, 0, 0, 0, 1,
				sizeW,  sizeH, -sizeZ, 0, 0, 0, 1, 
				sizeW, -sizeH, -sizeZ, 0, 0, 0, 1, 

				// Top face
				-sizeW, sizeH, -sizeZ, 0, 0, 0, 1,
				-sizeW, sizeH,  sizeZ, 0, 0, 0, 1,
				sizeW,  sizeH,  sizeZ, 0, 0, 0, 1, 
				sizeW,  sizeH, -sizeZ, 0, 0, 0, 1, 

				// Bottom face
				-sizeW, -sizeH, -sizeZ, 0, 0, 0, 1,
				sizeW, -sizeH, -sizeZ, 0, 0, 0, 1, 
				sizeW, -sizeH,  sizeZ, 0, 0, 0, 1, 
				-sizeW, -sizeH,  sizeZ, 0, 0, 0, 1,

				// Right face
				sizeW, -sizeH, -sizeZ, 0, 0, 0, 1,
				sizeW,  sizeH, -sizeZ, 0, 0, 0, 1,
				sizeW,  sizeH,  sizeZ, 0, 0, 0, 1,
				sizeW, -sizeH,  sizeZ, 0, 0, 0, 1,

				// Left face
				-sizeW, -sizeH, -sizeZ, 0, 0, 0, 1,
				-sizeW, -sizeH,  sizeZ, 0, 0, 0, 1,
				-sizeW,  sizeH,  sizeZ, 0, 0, 0, 1,
				-sizeW,  sizeH, -sizeZ, 0, 0, 0, 1,
			];

			let UVs = [
				// Cara enfrente
				0, 0,
				1, 0,
				1, 1,
				0, 1,

				// Cara atras
				1, 0,
				1, 1,
				0, 1,
				0, 0,

				// Cara arriba
				0, 1,
				0, 0,
				1, 0,
				1, 1,

				// Cara fondo
				0, 0,
				1, 0,
				1, 1,
				0, 1,

				// Cara derecha
				1, 0,
				1, 1,
				0, 1,
				0, 0,

				// Cara izquierda
				0, 0,
				1, 0,
				1, 1,
				0, 1,
			];

			let indices = [
				0,  1,  2,	  0,  2,  3,	// enfrente
				4,  5,  6,	  4,  6,  7,	// atrรกs
				8,  9,  10,	 8,  10, 11,   // arriba
				12, 13, 14,	 12, 14, 15,   // fondo
				16, 17, 18,	 16, 18, 19,   // derecha
				20, 21, 22,	 20, 22, 23,	// izquierda
			];

			let normalData = [
				0, 0, 1,
				0, 0, 1,
				0, 0, 1,
				0, 0, 1,

				0, 0, -1,
				0, 0, -1,
				0, 0, -1,
				0, 0, -1,

				0, 1, 0,
				0, 1, 0,
				0, 1, 0,
				0, 1, 0,

				0, -1, 0,
				0, -1, 0,
				0, -1, 0,
				0, -1, 0,

				1, 0, 0,
				1, 0, 0,
				1, 0, 0,
				1, 0, 0,

				-1, 0, 0,
				-1, 0, 0,
				-1, 0, 0,
				-1, 0, 0,
			];

			super(vertices, indices, UVs, normalData);
		}
	}
}
