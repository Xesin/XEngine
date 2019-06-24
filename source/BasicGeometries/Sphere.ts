/// <reference path="../core2/Render/Resources/Mesh/StaticMesh.ts" />

namespace XEngine2.BasicGeometries
{
    export class SphereMesh extends StaticMesh {
		constructor(material: Material, radius = 1, horizontalSlices = 4, verticalSlices = 4) {
			let vertexPositionData: Array<number> = [];
			let normalData: Array<number> = [];
			let textureCoordData: Array<number> = [];
			let colors: Array<number> = [];
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
					colors.push(0.4);
					colors.push(0.5);
					colors.push(0);
					colors.push(1);
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

			super(vertexPositionData, indexData, vertexPositionData, normalData, colors, new Array<Material>(material));
			this.indexed = true;
			this.addGroup(0, vertexPositionData.length / 3, 0, indexData);
		}
	}
}