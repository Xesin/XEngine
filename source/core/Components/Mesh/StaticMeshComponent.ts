namespace XEngine2 {

    export class StaticMeshComponent extends SceneComponent {
       
        public Mesh : StaticMesh;
        
        
        private speed: number;

        constructor(game: Game, name = "StaticMeshComponent")
        {
            super(game, name);
            this.speed = Mathf.randomRange(-60, 60);
            this.bCanUpdate = true;
        }

        public update(deltaTime: number)
        {
            super.update(deltaTime);
        }

        public computeBounds()
		{
			let minX: number;
			let minY: number;
			let minZ: number;
			let maxX: number;
			let maxY: number;
			let maxZ: number;

			for(let i = 0; i < this.Mesh.vertexData.length; i++)
			{
				let x = this.Mesh.vertexData[i++];
				let y = this.Mesh.vertexData[i++];
				let z = this.Mesh.vertexData[i];

				if(minX == null || x < minX)
					minX = x;
				if(maxX == null || x > maxX)
					maxX = x;

				if(minY == null || y< minY)
					minY = y;
				if(maxY == null || y > maxY)
					maxY = y;

				if(minZ == null || z < minZ)
					minZ = z;
				if(maxZ == null || z > maxZ)
					maxZ = z;
			}

            this.bounds = new Box(new Vector3(minX, minY, minZ), new Vector3(maxX, maxZ, maxY));
        }
        
        public getBounds(): Box
        {
            if(!this.bounds)
            {
                this.computeBounds();
            }

            return new Box(this.bounds.min, this.bounds.max).applyMatrix4(this.transform.Matrix);
        }

        public getAllRenderableGroups(): Array<MeshGroup>
        {
            if(this.Mesh)
                return new Array<MeshGroup>().concat(this.Mesh.groups);
            else
                return null;
        }
    }
}