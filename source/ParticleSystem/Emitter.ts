import { Particle } from "./Particle";
import { StaticMesh } from "../core/Render/Resources/Mesh/StaticMesh";
import { QuadMesh } from "../BasicGeometries/Quad";
import { Material } from "../core/Render/Renderer";
import { BasicMaterial } from "../core/Render/Resources/Materials/BasicMaterial";
import { Vector3 } from "../Math/Mathf";

export class Emitter {

    public particles: Array<Particle>;
    public material: Material;
    public particleMesh: StaticMesh;
    public particleSize: number;
    public maxParticles: number;
    public spawnRate: number;
    public particleLifeTime: number;
    public emitterLifeTime: number;
    public simulationTime: number;
    public lastSpawnTime: number;

    constructor() {
        this.particles = new Array();
        this.material = BasicMaterial.SharedInstance;
        this.particleSize = 1;
        this.maxParticles = 100;
        this.spawnRate = 5;
        this.particleLifeTime = 2000;
        this.emitterLifeTime = 10000;
        this.simulationTime = 0;
        this.lastSpawnTime = 0;
        this.particleMesh = new QuadMesh(this.material, 1, 1);
    }

    public update(deltaTimeMillis: number) {
        this.simulationTime += deltaTimeMillis;

        if (this.simulationTime >= this.emitterLifeTime) {
            this.simulationTime = 0;
            for (let i = 0; i < this.particles.length; i++) {
                this.particles[i].kill();
            }
        } else {
            for (let i = 0; i < this.particles.length; i++) {
                if (this.particles[i].alive && this.particles[i].ttl >= this.simulationTime) {
                    this.particles[i].kill();
                }
            }

            let spawnRateMillis = 1000 / this.spawnRate;
            let deltaSpawnTime = this.simulationTime - this.lastSpawnTime;
            let aliveParticles = this.particles.filter(p => p.alive).length;
            if (deltaSpawnTime >= spawnRateMillis && aliveParticles < this.maxParticles) {
                this.lastSpawnTime = this.simulationTime;
                let particle = this.getFirstDeadParticle();
                if (!Particle) {
                    particle = new Particle();
                    this.particles.push(particle);
                }
                particle.reset(this.particleLifeTime + this.simulationTime, new Vector3(), new Vector3(), new Vector3(this.particleSize));
            }
        }
    }

    private getFirstDeadParticle(): Particle {
        for (let i = 0; i < this.particles.length; i++) {
            if (!this.particles[i].alive) {
                return this.particles[i];
            }
        }
        return null;
    }
}
