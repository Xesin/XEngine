import {MeshGroup} from "./MeshGroup";
import {Material} from "../Materials/_module/Materials";
import {Topology} from "../Enums/_module/Enums";
import {IndexBuffer} from "../Shader/IndexBuffer";
import {VertexBuffer} from "../Shader/VertexBuffer";
import {Renderer} from "../../Renderer";
import {DataBuffer32} from "../Shader/DataBuffer32";
import {DataBuffer16} from "../Shader/DataBuffer16";
import { InstancedPropertyBuffer } from "../Shader/InstancedPropertyBuffer";
import { Mat4x4 } from "../../../../Math/Mathf";

export class StaticMesh {
    public initialized = false;
    public vertexCount = 0;
    public indexed = true;
    public groups: Array<MeshGroup>;
    public materials: Material[];
    public topology: Topology;
    public name: string;
    public castShadows = true;
    public recieveShadows = true;

    public uvData: Array<number>;
    public uv2Data: Array<number>;
    public vertexData: Array<number>;
    public colorData: Array<number>;
    public indexData: Array<number>;
    public normalData: Array<number>;
    protected gl: WebGL2RenderingContext;

    public indexBuffer: IndexBuffer[];
    public positionBuffer: VertexBuffer[];
    public uvBuffer: VertexBuffer[];
    public uv2Buffer: VertexBuffer[];
    public normalBuffer: VertexBuffer[];
    public colorBuffer: VertexBuffer[];
    public instandecModelBuffer: InstancedPropertyBuffer;

    // tslint:disable-next-line:max-line-length
    constructor(vertexData: Array<number>, indexData: Array<number>, uvData: Array<number>, normalData: Array<number>, colorData: Array<number>, materials: Array<Material> = new Array(), topology = Topology.TRIANGLES, name = "", uv2Data: Array<number> = new Array()) {
        this.vertexData = vertexData;
        this.indexData = indexData;
        this.uvData = uvData;
        this.uv2Data = uv2Data;
        this.normalData = normalData;
        this.colorData = colorData;
        this.indexed = indexData != null ? true : false;
        this.groups = new Array();
        this.instandecModelBuffer = null;
        this.positionBuffer = new Array();
        this.uvBuffer = new Array();
        this.uv2Buffer = new Array();
        this.normalBuffer = new Array();
        this.colorBuffer = new Array();
        this.indexBuffer = new Array();
        this.materials = materials;
        this.topology = topology;
        this.name = name;
    }

    public destroy () {
        if (this.indexBuffer.length > 0) {
            for (let i = 0; i < this.indexBuffer.length ; i++) {
                this.gl.deleteBuffer(this.indexBuffer[i].buffer);
            }
        }
        this.indexBuffer = new Array();

        if (this.positionBuffer.length > 0) {
            for (let i = 0; i < this.positionBuffer.length ; i++) {
                this.gl.deleteBuffer(this.positionBuffer[i].buffer);
            }
        }
        this.positionBuffer = new Array();

        if (this.uvBuffer.length > 0) {
            for (let i = 0; i < this.uvBuffer.length ; i++) {
                this.gl.deleteBuffer(this.uvBuffer[i].buffer);
            }
        }
        this.uvBuffer = new Array();

        if (this.normalBuffer.length > 0) {
            for (let i = 0; i < this.normalBuffer.length ; i++) {
                this.gl.deleteBuffer(this.normalBuffer[i].buffer);
            }
        }
        this.normalBuffer = new Array();

        if (this.colorBuffer.length > 0) {
            for (let i = 0; i < this.colorBuffer.length ; i++) {
                this.gl.deleteBuffer(this.colorBuffer[i].buffer);
            }
        }
        this.colorBuffer = new Array();
        this.initialized = false;
        this.vertexCount = 0;
        this.groups = new Array();
    }

    public updateResources(renderer: Renderer, overrideMaterial: Material = null, modelMatrix: Array<Mat4x4> = null) {
        this.gl = renderer.gl;

        for (let i = 0; i < this.groups.length; i++) {
            let material = overrideMaterial != null ? overrideMaterial : this.materials[this.groups[i].materialIndex];

            if (material.instancedModel) {
                let dataBuffer = new DataBuffer32(material.instancedModel.itemSize * 1);
                if (!this.instandecModelBuffer) {
                    this.instandecModelBuffer =
                        InstancedPropertyBuffer.Create(this.gl.ARRAY_BUFFER, dataBuffer.getByteCapacity(), this.gl.DYNAMIC_DRAW, this.gl);
                    this.instandecModelBuffer.addAttribute(material.instancedModel, 64, 0, 0);
                    this.instandecModelBuffer.addAttribute(material.instancedModel, 64, 16, 1);
                    this.instandecModelBuffer.addAttribute(material.instancedModel, 64, 32, 2);
                    this.instandecModelBuffer.addAttribute(material.instancedModel, 64, 48, 3);
                    
                }

                let floatBuffer = dataBuffer.floatView;

                for (let j = 0; j < modelMatrix.length; j++) {
                    floatBuffer.set(modelMatrix[j].elements);
                }
                this.instandecModelBuffer.bind();
                this.instandecModelBuffer.updateResource(floatBuffer);
            }

            if (this.initialized && this.positionBuffer[i].attributes.length
                === Object.keys(material.VertexAttributes).length) { continue; }

            let startVertexData = this.groups[i].firstVertex;
            let endVertexData = (this.groups[i].firstVertex + this.groups[i].vertexCount);

            if (material.HasColor) {
                if (!this.colorBuffer[i]) {
                    let colors = this.colorData;
                    let dataBuffer = new DataBuffer32((this.groups[i].vertexCount * material.vColor.itemSize));
                    this.colorBuffer[i] =
                        VertexBuffer.Create(this.gl.ARRAY_BUFFER, dataBuffer.getByteCapacity(), this.gl.STATIC_DRAW, this.gl);
                    this.colorBuffer[i].addAttribute(material.vColor, material.vColor.itemSize, 0);
                    let floatBuffer = dataBuffer.floatView;

                    let index = dataBuffer.allocate(this.groups[i].vertexCount);
                    for (let j = startVertexData * 4; j < endVertexData * 4; j++) {
                        if (colors && colors.length >= 4) {
                            floatBuffer[index++] = colors[j++];
                            floatBuffer[index++] = colors[j++];
                            floatBuffer[index++] = colors[j++];
                            floatBuffer[index++] = colors[j];
                        } else {
                            floatBuffer[index++] = 1;
                            floatBuffer[index++] = 1;
                            floatBuffer[index++] = 1;
                            floatBuffer[index++] = 1;
                        }
                    }

                    this.colorBuffer[i].bind();
                    this.colorBuffer[i].updateResource(floatBuffer);
                }
            }

            if (material.HasNormals) {
                if (!this.normalBuffer[i]) {
                    let normals = this.normalData;
                    let dataBuffer = new DataBuffer32((this.groups[i].vertexCount * material.vNormal.itemSize));
                    this.normalBuffer[i] =
                    VertexBuffer.Create(this.gl.ARRAY_BUFFER, dataBuffer.getByteCapacity(), this.gl.STATIC_DRAW, this.gl);
                    this.normalBuffer[i].addAttribute(material.vNormal, material.vNormal.itemSize, 0);
                    let floatBuffer = dataBuffer.floatView;

                    let index = dataBuffer.allocate(this.groups[i].vertexCount);
                    for (let j = startVertexData * 3; j < endVertexData * 3; j++) {
                        if (normals && normals.length >= 3) {
                            floatBuffer[index++] = normals[j++];
                            floatBuffer[index++] = normals[j++];
                            floatBuffer[index++] = normals[j];
                        } else {
                            floatBuffer[index++] = 1;
                            floatBuffer[index++] = 1;
                            floatBuffer[index++] = 1;
                        }
                    }
                    this.normalBuffer[i].bind();
                    this.normalBuffer[i].updateResource(floatBuffer);
                }
            }

            if (material.HasUVs) {
                if (!this.uvBuffer[i]) {
                    let uvs = this.uvData;
                    let dataBuffer = new DataBuffer32((this.groups[i].vertexCount * material.vUv.itemSize));
                    this.uvBuffer[i] =
                    VertexBuffer.Create(this.gl.ARRAY_BUFFER, dataBuffer.getByteCapacity(), this.gl.STATIC_DRAW, this.gl);
                    this.uvBuffer[i].addAttribute(material.vUv, material.vUv.itemSize, 0);
                    let floatBuffer = dataBuffer.floatView;

                    let index = dataBuffer.allocate(this.groups[i].vertexCount);
                    for (let j = startVertexData * 2; j < endVertexData * 2; j++) {
                        if (uvs && uvs.length >= 2) {
                            floatBuffer[index++] = uvs[j++];
                            floatBuffer[index++] = uvs[j];
                        } else {
                            floatBuffer[index++] = 0;
                            floatBuffer[index++] = 0;
                        }
                    }
                    this.uvBuffer[i].bind();
                    this.uvBuffer[i].updateResource(floatBuffer);
                }
            }

            if (material.HasSecondUVs) {
                if (!this.uv2Buffer[i]) {
                    let uvs = this.uv2Data;
                    let dataBuffer = new DataBuffer32((this.groups[i].vertexCount * material.vUv2.itemSize));
                    this.uv2Buffer[i] =
                    VertexBuffer.Create(this.gl.ARRAY_BUFFER, dataBuffer.getByteCapacity(), this.gl.STATIC_DRAW, this.gl);
                    this.uv2Buffer[i].addAttribute(material.vUv2, material.vUv2.itemSize, 0);
                    let floatBuffer = dataBuffer.floatView;

                    let index = dataBuffer.allocate(this.groups[i].vertexCount);
                    for (let j = startVertexData * 2; j < endVertexData * 2; j++) {
                        if (uvs && uvs.length >= 2) {
                            floatBuffer[index++] = uvs[j++];
                            floatBuffer[index++] = uvs[j];
                        } else {
                            floatBuffer[index++] = 0;
                            floatBuffer[index++] = 0;
                        }
                    }
                    this.uv2Buffer[i].bind();
                    this.uv2Buffer[i].updateResource(floatBuffer);
                }
            }

            if (material.HasPosition) {
                if (!this.positionBuffer[i]) {
                    let vertices = this.vertexData;
                    let dataBuffer = new DataBuffer32((this.groups[i].vertexCount * material.vPosition.itemSize));
                    this.positionBuffer[i] =
                        VertexBuffer.Create(this.gl.ARRAY_BUFFER, dataBuffer.getByteCapacity(), this.gl.STATIC_DRAW, this.gl);
                    this.positionBuffer[i].addAttribute(material.vPosition, material.vPosition.itemSize, 0);
                    let floatBuffer = dataBuffer.floatView;

                    let index = dataBuffer.allocate(this.groups[i].vertexCount);
                    for (let j = startVertexData * 3; j < endVertexData * 3; j++) {
                        floatBuffer[index++] = vertices[j++];
                        floatBuffer[index++] = vertices[j++];
                        floatBuffer[index++] = vertices[j];
                        floatBuffer[index++] = 1;
                    }
                    this.positionBuffer[i].bind();
                    this.positionBuffer[i].updateResource(floatBuffer);
                }
            }

            if (this.indexData && !this.indexBuffer[i]) {
                let indexDataBuffer = new DataBuffer16(2 * this.indexData.length);
                this.indexBuffer[i] = IndexBuffer.Create(
                    this.gl.ELEMENT_ARRAY_BUFFER, indexDataBuffer.getByteCapacity(), this.gl.DYNAMIC_DRAW, this.gl);
                let uintIndexBuffer = indexDataBuffer.uintView;
                let indices = this.indexData;
                indexDataBuffer.allocate(this.indexData.length);
                for (let j = 0; j < indices.length; j++) {
                    uintIndexBuffer[j] = indices[j];
                }
                this.indexBuffer[i].updateResource(uintIndexBuffer);
            }
        }

        this.initialized = true;
    }

    public addGroup(start, count, materialIndex, indices = null) {
        this.groups.push(new MeshGroup(materialIndex, start, count, this, indices));
    }

    public bind(gl: WebGL2RenderingContext, material: Material, materialIndex = 0) {
        if (this.colorBuffer[materialIndex] && material.HasColor) {
            this.colorBuffer[materialIndex].bind();
            const vertexAttr = material.vColor;
            gl.enableVertexAttribArray(vertexAttr.index);
            gl.vertexAttribPointer(
                vertexAttr.index,
                vertexAttr.numItems,
                vertexAttr.type,
                vertexAttr.normalized,
                vertexAttr.itemSize,
                0,
                );
        }
        if (this.uvBuffer[materialIndex] && material.HasUVs) {
            this.uvBuffer[materialIndex].bind();
            const vertexAttr = material.vUv;
            gl.enableVertexAttribArray(vertexAttr.index);
            gl.vertexAttribPointer(
                vertexAttr.index,
                vertexAttr.numItems,
                vertexAttr.type,
                vertexAttr.normalized,
                vertexAttr.itemSize,
                0,
            );
            gl.vertexAttribDivisor(vertexAttr.index, 0)
        }
        if (this.uv2Buffer[materialIndex] && material.HasSecondUVs) {
            this.uv2Buffer[materialIndex].bind();
            const vertexAttr = material.vUv2;
            gl.vertexAttribPointer(
                vertexAttr.index,
                vertexAttr.numItems,
                vertexAttr.type,
                vertexAttr.normalized,
                vertexAttr.itemSize,
                0,
                );
            gl.enableVertexAttribArray(vertexAttr.index);
        }
        if (this.normalBuffer[materialIndex] && material.HasNormals) {
            this.normalBuffer[materialIndex].bind();
            const vertexAttr = material.vNormal;
            gl.enableVertexAttribArray(vertexAttr.index);
            gl.vertexAttribPointer(
                vertexAttr.index,
                vertexAttr.numItems,
                vertexAttr.type,
                vertexAttr.normalized,
                vertexAttr.itemSize,
                0,
                );
        }

        if (this.instandecModelBuffer && material.instancedModel) {
            this.instandecModelBuffer.addAttribute(material.instancedModel, 64, 0, 0);
                    this.instandecModelBuffer.addAttribute(material.instancedModel, 64, 16, 1);
                    this.instandecModelBuffer.addAttribute(material.instancedModel, 64, 32, 2);
                    this.instandecModelBuffer.addAttribute(material.instancedModel, 64, 48, 3);
        }

        this.positionBuffer[materialIndex].bind();
        const vertexAttr = material.vPosition;
        gl.vertexAttribPointer(
            vertexAttr.index,
            vertexAttr.numItems,
            vertexAttr.type,
            vertexAttr.normalized,
            vertexAttr.itemSize,
            0,
            );
        gl.enableVertexAttribArray(vertexAttr.index);
        if (this.indexed) {
            this.indexBuffer[materialIndex].bind();
        }
    }

    public unBind(materialIndex = 0) {
        this.positionBuffer[materialIndex].unbind();
        if (this.indexed) {
            this.indexBuffer[materialIndex].unbind();
        }
    }
}
