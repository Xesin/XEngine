/// <reference path="Plane.ts" />

namespace XEngine2 {
    export class Frustum {

        public planes : Array<Plane>;

        private vector: Vector3;

        constructor(
            p0: Plane = new Plane()
            , p1: Plane = new Plane()
            , p2: Plane = new Plane()
            , p3: Plane = new Plane()
            , p4: Plane = new Plane()
            , p5: Plane = new Plane() )
        {
            this.planes = [p0, p1, p2, p3, p4, p5];
            this.vector = new Vector3();
        }        

        public setFromMatrix(matrix: Mat4x4)
        {
            let planes = this.planes;
            let me = matrix.elements;

            let me0 = me[ 0 ], me1 = me[ 1 ], me2 = me[ 2 ], me3 = me[ 3 ];
            let me4 = me[ 4 ], me5 = me[ 5 ], me6 = me[ 6 ], me7 = me[ 7 ];
            let me8 = me[ 8 ], me9 = me[ 9 ], me10 = me[ 10 ], me11 = me[ 11 ];
            let me12 = me[ 12 ], me13 = me[ 13 ], me14 = me[ 14 ], me15 = me[ 15 ];

            planes[ 0 ].setComponents( me3 - me0, me7 - me4, me11 - me8, me15 - me12 ).normalize();
            planes[ 1 ].setComponents( me3 + me0, me7 + me4, me11 + me8, me15 + me12 ).normalize();
            planes[ 2 ].setComponents( me3 + me1, me7 + me5, me11 + me9, me15 + me13 ).normalize();
            planes[ 3 ].setComponents( me3 - me1, me7 - me5, me11 - me9, me15 - me13 ).normalize();
            planes[ 4 ].setComponents( me3 - me2, me7 - me6, me11 - me10, me15 - me14 ).normalize();
            planes[ 5 ].setComponents( me3 + me2, me7 + me6, me11 + me10, me15 + me14 ).normalize();
        }

        public intersectsBox(box: Box): boolean
        {
            let planes = this.planes;

            for (let i = 0; i < 6; i ++ ) {

                let plane = planes[ i ];
                
                this.vector.x = plane.normal.x > 0 ? box.max.x : box.min.x;
                this.vector.y = plane.normal.y > 0 ? box.max.y : box.min.y;
                this.vector.z = plane.normal.z > 0 ? box.max.z : box.min.z;

                if ( plane.distanceToPoint( this.vector ) < 0 ) {

                    return false;
    
                }
            }

            return true;
        }
    }
}