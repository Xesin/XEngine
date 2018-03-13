/// <reference path="Geometry.ts"/>
namespace XEngine {

	export class SphereGeometry extends Geometry {
		constructor(radius = 1, horizontalSlices = 4, verticalSlices = 4) {
			let vertexPositionData = [];
			let normalData = [];
			let textureCoordData = [];
			for (let latNumber = 0; latNumber <= horizontalSlices; latNumber++) {
				let theta = latNumber * Math.PI / horizontalSlices;
				let sinTheta = Math.sin(theta);
				let cosTheta = Math.cos(theta);

				for (let longNumber = 0; longNumber <= verticalSlices; longNumber++) {
					let phi = longNumber * 2 * Math.PI / verticalSlices;
					let sinPhi = Math.sin(phi);
					let cosPhi = Math.cos(phi);

					let x = cosPhi * sinTheta;
					let y = cosTheta;
					let z = sinPhi * sinTheta;
					let u = 1 - (longNumber / horizontalSlices);
					let v = 1 - (latNumber / horizontalSlices);

					normalData.push(x);
					normalData.push(y);
					normalData.push(z);
					textureCoordData.push(u);
					textureCoordData.push(v);
					// Position
					vertexPositionData.push(radius * x);
					vertexPositionData.push(radius * y);
					vertexPositionData.push(radius * z);
					// ColorData
					vertexPositionData.push(0);
					vertexPositionData.push(0);
					vertexPositionData.push(0);
					vertexPositionData.push(1);
				}
			}

			let indexData = [];
			for (let latNumber = 0; latNumber < horizontalSlices; latNumber++) {
				for (let longNumber = 0; longNumber < verticalSlices; longNumber++) {
					let first = (latNumber * (verticalSlices + 1)) + longNumber;
					let second = first + horizontalSlices + 1;
					indexData.push(first + 1);
					indexData.push(second);
					indexData.push(first);

					indexData.push(first + 1);
					indexData.push(second + 1);
					indexData.push(second);
				}
			}

			super(vertexPositionData, indexData, textureCoordData, normalData);
		}
	}
}
