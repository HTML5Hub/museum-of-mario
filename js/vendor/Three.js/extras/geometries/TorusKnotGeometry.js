/**
 * @author oosmoxiecode
 * based on http://code.google.com/p/away3d/source/browse/trunk/fp10/Away3D/src/away3d/primitives/TorusKnot.as?spec=svn2473&r=2473
 */

THREE.TorusKnotGeometry = function ( radius, tube, radialSegments, tubularSegments, p, q, heightScale ) {

	THREE.Geometry.call( this );

	var scope = this;

	this.radius = radius || 100;
	this.tube = tube || 40;
	this.radialSegments = radialSegments || 64;
	this.tubularSegments = tubularSegments || 8;
	this.p = p || 2;
	this.q = q || 3;
	this.heightScale = heightScale || 1;
	this.grid = new Array( this.radialSegments );

	var tang = new THREE.Vector3();
	var n = new THREE.Vector3();
	var bitan = new THREE.Vector3();

	for ( var i = 0; i < this.radialSegments; ++ i ) {

		this.grid[ i ] = new Array( this.tubularSegments );
		var u = i / this.radialSegments * 2 * this.p * Math.PI;
		var p1 = getPos( u, this.q, this.p, this.radius, this.heightScale );
		var p2 = getPos( u + 0.01, this.q, this.p, this.radius, this.heightScale );
		tang.subVectors( p2, p1 );
		n.addVectors( p2, p1 );

		bitan.crossVectors( tang, n );
		n.crossVectors( bitan, tang );
		bitan.normalize();
		n.normalize();

		for ( var j = 0; j < this.tubularSegments; ++ j ) {

			var v = j / this.tubularSegments * 2 * Math.PI;
			var cx = - this.tube * Math.cos( v ); // TODO: Hack: Negating it so it faces outside.
			var cy = this.tube * Math.sin( v );

			var pos = new THREE.Vector3();
			pos.x = p1.x + cx * n.x + cy * bitan.x;
			pos.y = p1.y + cx * n.y + cy * bitan.y;
			pos.z = p1.z + cx * n.z + cy * bitan.z;

			this.grid[ i ][ j ] = scope.vertices.push( pos ) - 1;

		}

	}

	for ( var i = 0; i < this.radialSegments; ++ i ) {

		for ( var j = 0; j < this.tubularSegments; ++ j ) {

			var ip = ( i + 1 ) % this.radialSegments;
			var jp = ( j + 1 ) % this.tubularSegments;

			var a = this.grid[ i ][ j ];
			var b = this.grid[ ip ][ j ];
			var c = this.grid[ ip ][ jp ];
			var d = this.grid[ i ][ jp ];

			var uva = new THREE.Vector2( i / this.radialSegments, j / this.tubularSegments );
			var uvb = new THREE.Vector2( ( i + 1 ) / this.radialSegments, j / this.tubularSegments );
			var uvc = new THREE.Vector2( ( i + 1 ) / this.radialSegments, ( j + 1 ) / this.tubularSegments );
			var uvd = new THREE.Vector2( i / this.radialSegments, ( j + 1 ) / this.tubularSegments );

			this.faces.push( new THREE.Face3( a, b, d ) );
			this.faceVertexUvs[ 0 ].push( [ uva, uvb, uvd ] );

			this.faces.push( new THREE.Face3( b, c, d ) );
			this.faceVertexUvs[ 0 ].push( [ uvb.clone(), uvc, uvd.clone() ] );

		}
	}

	this.computeCentroids();
	this.computeFaceNormals();
	this.computeVertexNormals();

	function getPos( u, in_q, in_p, radius, heightScale ) {

		var cu = Math.cos( u );
		var su = Math.sin( u );
		var quOverP = in_q / in_p * u;
		var cs = Math.cos( quOverP );

		var tx = radius * ( 2 + cs ) * 0.5 * cu;
		var ty = radius * ( 2 + cs ) * su * 0.5;
		var tz = heightScale * radius * Math.sin( quOverP ) * 0.5;

		return new THREE.Vector3( tx, ty, tz );

	}

};

THREE.TorusKnotGeometry.prototype = Object.create( THREE.Geometry.prototype );
