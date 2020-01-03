import {StaticMesh} from "../core/Render/Resources/Mesh/StaticMesh";
import {Material} from "../core/Render/Resources/Materials/_module/Materials";

export class QuadMesh extends StaticMesh {
    constructor(material: Material, sizeW = 1, sizeH = 1) {
        sizeH /= 2;
        sizeW /= 2;
        let vertices = [
            -sizeW, -sizeH, 0,
            sizeW, -sizeH, 0,
            sizeW,  sizeH, 0,
            -sizeW,  sizeH, 0,
        ];

        let colors = [
            1, 1, 1, 1,
            1, 1, 1, 1,
            1, 1, 1, 1,
            1, 1, 1, 1,
        ];

        let UVs = [
            0, 0,
            1, 0,
            1, 1,
            0, 1,
        ];

        let indices = [
            0,  1,  2,          0, 2, 3,
        ];

        let normalData = [
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
        ];

        super(vertices, indices, UVs, normalData, colors, new Array(material));

        this.addGroup(0, vertices.length / 3, 0, indices);
    }
}
