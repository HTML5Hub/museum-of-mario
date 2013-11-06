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

		ripplemap = [];
		last_map = [];
		//
		texture = ctx.getImageData(0, 0, width, height);
		ripple = ctx.getImageData(0, 0, width, height);

		// for (var i = 0; i < size; i++) {
		for( var i=size-1; i!==-1; i-- ){
			last_map[i] = ripplemap[i] = 0;
		}
	}

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
		var dx = x || (width * 0.5),
			dy = y || (height * 0.95);
		startRipple( dx, dy );
	};

	/**
	 * Disturb water at specified point
	 */
	LiquidPainting.prototype.destroy = function()
	{
		canvas = ctx = null;
		texture = ripple = null;
		ripplemap = lastmap = null;
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
	var body, element, wrapper, heroElement, sceneElement, marioElement, canvasElement, frameElement;
	var canvas, context, paintingCanvas, paintingContext;
	var liquidPainting;

	// Settings
	var isTouch = false;
	var requestRender = false;
	var imagesLoaded = false;
	var imageDir = "/images/3D-era/super-mario-64/";
	var loadQueue = null;
	var disturbTime = 0;
	var disturbInterval = 3000;

	var timer = { time:0, start:0, update:function(){ timer.time = Date.now()-timer.start; } };
	var layout = { width:0 ,height:0, scale:1 };
	var hitArea = { x:0, y:0, width:0, height:0 };
	var scene = {x:0, y:0, width:1664, height:988, centerX:832};
	var hero = {x:700, y:129, width:450, height:575};
	var heroScale = {x:0, y:0, w:0, h:0};
	var canvasScale = {x:0, y:0, w:0, h:0};

	// Scene Objects
	var mario = {width:225, height:225, fps:45, frame:0, totalFrames:20, totalWidth:4500};
	var painting = {x:25, y:25, width:356, height:356, image:null, src:"painting.jpg"};
	
	//Audio
	var sounds = null;//Object
	var soundsArray = null;//Array
	var allowMouseSounds = true;//Boolean

	// ------------------------------------------------------------------------------------------
	// Application Hook Methods
	// ------------------------------------------------------------------------------------------

	/**
	 * initialize the page so it can slide in
	 */
	function init() 
	{
		// log( _cn + "init" );
		hideRefreshButton();

		// Define elements
		body = $("body");
		element = $("#content #super-mario-64");
		wrapper = $(".mario-64-scene-wrapper", element );
		sceneElement = $(".mario-64-scene", element);
		heroElement = $(".mario-64-hero", element );
		frameElement = $(".mario-64-frame", element );
		marioElement = $(".mario-64", element );
		canvasElement = $("#mario-64-canvas", element);
		
		// Define canvas and context
		canvas = canvasElement[0];
		context = canvas.getContext("2d");
		paintingCanvas = document.createElement("canvas");
		paintingContext = paintingCanvas.getContext("2d");

		// Settings
		isTouch = $("html").hasClass("touch");
		imagesLoaded = false;
		requestRender = false;
		liquidPainting = null; 
		loadQueue = [];

		// Static widths:
		paintingCanvas.width = painting.width;
		paintingCanvas.height = painting.height;
		painting.image = createImage( "painting", painting.src );

		// Handle Resize
		updateLayout();
		timer.start = Date.now();
		requestRender = true;
		animate();
		
		//INIT AUDIO
		if(!window._AVManager.isMuted){
			createAudio();
		}
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
		if( !isTouch ) canvasElement.on( "mousemove", handleMouseMove );
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
		if( !isTouch ) canvasElement.off( "mousemove", handleMouseMove );

		// Clear timer
		timer.time = timer.start = 0;

		loadQueue = [];
		imagesLoaded = false;
		requestRender = false;

		// Kill Liquid Painting
		if( liquidPainting !== null ) {
			liquidPainting.destroy();
			liquidPainting = null;
		}

		// Destroy canvases
		canvas = paintingCanvas = null;
		context = paintingContext = null;

		// Delete Element References
		body = element = wrapper = sceneElement = heroElement = frameElement = marioElement = canvasElement;
		painting.image = null;
		
		//TEARDOWN AUDIO
		if(soundsArray){
			window._AVManager.stopAudios(soundsArray);
			window._AVManager.removeAudios(soundsArray);
		}
		sounds = null;
		soundsArray = null;
		allowMouseSounds = true;
	}

	function unmute(){
		if(!sounds){
			createAudio();
		}
	}
	
	function createAudio(){
		var audioFolder = '/audio/3D-era/super-mario-64/';
		canPlayOGG = new Audio().canPlayType("audio/ogg")? true : false;
		canPlayMPEG = new Audio().canPlayType("audio/mpeg")? true : false;
		var extension = (canPlayMPEG)? '.mp3' : '.ogg';
		sounds = {
			enterCourse: new Audio(audioFolder+'SM64-Enter-Course'+extension),
			theme: new Audio(audioFolder+'SM64-Inside-Castle-Walls-Theme'+extension)
		};
		soundsArray = [];
		for(var i in sounds){
			soundsArray.push(sounds[i]);
		}
		window._AVManager.addAudios(soundsArray, true, function(){
			if(!sounds) return;
			audioLoaded = true;
			window._AVManager.playAudio(sounds.theme, true, true);//(audio:HTMLAudioElement, rewind:Boolean, loop:Boolean, onComplete:Function):void
		});
	}


	// ------------------------------------------------------------------------------------------
	// Build Methods
	// ------------------------------------------------------------------------------------------


	function buildScene() 
	{
		// Make sure all images have loaded
		if( loadQueue.length > 0 ) return;

		// Set Painting
		paintingContext.drawImage( painting.image, 0, 0 );

		if( !isTouch ) {
			liquidPainting = new LiquidPainting( paintingCanvas );
			liquidPainting.disturb();
		}

		context.drawImage( paintingCanvas, 0, 0, canvas.width, canvas.height );
	}


	function getBackgroundPosition( element )
	{
		var bgPos = element.css("background-position");
		var bgPosArr = bgPos.split(" ");
		var pos = {
			x : (bgPosArr) ? bgPosArr[0] : element.css("background-position-x")
			,y : (bgPosArr) ? bgPosArr[1] : element.css("background-position-y")
		};
		pos.x = pos.x.indexOf("%") > -1 ? parseFloat( pos.x )/100 : pos.x;
		pos.y = pos.y.indexOf("%") > -1 ? parseFloat( pos.y )/100 : pos.y;
		return pos;
	}


	function updateLayout()
	{
		// Set up dimension and scale
		layout.width = window.innerWidth;
		layout.height = window.innerHeight;
		layout.scale = Math.max( layout.width/scene.width, layout.height/scene.height );
		
		// Find the background offset x,y position
		// var bgPosX = sceneElement.css("backgroundPositionX");
		// var bgPosY = sceneElement.css("backgroundPositionY");
		// var bgOffX = bgPosX.indexOf("%") > -1 ? parseFloat( bgPosX )/100 : bgPosX;
		// var bgOffY = bgPosY.indexOf("%") > -1 ? parseFloat( bgPosY )/100 : bgPosY;
		// var bgPos = getBackgroundPosition( sceneElement );
		var bgPos = {x:0.5, y:0.5};
		bgPos.x = (window.innerWidth >= 1300) ? 1 : bgPos.x;


		// Apply offset to Scene
		var w = scene.width*layout.scale;
		var h = scene.height*layout.scale;
		scene.x = Math.round( (layout.width-w) * bgPos.x ); // NOTE: We're right-aligning the 
		scene.y = Math.round( (layout.height-h) * bgPos.y );
		
		heroScale.x = layout.width < 768 ? "50%" : Math.ceil(scene.x + hero.x * layout.scale);
		heroScale.y = Math.ceil(scene.y + hero.y * layout.scale);
		heroScale.width = Math.ceil(hero.width * layout.scale);
		heroScale.height = Math.ceil(hero.height * layout.scale);

		// Update Mario Width for background positioning
		mario.width = Math.round(heroScale.width*0.5);

		// Update Hero Element Size
		heroElement.css( {"left":heroScale.x, "top":heroScale.y, "width":heroScale.width, "height":heroScale.height, "margin-left":(-heroScale.width*0.5) } );
		marioElement.css( {"left":mario.width*0.5, "width":mario.width, "height":mario.width});
		frameElement.css( {"height":heroScale.width } );

		canvasScale.x = canvasScale.x = Math.ceil(painting.x*layout.scale);
		canvasScale.width = canvasScale.height = heroScale.width-(canvasScale.x*2);

		canvas.width = canvas.height = canvasScale.width;
		canvasElement.css( {"width":canvas.width, "height":canvas.height, "margin":Math.floor(painting.x*layout.scale)});

		if( imagesLoaded ) {
			// log( imagesLoaded );
			context.drawImage( paintingCanvas, 0, 0, canvas.width, canvas.height );
		}
	}


	// ------------------------------------------------------------------------------------------
	// Render Methods
	// ------------------------------------------------------------------------------------------


	function render()
	{
		if( !imagesLoaded || !requestRender ) return;

		// Update Disturb Interval
		if( !isTouch ) {
			if( disturbTime !== Math.floor(timer.time/disturbInterval) ) {
				disturbTime = Math.floor(timer.time/disturbInterval);
				liquidPainting.disturb();
			}
			// Update Painting
			liquidPainting.run();
			context.drawImage( paintingCanvas, 0, 0, canvas.width, canvas.height );
		}

		// Update Mario Frame
		mario.frame = Math.floor( timer.time/mario.fps ) % mario.totalFrames;
		marioElement.css( {"background-position" : -(mario.frame*mario.width) + "px 0"} );
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
var pt = {x:0, y:0};
	function handleMouseMove( event ) 
	{
		var ox = (event.pageX - $(this).offset().left) - canvasScale.x;
		var oy = (event.pageY - $(this).offset().top) - canvasScale.y;
		pt.x = Math.round( ox/layout.scale );
		pt.y = Math.round( oy/layout.scale );
		liquidPainting.disturb( pt.x, pt.y );
		if(allowMouseSounds && sounds){
			allowMouseSounds = false;
			window._AVManager.playAudio(sounds.enterCourse, true);
			setTimeout(function(){
				allowMouseSounds = true;
			}, 8000);
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
		init: init,
		ready: ready,
		teardown: teardown,
		unmute: unmute
	};

})(window,Pages);

