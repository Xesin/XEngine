import {ObjData, BasicLoader, Loader} from "../_module/Loader";

export class ObjMtlLoader implements BasicLoader {

    public objUrl: string;
    public mtlUrl: string;
    public completed: boolean;
    public isLoading: boolean;

    private loader: Loader;
    private state: ObjData;
    private readonly object_pattern = /^[og]\s*(.+)?/;
    private readonly material_use_pattern = /^usemtl /;
    private readonly material_library_pattern = /^mtllib /;

    constructor (objUrl: string, mtlUrl: string, loader: Loader, frameWidth = 0, frameHeight = 0) {
        this.isLoading = false;
        this.objUrl = objUrl;
        this.mtlUrl = mtlUrl;
        this.completed = false;
        this.loader = loader;
    }

    public load() {
        this.isLoading = true;
        let _this = this;
        this.state =  new ObjData();
        let request = new XMLHttpRequest();
        request.open("GET", _this.objUrl, true);
        let mtlRequest = new XMLHttpRequest();
        mtlRequest.open("GET", _this.mtlUrl, true);
        let objHandler = function () {
            let objData = request.response;
            _this.parseObjDataToMesh(objData);
            _this.completed = true;
            _this.loader._notifyCompleted();
        };

        let mtlHandler = function () {
            let mtlData = mtlRequest.response;
            _this.parseMtlDataToMaterial(mtlData);
            request.send();
        };

        request.onload = objHandler;
        mtlRequest.onload = mtlHandler;
        mtlRequest.send();
    }

    private parseMtlDataToMaterial(text) {
        let lines = text.split( "\n" );
        let info = {};
        let delimiter_pattern = /\s+/;
        let state = this.state;

        for ( let i = 0; i < lines.length; i ++ ) {

            let line = lines[ i ];
            line = line.trim();

            if ( line.length === 0 || line.charAt( 0 ) === "#" ) {

                // Blank line or comment ignore
                continue;

            }

            let pos = line.indexOf( " " );

            let key = ( pos >= 0 ) ? line.substring( 0, pos ) : line;
            key = key.toLowerCase();

            let value = ( pos >= 0 ) ? line.substring( pos + 1 ) : "";
            value = value.trim();

            if ( key === "newmtl" ) {

                // New material
                state.startMaterial(value);
                info = { name: value };

            } else if ( info ) {

                if ( key === "ka" || key === "kd" || key === "ks" ) {

                    let ss = value.split( delimiter_pattern, 3 );
                    info[ key ] = [ parseFloat( ss[ 0 ] ), parseFloat( ss[ 1 ] ), parseFloat( ss[ 2 ] ), 1.0 ];
                    switch (key) {
                        case "ka":
                            state.currentMaterial.ambient = info[ key ];
                            break;
                        case "kd":
                            state.currentMaterial.diffuse = info[ key ];
                            break;
                        // case "ks":
                        //     state.currentMaterial.ambient = info[ key ];
                        //     break;
                    }
                } else {

                    info[ key ] = value;
                    switch (key) {
                        case "map_ka":
                            this.loader.image(info[ key ], "img/" + info[ key ]);
                            this.loader._startPreload();
                            state.currentMaterial.ambientTexture = info[ key ];
                            break;
                        case "map_kd":
                            this.loader.image(info[ key ], "img/" + info[ key ]);
                            this.loader._startPreload();
                            state.currentMaterial.albedoture = info[ key ];
                            break;
                        case "map_bump":
                            this.loader.image(info[ key ], "img/" + info[ key ], true);
                            this.loader._startPreload();
                            state.currentMaterial.normalture = info[ key ];
                            break;
                        case "map_d":
                            this.loader.image(info[ key ], "img/" + info[ key ]);
                            this.loader._startPreload();
                            state.currentMaterial.opacityMask = info[ key ];
                            break;
                        case "map_ks":
                            this.loader.image(info[ key ], "img/" + info[ key ]);
                            this.loader._startPreload();
                            state.currentMaterial.specularTexture = info[ key ];
                    }
                }

            }

        }
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
                        this.state.vertices.push(
                            parseFloat( data[ 1 ] ),
                            parseFloat( data[ 2 ] ),
                            parseFloat( data[ 3 ] ),
                        );
                        if ( data.length === 8 ) {

                            this.state.vertices.push(
                                parseFloat( data[ 4 ] ),
                                parseFloat( data[ 5 ] ),
                                parseFloat( data[ 6 ] ),
                                0,
                            );

                        }
                        break;
                    case "vn":
                        this.state.normals.push(
                            parseFloat( data[ 1 ] ),
                            parseFloat( data[ 2 ] ),
                            parseFloat( data[ 3 ] ),
                        );
                        break;
                    case "vt":
                        this.state.uvs.push(
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
                    this.state.addFace(
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
                this.state.startObject( name, undefined );
            } else if ( this.material_use_pattern.test( line ) ) {

                // material
                this.state.addMaterial( line.substring( 7 ).trim() );

            }

        }

        // tslint:disable-next-line:forin
        for (let mat in this.state.materials) {

            let objMat = this.state.materials[ mat ];
            let material = objMat.createMaterial(this.loader.game, this.loader.game.renderer.gl);
            this.loader.game.cache.materials[objMat.name] = material;
        }

        for ( let i = 0, l = this.state.objects.length; i < l; i ++ ) {

            let object = this.state.objects[ i ];
            let geometry = object.createGeometry(this.loader.game);
            this.loader.game.cache.geometries[object.name] = geometry;
        }
    }
}

