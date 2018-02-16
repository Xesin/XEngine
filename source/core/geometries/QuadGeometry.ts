/// <reference path="Geometry.ts"/>
namespace XEngine {

	export class QuadGeometry extends Geometry {
		constructor(sizeW = 1, sizeH = 1) {
			let vertices = [
				// Cara delantera
				-sizeW, -sizeH, 0, 0, 0, 0, 1,
				sizeW, -sizeH, 0, 0, 0, 0, 1,
				sizeW,  sizeH, 0, 0, 0, 0, 1,
				-sizeW,  sizeH, 0, 0, 0, 0, 1,
			];

			let UVs = [
				// Cara enfrente
				0, 0,
				1, 0,
				1, 1,
				0, 1,
			];

			let indices = [
				0,  1,  2,	  0,  2,  3,	// enfrente
			];

			let normalData = [
				0, 0, 1,
				0, 0, 1,
				0, 0, 1,
				0, 0, 1,
			];

			super(vertices, indices, UVs, normalData);
		}
	}
}
