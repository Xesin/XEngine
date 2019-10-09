namespace XEngine2 
{
    export class Box
    {
        public min: Vector3;
        public max: Vector3;
        public center: Vector3;

        private points: Array<Vector3>;

        constructor(min: Vector3 = new Vector3( + Infinity, + Infinity, + Infinity ), max: Vector3 = new Vector3( - Infinity, - Infinity, - Infinity ))
        {
            this.min = min.Clone();
	        this.max = max.Clone();
            this.center = new Vector3(0, 0, 0);
            this.points = [
                new Vector3(),
                new Vector3(),
                new Vector3(),
                new Vector3(),
                new Vector3(),
                new Vector3(),
                new Vector3(),
                new Vector3()
            ];
        }

        public makeEmpty(): Box
        {
            this.min.x = this.min.y = this.min.z = + Infinity;
		    this.max.x = this.max.y = this.max.z = - Infinity;

		    return this;
        }

        public expandByPoint(point: Vector3): Box
        {
            this.min.min( point );
		    this.max.max( point );

		    return this;
        }

        public setFromPoints(points: Array<Vector3>): Box
        {
            this.makeEmpty();

            for ( var i = 0, il = points.length; i < il; i ++ ) {

                this.expandByPoint( points[ i ] );

            }

            return this;
        }

        public applyMatrix4(matrix: Mat4x4): Box
        {
            this.points[ 0 ].setTo( this.min.x, this.min.y, this.min.z ).multiplyMatrix( matrix ); // 000
            this.points[ 1 ].setTo( this.min.x, this.min.y, this.max.z ).multiplyMatrix( matrix ); // 001
            this.points[ 2 ].setTo( this.min.x, this.max.y, this.min.z ).multiplyMatrix( matrix ); // 010
            this.points[ 3 ].setTo( this.min.x, this.max.y, this.max.z ).multiplyMatrix( matrix ); // 011
            this.points[ 4 ].setTo( this.max.x, this.min.y, this.min.z ).multiplyMatrix( matrix ); // 100
            this.points[ 5 ].setTo( this.max.x, this.min.y, this.max.z ).multiplyMatrix( matrix ); // 101
            this.points[ 6 ].setTo( this.max.x, this.max.y, this.min.z ).multiplyMatrix( matrix ); // 110
            this.points[ 7 ].setTo( this.max.x, this.max.y, this.max.z ).multiplyMatrix( matrix ); // 111

            this.setFromPoints( this.points );

            return this;
        }
    }
}