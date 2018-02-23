namespace XEngine {
	export class ObjMtlLoader {

		public objUrl: string;
		public mtlUrl: string;
		public completed: boolean;

		private loader: Loader;
		private readonly object_pattern = /^[og]\s*(.+)?/;
		private readonly material_use_pattern = /^usemtl /;
		private readonly material_library_pattern = /^mtllib /;

		constructor (objUrl: string, mtlUrl: string, loader: Loader, frameWidth = 0, frameHeight = 0) {
			this.objUrl = objUrl;
			this.mtlUrl = mtlUrl;
			this.completed = false;
			this.loader = loader;
		}

		public load() {
			let _this = this;
			let request = new XMLHttpRequest();
			request.open("GET", _this.objUrl, true);
			let mtlRequest = new XMLHttpRequest();
			// mtlRequest.open("GET", _this.mtlUrl, true);
			let objHandler = function () {
				let objData = request.response;
				_this.parseObjDataToMesh(objData);
				_this.completed = true;
				_this.loader._notifyCompleted();
				// mtlRequest.send();
			};

			let mtlHandler = function () {

				_this.loader._notifyCompleted();
			};

			request.onload = objHandler;
			// mtlRequest.onload = objHandler;
			request.send();
		}

		private parseObjDataToMesh(text) {

			if ( text.indexOf( "\r\n" ) !== - 1 ) {
				// This is faster than String.split with regex that splits on both
				text = text.replace( /\r\n/g, "\n" );
			}

			if ( text.indexOf( "\\\n" ) !== - 1 ) {

				// join lines separated by a line continuation character (\)
				text = text.replace( /\\\n/g, "" );

			}

			let lines = text.split( "\n" );
			let line = "", lineFirstChar = "";
			let lineLength = 0;
			let result = [];
			let state =  new ObjData();

			// Faster to just trim left side of the line. Use if available.

			for ( let i = 0, l = lines.length; i < l; i ++ ) {

				line = lines[ i ];

				line = line.trim();

				lineLength = line.length;

				if ( lineLength === 0 ) { continue; }

				lineFirstChar = line.charAt( 0 );

				// @todo invoke passed in handler if any
				if ( lineFirstChar === "#" ) { continue; }

				if ( lineFirstChar === "v" ) {

					let data = line.split( /\s+/ );

					switch ( data[ 0 ] ) {

						case "v":
							state.vertices.push(
								parseFloat( data[ 1 ] ),
								parseFloat( data[ 2 ] ),
								parseFloat( data[ 3 ] ),
							);
							if ( data.length === 8 ) {

								state.vertices.push(
									parseFloat( data[ 4 ] ),
									parseFloat( data[ 5 ] ),
									parseFloat( data[ 6 ] ),
									0,
								);

							}
							break;
						case "vn":
							state.normals.push(
								parseFloat( data[ 1 ] ),
								parseFloat( data[ 2 ] ),
								parseFloat( data[ 3 ] ),
							);
							break;
						case "vt":
							state.uvs.push(
								parseFloat( data[ 1 ] ),
								parseFloat( data[ 2 ] ),
							);
							break;

					}

				} else if ( lineFirstChar === "f" ) {

					let lineData = line.substr( 1 ).trim();
					let vertexData = lineData.split( /\s+/ );
					let faceVertices = [];

					// Parse the face vertex data into an easy to work with format

					for ( let j = 0, jl = vertexData.length; j < jl; j ++ ) {

						let vertex = vertexData[ j ];

						if ( vertex.length > 0 ) {

							let vertexParts = vertex.split( "/" );
							faceVertices.push( vertexParts );

						}

					}

					// Draw an edge between the first vertex and all subsequent vertices to form an n-gon

					let v1 = faceVertices[ 0 ];

					for ( let j = 1, jl = faceVertices.length - 1; j < jl; j ++ ) {

						let v2 = faceVertices[ j ];
						let v3 = faceVertices[ j + 1 ];

						state.addFace(
							v1[ 0 ], v2[ 0 ], v3[ 0 ],
							v1[ 1 ], v2[ 1 ], v3[ 1 ],
							v1[ 2 ], v2[ 2 ], v3[ 2 ],
						);

					}
				} else if ( ( result = this.object_pattern.exec( line ) ) !== null ) {

					// o object_name
					// or
					// g group_name

					// WORKAROUND: https://bugs.chromium.org/p/v8/issues/detail?id=2869
					// let name = result[ 0 ].substr( 1 ).trim();
					let name = ( " " + result[ 0 ].substr( 1 ).trim() ).substr( 1 );
					state.startObject( name, undefined );
				}

			}

			for ( let i = 0, l = state.objects.length; i < l; i ++ ) {

				let object = state.objects[ i ];
				let geometry = object.createGeometry();
				let hasVertexColors = false;
				this.loader.game.cache.geometries[object.name] = geometry;
			}
		}
	}
}
