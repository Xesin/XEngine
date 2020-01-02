import {IDict} from "../../../Game"
import {ShaderVariant} from "./ShaderVariant"
import {ShaderCompileStatus} from "../../ShaderCompilerStatus"
import {ShaderCompiler} from "../../ShaderCompiler"
import {Uniform} from "./Uniform"
import {VertexAttribute} from "./VertexAttribute"
import {ShaderType} from "../Enums/ShaderType"

export class Shader {

	private vertextCode: string[];
	private fragmentCode: string[];

	private attributeStride: number;		

	public shaderVariants: IDict<ShaderVariant>;
	public enabledWords: Array<string>;
	public compileStatus: ShaderCompileStatus;

	constructor(vertextCode: string[], fragmentCode: string[]) {
		this.vertextCode = vertextCode;
		this.fragmentCode = fragmentCode;
		this.enabledWords = new Array<string>();
		this.shaderVariants = new IDict<ShaderVariant>();
		this.attributeStride = 0;
		this.compileStatus = ShaderCompileStatus.Pending;
	}

	
	public get hash() : string {
		return this.enabledWords.sort().join("").hashCode().toString();
	}
	
	public get currentVariant() : ShaderVariant {
		return this.shaderVariants[this.hash];
	}

	public updateShader(gl: WebGL2RenderingContext) {
		let hash = this.hash;
		if(!this.shaderVariants[hash]){
			let vertexCode = this.vertextCode.join("\n");
			let fragmentCode = this.fragmentCode.join("\n");
			
			let defines = this.enabledWords.map(i => '#define ' + i).join("\n");

			vertexCode = vertexCode.replace("#VARIANT_DEFINES", defines);
			fragmentCode = fragmentCode.replace("#VARIANT_DEFINES", defines);

			this.shaderVariants[hash] = new ShaderVariant();

			this.shaderVariants[hash].program = ShaderCompiler.compileShader(gl, vertexCode, fragmentCode);
			if(this.shaderVariants[hash].program)
			{
				this.compileStatus = ShaderCompileStatus.Ok
			}
			else
			{
				this.compileStatus = ShaderCompileStatus.Error;
			}
			if(this.shaderVariants[hash])
				this.extractUniformsFromCode(gl);
		}
	}

	public clearVariants(gl: WebGL2RenderingContext)
	{
		for (const variant in this.shaderVariants) {
			if (this.shaderVariants.hasOwnProperty(variant)) {
				const element = this.shaderVariants[variant];
				gl.deleteProgram(element);
			}
		}
		delete this.shaderVariants;
		this.shaderVariants = new IDict<ShaderVariant>();
	}

	private extractUniformsFromCode(gl: WebGL2RenderingContext)
	{
		let shaderVariant = this.shaderVariants[this.hash];
		let activeUniforms = gl.getProgramParameter(shaderVariant.program, gl.ACTIVE_UNIFORMS);
		let activeAttributes = gl.getProgramParameter(shaderVariant.program, gl.ACTIVE_ATTRIBUTES);
		
		// Uniforms
		for (var i = 0; i < activeUniforms; i++) {
			var uniform = gl.getActiveUniform(shaderVariant.program, i);
			let result = new Uniform(uniform.name, uniform.type, null, gl.getUniformLocation(shaderVariant.program, uniform.name));
			if(uniform.type == gl.SAMPLER_2D || uniform.type == gl.SAMPLER_2D_SHADOW)
			{
				result.samplerNumber = shaderVariant.samplers.length;
				shaderVariant.samplers.push(result);
			}
			shaderVariant.uniforms[uniform.name] = result;
		}
		
		// Attributes
		this.attributeStride = 0;
		for (var i=0; i < activeAttributes; i++) {
			var attribute = gl.getActiveAttrib(shaderVariant.program, i);
			let type = attribute.type as ShaderType;
			let result = new VertexAttribute(i, attribute.name, type, gl.getAttribLocation(shaderVariant.program, attribute.name), this.attributeStride, false);
			shaderVariant.vertexAttrs[attribute.name] = result;
			switch(type)
			{
				case ShaderType.INT:
				case ShaderType.FLOAT:
				case ShaderType.SHORT:
					result.itemSize = 4;
					this.attributeStride += 4;
					break;
				case ShaderType.INT_VEC2:
				case ShaderType.FLOAT_VEC2:
					result.itemSize = 8;
					this.attributeStride += 8;
					break;
				case ShaderType.INT_VEC3:
				case ShaderType.FLOAT_VEC3:
					result.itemSize = 12;
					this.attributeStride += 12;
					break;
				case ShaderType.INT_VEC4:
				case ShaderType.FLOAT_VEC4:
				case ShaderType.FLOAT_MAT2:
					result.itemSize = 16;
					this.attributeStride += 16;
					break;
			}
		}
	}

	public get attrStride() : number {
		return this.attributeStride;
	}
}
