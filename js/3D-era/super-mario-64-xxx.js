

// usage: log('inside coolFunc', this, arguments);
// paulirish.com/2009/log-a-lightweight-wrapper-for-consolelog/
var log = function(){
	log.history=log.history||[];log.history.push(arguments);if(this.console){arguments.callee=arguments.callee.caller;var a=[].slice.call(arguments);typeof console.log=="object"?log.apply.call(console.log,console,a):console.log.apply(console,a)}};(function(a){function b(){}for(var c="assert,clear,count,debug,dir,dirxml,error,exception,firebug,group,groupCollapsed,groupEnd,info,log,memoryProfile,memoryProfileEnd,profile,profileEnd,table,time,timeEnd,timeStamp,trace,warn".split(","),d;d=c.pop();)a[d]=a[d]||b})(function(){try{console.log();return window.console}catch(a){return window.console={}}}());(function(){var a=jQuery.event.special,b="D"+ +(new Date),c="D"+(+(new Date)+1);a.scrollstart={setup:function(){var c,d=function(b){var d=this,e=arguments;if(c)clearTimeout(c);else{b.type="scrollstart";jQuery.event.handle.apply(d,e)}c=setTimeout(function(){c=null},a.scrollstop.latency)};jQuery(this).bind("scroll",d).data(b,d)},teardown:function(){jQuery(this).unbind("scroll",jQuery(this).data(b))}};a.scrollstop={latency:300,setup:function(){var b,d=function(c){var d=this,e=arguments;b&&clearTimeout(b);b=setTimeout(function(){b=null;c.type="scrollstop";jQuery.event.handle.apply(d,e)},a.scrollstop.latency)};jQuery(this).bind("scroll",d).data(c,d)},teardown:function(){jQuery(this).unbind("scroll",jQuery(this).data(c))}}})();String.prototype.trunc=function(a,b){var c=this.length>a,d=c?this.substr(0,a-1):this;d=b&&c?d.substr(0,d.lastIndexOf(" ")):d;return c?d+"...":d
};


/**
 * Water ripple effect.
 * Original code (Java) by Neil Wallis 
 * @link http://www.neilwallis.com/java/water.html
 * 
 * @author Sergey Chikuyonok (serge.che@gmail.com)
 * @link http://chikuyonok.ru
 */
!(function(){

	var delay = 30,
		riprad = 3,
		ripplemap = [],
		last_map = [],
		disturbInterval = 3000,
		disturbTimeout = 0,
		allowDistrub = false;


	var canvas, ctx,
		width, height, half_width, half_height, size,
		oldind, newind, mapind, ripple, texture,
		count;


	function LiquidPainting( cvs )
	{
		canvas = cvs;
		ctx = canvas.getContext('2d'),
		width = canvas.width,
		height = canvas.height,
		half_width = width >> 1,
		half_height = height >> 1,
		size = width * (height + 2) * 2,
		oldind = width,
		newind = width * (height + 3),

		//
		texture = ctx.getImageData(0, 0, width, height);
		ripple = ctx.getImageData(0, 0, width, height);

		// for (var i = 0; i < size; i++) {
		for( var i=size-1; i!==-1; i-- ){
			last_map[i] = ripplemap[i] = 0;
		}
	}


	LiquidPainting.prototype.stop = function()
	{	
		// allowDisturb = false;
		// clearTimeout( disturbTimeout );
	};


	LiquidPainting.prototype.start = function()
	{
		// allowDisturb = true;
		this.disturb();
	};


	LiquidPainting.prototype.run = function()
	{
		newframe();
		ctx.putImageData(ripple, 0, 0);
	};
	
	/**
	 * Disturb water at specified point
	 */
	LiquidPainting.prototype.disturb = function( x, y ) 
	{
		// if( allowDisturb ) {
		// 	disturbTimeout = setTimeout( this.disturb, disturbInterval );
		// }

		var dx = x || (width * 0.5),
			dy = y || (height * 0.95);

		startRipple( dx, dy );
	};

	function startRipple( dx, dy ) 
	{
		dx <<= 0;
		dy <<= 0;
		for (var j = dy - riprad; j < dy + riprad; j++) {
			for (var k = dx - riprad; k < dx + riprad; k++) {
				ripplemap[oldind + (j * width) + k] += 2048;
			}
		}
	}

	/**
	 * Generates new ripples
	 */	
	function newframe() 
	{
		var i, a, b, x, y, data, cur_pixel, new_pixel, old_data;
		
		i = oldind;
		oldind = newind;
		newind = i;
		
		i = 0;
		mapind = oldind;
		
		x = width-1;
		y = height-1;
		
		// for (y; y!==-1; y--) {
		//	for (x; x!==-1; x--) {
		for (y = 0; y < height; y++) {
			for (x = 0; x < width; x++) {
	
				data = (
					ripplemap[mapind - width] + 
					ripplemap[mapind + width] + 
					ripplemap[mapind - 1] + 
					ripplemap[mapind + 1]) >> 1;
					
				data -= ripplemap[newind + i];
				data -= data >> 5;
				
				ripplemap[newind + i] = data;

				//where data=0 then still, where data>0 then wave
				data = 1024 - data;
				
				old_data = last_map[i];
				last_map[i] = data;
				
				if (old_data != data) {
					//offsets
					a = (((x - half_width) * data / 1024) << 0) + half_width;
					b = (((y - half_height) * data / 1024) << 0) + half_height;
	
					//bounds check
					a = (a>=width) ? width-1 : (a<0) ? 0 : a;
					b = (b>=height) ? height-1 : (b<0) ? 0 : b;
	
					new_pixel = (a + (b * width)) * 4;
					cur_pixel = i * 4;
					
					ripple.data[cur_pixel] = texture.data[new_pixel];
					ripple.data[cur_pixel + 1] = texture.data[new_pixel + 1];
					ripple.data[cur_pixel + 2] = texture.data[new_pixel + 2];
				}
				
				++mapind;
				++i;
			}
		}
		//mapind = _mapind;
	}

	window.LiquidPainting = LiquidPainting;

})();


// main welcome page
(function(global,Pages){


	// Shortcut
	var _cn = "super-mario-64::";

	// DOM Elements
	var body, element, canvasElement, mainStage;
	var canvas, context;
	var liquidPainting;

	// Settings
	var requestRender = false;
	var imagesLoaded = false;
	var imageDir = "/images/3D-era/super-mario-64/";
	var loadQueue = null;
	var disturbTime = 0;
	var disturbInterval = 3000;

	var timer = { time:0, start:0, update:function(){ timer.time = Date.now()-timer.start; } };
	var layout = { width:0 ,height:0, scale:1 };
	var hitArea = { x:0, y:0, width:0, height:0 };

	// Scene Objects
	var scene = {x:0, y:0, width:1664, height:988, centerX:832};
	var wall = {image:null, src:"wall-pat.jpg"};
	var floor = {y:696, image:null, src:"floor-pat.jpg"};
	var pillar = {width:245, height:785, xOffset:408, src:"pillars.jpg"};
	var stage = {x:180, y:629, width:1059, height:224, image:null, src:"stage.png"};
	var mario = {x:500, y:504, width:225, height:225, image:null, src:"mario-breathing.png", fps:45, frame:0, totalFrames:0, totalWidth:0};
	var frame = {x:515, y:160, width:406, height:406, image:null, src:"frame.jpg"};
	var painting = {x:0, y:185, width:356, height:356, image:null, src:"painting.jpg"};


	// ------------------------------------------------------------------------------------------
	// Application Hook Methods
	// ------------------------------------------------------------------------------------------

	/**
	 * initialize the page so it can slide in
	 */
	function init() 
	{
		// log( _cn + "init" );

		// Define elements
		body = $("body");
		element = $("#content #super-mario-64");
		mainStage = $(".main-stage", element);
		canvasElement = $("#mario-64-canvas", element);
		
		// Define canvas and context
		canvas = canvasElement[0];
		context = canvas.getContext("2d");
		sceneCanvas = document.createElement("canvas");
		sceneContext = sceneCanvas.getContext("2d");
		roomCanvas = document.createElement("canvas");
		roomContext = roomCanvas.getContext("2d");
		paintingCanvas = document.createElement("canvas");
		paintingContext = paintingCanvas.getContext("2d");

		// Static widths:
		roomCanvas.width = sceneCanvas.width = scene.width;
		roomCanvas.height = sceneCanvas.height = scene.height;
		paintingCanvas.width = painting.width;
		paintingCanvas.height = painting.height;

		// Settings
		imagesLoaded = false;
		requestRender = false;
		loadQueue = [];

		// Set up Scene
		wall.image = createImage( "wall", wall.src );
		floor.image = createImage( "floor", floor.src );
		pillar.image = createImage( "pillar", pillar.src );
		mario.image = createImage( "mario", mario.src );
		stage.image = createImage( "stage", stage.src );
		frame.image = createImage( "frame", frame.src );
		painting.image = createImage( "painting", painting.src );

		// Handle Resize
		updateLayout();
		timer.start = Date.now();
		requestRender = true;
		animate();
	}

	/**
	 * start the page's animations, event handling, etc
	 */
	function ready() 
	{
		// log( _cn + "ready" );

		// Set start time
		// timer.start = Date.now();
		// requestRender = true;
		// animate();

		// Add event listeners
		element.on( "mousemove", handleMouseMove );
		window.addEventListener( "resize", updateLayout );
	}


	/**
	 * stop the page, freeze the display, remove event handlers, etc
	 */
	function teardown() 
	{
		// log( _cn + "tearDown" );

		// Remove event listeners
		window.removeEventListener( "resize", updateLayout );
		element.off( "mousemove", handleMouseMove );

		// Clear timer
		timer.time = timer.start = 0;

		loadQueue = [];
		imagesLoaded = false;
		requestRender = false;

		// Kill Liquid Painting
		liquidPainting.stop();
		liquidPainting = null;

		// Destroy canvases
		canvas = sceneCanvas = roomCanvas = paintingCanvas = null;
		context = sceneContext = roomContext = paintingContext = null;

		// Destroy images
		wall.image = floor.image = pillar.image = mario.image = null;
		stage.image = frame.image = painting.image = null;

	}




	// ------------------------------------------------------------------------------------------
	// Build Methods
	// ------------------------------------------------------------------------------------------


	function buildRoom() 
	{
		// Make sure all images have loaded
		if( loadQueue.length > 0 ) return;

		var pattern, pillarX;

		roomCanvas.width = scene.width;
		roomCanvas.height = scene.height;

        // Draw Wall
		pattern = roomContext.createPattern( wall.image, 'repeat-x');
        roomContext.fillStyle = pattern;
        roomContext.fillRect(0, 0, scene.width, scene.height);

        // Draw Floor
        pattern = roomContext.createPattern( floor.image, 'repeat');
        roomContext.fillStyle = pattern;
        roomContext.fillRect(0, floor.y, scene.width, scene.height-floor.y);

        // Draw Left Pillar
        pillarX = scene.centerX - (pillar.xOffset + pillar.width);
        roomContext.drawImage( pillar.image, 0, 0, pillar.width, pillar.height, pillarX, 0, pillar.width, pillar.height );

        // Draw Right Pillar (by drawing from right half of pillar img)
        pillarX = scene.centerX + pillar.xOffset;
        roomContext.drawImage( pillar.image, pillar.width, 0, pillar.width, pillar.height, pillarX, 0, pillar.width, pillar.height );

        // Draw Stage centered
		stage.x = scene.centerX - (stage.width*0.5);
        roomContext.drawImage( stage.image, stage.x, stage.y );

        // Draw Frame centered
        frame.x = scene.centerX - (frame.width*0.5);
        roomContext.drawImage( frame.image, frame.x, frame.y );
	}

	function buildScene() 
	{
		// Make sure all images have loaded
		if( loadQueue.length > 0 ) return;

	//	buildRoom();

		// Set total width and frames of the mario sprite
		mario.totalWidth = mario.image.width;
		mario.totalFrames = Math.floor(mario.totalWidth / mario.width);

		// Set Painting
		paintingContext.drawImage( painting.image, 0, 0 );
		liquidPainting = new LiquidPainting( paintingCanvas );
		liquidPainting.start();
	}

	function updateLayout()
	{
		// Set up dimension and scale
		layout.left = parseFloat(element.css("padding-left"));
		layout.width = window.innerWidth - layout.left;
		layout.height = Math.ceil(window.innerHeight - parseFloat( mainStage.css("padding-bottom")) );
		layout.scale = Math.max( layout.width/scene.width, layout.height/scene.height );

		// Apply dimension to canvas
		canvasElement.css({"width" : layout.width, "height":layout.height});
		canvas.width = layout.width;
		canvas.height = layout.height;

		// Apply offset to Scene
		var w = scene.width*layout.scale;
		var h = scene.height*layout.scale;
		scene.x = Math.round( (layout.width-w) * 0.5 );
		scene.y = Math.round( (layout.height-h) * 0.25 );
		scene.centerX = (scene.width -  parseFloat(mainStage.css("padding-right"))) * 0.5;

		// Painting position update
		painting.x = scene.centerX - painting.width*0.5;

		// Apply scale to the Hit Area
		hitArea.x = layout.left + scene.x + (painting.x * layout.scale);
		hitArea.y = scene.y + (painting.y * layout.scale);
		hitArea.width = painting.width * layout.scale;
		hitArea.height = painting.height * layout.scale;

		// Mario position updates
		mario.x = scene.centerX - (mario.width*0.5);
		mario.y = stage.y + 70 - mario.height;

		// Redraw Scene
	//	buildRoom();
	}


	// ------------------------------------------------------------------------------------------
	// Render Methods
	// ------------------------------------------------------------------------------------------


	function render()
	{
		if( !imagesLoaded || !requestRender ) return;

		// Update Disturb Interval
		if( disturbTime !== Math.floor(timer.time/disturbInterval) ) {
			disturbTime = Math.floor(timer.time/disturbInterval);
			liquidPainting.disturb();
		}

		// Update Mario Frame
		mario.frame = Math.floor( timer.time/mario.fps ) %mario.totalFrames;
		
		// Update Painting
		liquidPainting.run();

		// sceneContext.clearRect( 0, 0, scene.width, scene.height );
		sceneContext.drawImage( roomCanvas, 0, 0 );
		sceneContext.drawImage( paintingCanvas, painting.x, painting.y );
		sceneContext.drawImage( mario.image, (mario.frame*mario.width), 0, mario.width, mario.height, mario.x, mario.y, mario.width, mario.height );
		
		context.drawImage( sceneCanvas, scene.x, scene.y, (scene.width*layout.scale), (scene.height*layout.scale) );
	}


	function animate()
	{
		timer.update();
		render();
		if( requestRender ) requestAnimationFrame( animate );
	}



	
	// ------------------------------------------------------------------------------------------
	// Interactive Event Handlers
	// ------------------------------------------------------------------------------------------


	function handleMouseMove( event ) 
	{
		var pt = { x:event.pageX||event.layerX, y:event.pageY||event.layerY };
		if( hitTest(pt) ) {
			liquidPainting.disturb( (pt.x-hitArea.x)/layout.scale, (pt.y-hitArea.y)/layout.scale );
		}
	}


	function hitTest( pt, _rect )
	{
		var rect = _rect||hitArea;
		var flagX = (pt.x >= rect.x) ? (pt.x <= rect.x+rect.width) : false;
		var flagY = (pt.y >= rect.y) ? (pt.y <= rect.y+rect.height) : false;
		return (flagX && flagY);
	}


	// ------------------------------------------------------------------------------------------
	// Image Event Handlers
	// ------------------------------------------------------------------------------------------



	function createImage( id, src ) 
	{
		var img = new Image();
		img.id = id;
		img.onload = handleImageLoad;
		img.onabort = img.onerror = handleImageError;
		img.src = imageDir + src;

		// Push to Load Queue
		loadQueue.push( img );
		return img;
	}

	function handleImageLoad()
	{
		var img=null, i=loadQueue.length-1;
		for( i; i!==-1 && img===null; i-- ) {
			img = (this.id==loadQueue[i].id) ? loadQueue[i] : img; 
			if( img!==null) {
				loadQueue.splice(i,1);
			}
		}
		imagesLoaded = loadQueue.length === 0;
		if( imagesLoaded ) {
			buildScene();
		}
	}

	function handleImageError()
	{
		log( this.id + " load error", this );
	}


	// ------------------------------------------------------------------------------------------
	// Application Hooks
	// ------------------------------------------------------------------------------------------


	Pages.page_scripts["/3D-era/super-mario-64"] = {
		//init: init,
		//ready: ready,
		//teardown: teardown
	};

})(window,Pages);



