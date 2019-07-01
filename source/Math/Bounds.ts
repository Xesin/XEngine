namespace XEngine2 
{
    export class Bounds
    {
        public minVector: Vector3;
        public maxVector: Vector3;

        constructor(x: number, y: number, z:number, width: number, height: number, depth:number)
        {
            this.minVector = new Vector3(x | 0, y | 0, z | 0);
            this.maxVector = new Vector3(width, depth, height);
        }
    }
}