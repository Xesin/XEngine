
namespace XEngine2 {
    export class Plane {

        public component: Vector4;

        public normal : Vector3;
        public constant : number;

        constructor(normal = new Vector3(1, 0, 0), constant = 0 )
        {
            this.component = new Vector4();
            this.normal = normal;
            this.constant = constant;
        }

        public setComponents(x: number, y: number, z: number, w: number): Plane
        {
            this.normal.x = x;
            this.normal.y = y;
            this.normal.z = z;
            this.constant = w;

            this.constructor

            return this;
        }

        public normalize()
        {
            let inverseNormalLength = 1.0 / this.normal.length();
            this.normal.scalar( inverseNormalLength );
            this.constant *= inverseNormalLength;

            return this;
        }
    }
}