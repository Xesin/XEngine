import {Game} from "../../core/Game";
import {Material, BlinnPhongMaterial} from "../../core/Render/Resources/Materials/_module/Materials";

export class ObjMaterial {
    public name: string;
    public ambient: Array<number>;
    public diffuse: Array<number>;
    public albedoture: string;
    public normalture: string;
    public opacityMask: string;
    public ambientTexture: string;
    public specularTexture: string;
    public smoothness: number;
    public glossiness: number;

    constructor(name: string) {
        this.name = name;
    }

    public createMaterial(game: Game, gl: WebGL2RenderingContext): Material {
        let mat = game.createMaterialFromBase(BlinnPhongMaterial) as BlinnPhongMaterial;

        if (this.albedoture) {
            if (mat.albedo) {
                mat.albedo = game.cache.image(this.albedoture);
            }
        }

        if (this.normalture) {
            if (mat.normal) {
                mat.normal = game.cache.image(this.normalture);
            }
        }
        if (this.opacityMask) {
            if (mat.opacity) {
                mat.opacity = game.cache.image(this.opacityMask);
            }
        }
        // if (this.ambientTexture) {
        //     mat.setAmbient(cache.image(this.ambientTexture), gl);
        // }
        // if (this.specularTexture) {
        //     mat.setSpecular(cache.image(this.specularTexture), gl);
        // }
        // mat.baseUniforms.smoothness.value = 0.55;
        // mat.baseUniforms.metallic.value = 0;

        return mat;
    }
}

