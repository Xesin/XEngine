/// <reference path="Plane.ts" />

namespace XEngine2 {
    export class Frustum {

        public planes : Array<Plane>;

        constructor(
            p0: Plane = new Plane()
            , p1: Plane = new Plane()
            , p2: Plane = new Plane()
            , p3: Plane = new Plane()
            , p4: Plane = new Plane()
            , p5: Plane = new Plane() )
        {
            this.planes = [p0, p1, p2, p3, p4, p5];
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
    }
}