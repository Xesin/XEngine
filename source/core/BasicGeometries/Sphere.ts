import {StaticMesh} from "../Render/Resources/Mesh/StaticMesh";
import {Material} from "../Render/Resources/Materials/_module/Materials";

export class SphereMesh extends StaticMesh {
    constructor(material: Material, radius = 1, horizontalSlices = 4, verticalSlices = 4) {
        let vertexPositionData: Array<number> = [];
        let normalData: Array<number> = [];
        let textureCoordData: Array<number> = [];
        let colors: Array<number> = [];
        let lengthInv = 1.0 / radius;
        for (let latNumber = 0; latNumber <= horizontalSlices; latNumber++) {
            let theta = latNumber * Math.PI / horizontalSlices;
            let sinTheta = Math.sin(theta);
            let cosTheta = Math.cos(theta);

            for (let longNumber = 0; longNumber <= verticalSlices; longNumber++) {
                let phi = longNumber * 2 * Math.PI / verticalSlices;
                let sinPhi = Math.sin(phi);
                let cosPhi = Math.cos(phi);

                let x = cosPhi * sinTheta * radius;
                let y = cosTheta * radius;
                let z = sinPhi * sinTheta * radius;

                let u = 1 - (latNumber / horizontalSlices);
                let v = 1 - (longNumber / verticalSlices);

                normalData.push(x * lengthInv);
                normalData.push(y * lengthInv);
                normalData.push(z * lengthInv);
                textureCoordData.push(u);
                textureCoordData.push(v);
                // Position
                vertexPositionData.push(x);
                vertexPositionData.push(y);
                vertexPositionData.push(z);
                // ColorData
                colors.push(1);
                colors.push(1);
                colors.push(1);
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

        super(vertexPositionData, indexData, textureCoordData, normalData, colors, new Array<Material>(material));
        this.indexed = true;
        this.addGroup(0, vertexPositionData.length / 3, 0, indexData);
    }
}
