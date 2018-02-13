/// <reference path="Mesh.ts"/>
namespace XEngine {

	export class CubeMesh extends Mesh {

		constructor(game: Game, posX: number, posY: number, posZ: number, size = 1) {
			super(game, posX, posY, posZ);
			let vertices = [
				// Cara delantera
				-size, -size,  size,
				size, -size,  size,
				size,  size,  size,
				-size,  size,  size,

				// // Cara trasera
				// -size, -size, -size,
				// -size,  size, -size,
				// size,  size, -size,
				// size, -size, -size,

				// // Top face
				// -size,  size, -size,
				// -size,  size,  size,
				// size,  size,  size,
				// size,  size, -size,

				// // Bottom face
				// -size, -size, -size,
				// size, -size, -size,
				// size, -size,  size,
				// -size, -size,  size,

				// // Right face
				// size, -size, -size,
				// size,  size, -size,
				// size,  size,  size,
				// size, -size,  size,

				// // Left face
				// -size, -size, -size,
				// -size, -size,  size,
				// -size,  size,  size,
				// -size,  size, -size,
			];

			let normals = [
				// Cara delantera
				0, 0, 1,
				0, 0, 1,
				0, 0, 1,
				0, 0, 1,

				// // Cara trasera
				// 0, 0, -1,
				// 0, 0, -1,
				// 0, 0, -1,
				// 0, 0, -1,

				// // Top face
				// 0, 1, 0,
				// 0, 1, 0,
				// 0, 1, 0,
				// 0, 1, 0,

				// // Bottom face
				// 0, -1, 0,
				// 0, -1, 0,
				// 0, -1, 0,
				// 0, -1, 0,

				// // Right face
				// 1, 0, 0,
				// 1, 0, 0,
				// 1, 0, 0,
				// 1, 0, 0,

				// // Left face
				// -1, 0, 0,
				// -1, 0, 0,
				// -1, 0, 0,
				// -1, 0, 0,
			];

			let UVs = [
				// Cara enfrente
				0, 0,
				1, 0,
				1, 1,
				0, 1,

				// // Cara atras
				// 1, 0,
				// 1, 1,
				// 0, 1,
				// 0, 0,

				// // Cara arriba
				// 0, 1,
				// 0, 0,
				// 1, 0,
				// 1, 1,

				// // Cara fondo
				// 0, 0,
				// 1, 0,
				// 1, 1,
				// 0, 1,

				// // Cara derecha
				// 1, 0,
				// 1, 1,
				// 0, 1,
				// 0, 0,

				// // Cara izquierda
				// 0, 0,
				// 1, 0,
				// 1, 1,
				// 0, 1,
			];

			let indices = [
				0,  1,  2,	  0,  2,  3,	// enfrente
				// 4,  5,  6,	  4,  6,  7,	// atrás
				// 8,  9,  10,	 8,  10, 11,   // arriba
				// 12, 13, 14,	 12, 14, 15,   // fondo
				// 16, 17, 18,	 16, 18, 19,   // derecha
				// 20, 21, 22,	 20, 22, 23,	// izquierda
			];

			this.setVertices(vertices, indices, UVs);
			this.setNormals(normals);
		}
	}
}
