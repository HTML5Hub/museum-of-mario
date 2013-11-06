// main welcome page
(function(global,Pages){

	// Shortcut
	var _cn = "super-mario-sunshine::";

	var body, element ,canvasElement, videoElement, slimeElement, video;
	var canvas ,context, drawCanvas, drawContext, imageCanvas, imageContext;


	// Settings
	var imagesLoaded = false;
	var requestRender = false;
	var useTouch = false;
	var allowVideo = false;
	var layout = { width:0 ,height:0 ,_width:2000 ,_height:1188, scale:1 };
	var videoInfo = { x:0, y:0, width:0, height:0, _width:1200, _height:800, scale:1 };
	var videoSource = { mp4 : "/video/3D-era/super-mario-sunshine/slime.mp4", ogv : "/video/3D-era/super-mario-sunshine/slime.ogv" };
	var mario = { x:500, y:0, width:0, height:0, _width:1155, _height:1065, moveY:60, image:null, src:"/images/3D-era/super-mario-sunshine/mario.png" };
	var background = { x:0, y:0, width:0, height:0, _width:2000, _height:1188, image:null, src:"/images/3D-era/super-mario-sunshine/background.jpg" };
	
	var drawInfo = {
		x : 0
		,y : 0
		,_radius : 180
		,radius : 100
		,points : []
		,render : false
	};

	var timer = {
		time : 0
		,start : 0
		,decay : 3000
		,update : function() {
			timer.time = Date.now() - timer.start;
		}
	};
	
	//Audio
	var sounds = null;//Object
	var soundsArray = null;//Array
	var allowMouseSounds = true;//Boolean

	// usage: log('inside coolFunc', this, arguments);
	// paulirish.com/2009/log-a-lightweight-wrapper-for-consolelog/
	var log = function(){
		log.history=log.history||[];log.history.push(arguments);if(this.console){arguments.callee=arguments.callee.caller;var a=[].slice.call(arguments);typeof console.log=="object"?log.apply.call(console.log,console,a):console.log.apply(console,a)}};(function(a){function b(){}for(var c="assert,clear,count,debug,dir,dirxml,error,exception,firebug,group,groupCollapsed,groupEnd,info,log,memoryProfile,memoryProfileEnd,profile,profileEnd,table,time,timeEnd,timeStamp,trace,warn".split(","),d;d=c.pop();)a[d]=a[d]||b})(function(){try{console.log();return window.console}catch(a){return window.console={}}}());(function(){var a=jQuery.event.special,b="D"+ +(new Date),c="D"+(+(new Date)+1);a.scrollstart={setup:function(){var c,d=function(b){var d=this,e=arguments;if(c)clearTimeout(c);else{b.type="scrollstart";jQuery.event.handle.apply(d,e)}c=setTimeout(function(){c=null},a.scrollstop.latency)};jQuery(this).bind("scroll",d).data(b,d)},teardown:function(){jQuery(this).unbind("scroll",jQuery(this).data(b))}};a.scrollstop={latency:300,setup:function(){var b,d=function(c){var d=this,e=arguments;b&&clearTimeout(b);b=setTimeout(function(){b=null;c.type="scrollstop";jQuery.event.handle.apply(d,e)},a.scrollstop.latency)};jQuery(this).bind("scroll",d).data(c,d)},teardown:function(){jQuery(this).unbind("scroll",jQuery(this).data(c))}}})();String.prototype.trunc=function(a,b){var c=this.length>a,d=c?this.substr(0,a-1):this;d=b&&c?d.substr(0,d.lastIndexOf(" ")):d;return c?d+"...":d
	};


	/**
	 * initialize the page so it can slide in
	 */
	function init() 
	{
		// log( _cn + "init" );
		hideRefreshButton();

		// Define elements
		body = $("body");
		element = $("#content #super-mario-sunshine");
		canvasElement = $(".sunshine-canvas", element );
		slimeElement = $(".sunshine-slime", element );
		videoElement = $(".sunshine-video", element);
		video = videoElement[0];
		
		// Define canvas and context
		canvas = canvasElement[0];
		context = canvas.getContext("2d");
		drawCanvas = document.createElement("canvas");
		drawContext = drawCanvas.getContext("2d");
		imageCanvas = document.createElement("canvas");
		imageContext = imageCanvas.getContext("2d");

		// Figure out what to show for the slime: video or image?
		allowVideo = (window.matchMedia) ? window.matchMedia("(min-width: 961px)").matches : false;
		slimeElement.toggleClass( "allow-video", allowVideo );

		log( _cn + "init()  allowVideo = " + allowVideo, window.matchMedia("(min-width:961px)") );

		if( allowVideo ) {
			// Set up Video
			video.preload = true;
			video.autoplay = true;
			video.loop = true;
			video.addEventListener( "canplay", handleVideoReady );
			video.addEventListener( "error", handleVideoError );
		}else{
			// Clear video
			

		}

		// Check the overall layout for a desktop-type browser
		
		// video.load();


		// TEMPORARY
		// for( var e in videoEvents ) {
		// 	video.addEventListener( videoEvents[e], handleVideoEvent, false );
		// }
		window._sv = video;

		

		// Settings
		useTouch = $("html").hasClass("touch");
		drawInfo.points = [];
		imagesLoaded = false; 

		// Set up Background Scene
		mario.image = new Image();
		mario.image.onload = handleImageLoad;
		mario.image.onabort = mario.image.onerror = handleImageError;
		mario.image.src = mario.src;

		background.image = new Image();
		background.image.onload = handleImageLoad;
		background.image.onabort = background.image.onerror = handleImageError;
		background.image.src = background.src;

		// Handle Resize
		window.addEventListener( "resize", updateLayout );
		updateLayout();
		
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

		// Handle Resize
		updateLayout();

		// Start Video
		if( video.readyState === video.HAVE_ENOUGH_DATA && !video.playing ) {
			video.currentTime = 0;
			video.play();
		}

		// Set start time
		timer.start = Date.now();
		requestRender = true;
		animate();

		// Add event listeners
		element.on( "mousemove", handleMouseMove );
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
		video.removeEventListener( "canplay", handleVideoReady, false );
		video.removeEventListener( "error", handleVideoError, false );

		// Clear Time
		timer.time = timer.start = 0;

		// Pause Video
		video.pause();

		imagesLoaded = false;
		requestRender = false;

		// Clear Drawing data
		drawInfo.points = null;

		// Nullify
		context = drawContext = imageContext = null;
		canvas = drawCanvas = imageCanvas = null;
		element = canvasElement = videoElement = null;
		background.image = mario.image = null;
		
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
		var audioFolder = '/audio/3D-era/super-mario-sunshine/';
		canPlayOGG = new Audio().canPlayType("audio/ogg")? true : false;
		canPlayMPEG = new Audio().canPlayType("audio/mpeg")? true : false;
		var extension = (canPlayMPEG)? '.mp3' : '.ogg';
		sounds = {
			squirt: new Audio(audioFolder+'SMS-bianco-hills-fludd_squirt'+extension),
			theme: new Audio(audioFolder+'SMS-bianco-hills'+extension),
			shineAppears: new Audio(audioFolder+'SMS-shine-appears'+extension),
		};
		soundsArray = [];
		for(var i in sounds){
			soundsArray.push(sounds[i]);
		}
		window._AVManager.addAudios(soundsArray, true, function(){
			if(!sounds) return;
			audioLoaded = true;
			window._AVManager.playAudio(sounds.theme, true, true);//(audio:HTMLAudioElement, rewind:Boolean, loop:Boolean, onComplete:Function):void
			window._AVManager.playAudio(sounds.shineAppears, true, false);//(audio:HTMLAudioElement, rewind:Boolean, loop:Boolean, onComplete:Function):void
		});
	}

	function buildBackground()
	{
		imagesLoaded = true;

		// Set sizes based on loaded image data
		background.width = background.image.width;
		background.height = background.image.height;
		mario.width = mario.image.width * 2;
		mario.height = mario.image.height * 2;
		mario.y = background.height - (mario.height - mario.moveY);

		// Layout defaults to background size
		imageCanvas.width = layout._width = background.width;
		imageCanvas.height = layout._height = background.height;

		// Draw Background then Mario
		imageContext.drawImage( background.image, 0, 0 );
		imageContext.drawImage( mario.image, mario.x, mario.y );

		render();
	}


	function updateLayout()
	{
		// Set up dimensions
		layout.width = window.innerWidth;
		layout.height = window.innerHeight;

		// Scale
		layout.scale = Math.max( layout.width/layout._width, layout.height/layout._height );

		// Draw Radius
		drawInfo.radius = drawInfo._radius * layout.scale;

		// Update Canvases
		canvas.width = drawCanvas.width = layout.width;
		canvas.height = drawCanvas.height = layout.height;

		// Update Video style
		videoInfo.scale = Math.max( layout.width/videoInfo._width, layout.height/videoInfo._height );
		videoInfo.width = Math.ceil(videoInfo._width * videoInfo.scale);
		videoInfo.height = Math.ceil(videoInfo._height * videoInfo.scale);
		videoInfo.x = Math.round((layout.width - videoInfo.width) * 0.5);
		videoInfo.y = Math.round((layout.height - videoInfo.height) * 0.5);

		// Update Video Position
		videoElement.css( {width:videoInfo.width, height:videoInfo.height, "margin-left":videoInfo.x, "margin-top":videoInfo.y} );

//		log( _cn + "updateLayout", layout, videoInfo );

		render();
	}



	
	// ------------------------------------------------------------------------------------------
	// Render Methods
	// ------------------------------------------------------------------------------------------

	var i, dp, decay;


	function renderDrawing()
	{
		drawInfo.render = drawInfo.points.length > 1;

		drawContext.clearRect( 0, 0, layout.width, layout.height );
		drawContext.beginPath();

		if( drawInfo.render ){
			
			decay = false;
			i = drawInfo.points.length-2;

			// Draw first point as the last point created
			dp = drawInfo.points[i+1];
			drawContext.moveTo( dp.x, dp.y );

			for( i; i!==-1 && !decay; i-- ) 
			{
				dp = drawInfo.points[i];
				decay = (timer.time-dp.timestamp) > timer.decay;
				if( !decay ) drawContext.lineTo( dp.x, dp.y );
			}
			if( decay ) {
				drawInfo.points.splice( 0, i );
			}

			drawContext.strokeStyle = "#FF0000";
			drawContext.lineWidth = drawInfo.radius;
			drawContext.lineCap = "round";
			drawContext.stroke();

		}else{
			drawContext.rect( -1, -1, 1, 1 );
			drawContext.fillStyle = "#FF0000";
			drawContext.fill();
		}
	}


	var marioMoveY = 0;

	function renderBackground()
	{
		marioMoveY = mario.y + (Math.cos(timer.time*0.0025) * mario.moveY);
		imageContext.drawImage( background.image, 0, 0 );
		imageContext.drawImage( mario.image, mario.x, marioMoveY, mario.width, mario.height );
	}


	function render()
	{
		if( !imagesLoaded || !requestRender ) return;

		renderBackground();
		renderDrawing();

		context.save();
		context.drawImage( imageCanvas, 0, 0, (background.width * layout.scale), (background.height * layout.scale) );
		context.globalCompositeOperation = "destination-atop";
		context.drawImage( drawCanvas, 0, 0 );
		context.restore();
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
		drawInfo.points.push( {x:event.pageX, y:event.pageY, timestamp:timer.time} );
		if(allowMouseSounds && sounds){
			allowMouseSounds = false;
			window._AVManager.playAudio(sounds.squirt, true);
			setTimeout(function(){
				allowMouseSounds = true;
			}, 4000);
		}
	}



	
	// ------------------------------------------------------------------------------------------
	// Media Load Event Handlers
	// ------------------------------------------------------------------------------------------


	function handleImageLoad()
	{
		if( mario.image.complete && background.image.complete && !imagesLoaded ) {
			buildBackground();
		}
	}

	function handleImageError( event )
	{
		log( event, this );
	}

	
	function handleVideoReady()
	{
	//	log( arguments[0].type, video.readyState, arguments );
		updateLayout();
		if( !video.playing ) {
			video.play();
		}
	}

	function handleVideoEvent() 
	{
	//	log( arguments[0].type, video.readyState, arguments );
	}

	function handleVideoError( event ) 
	{
		log( event, this );
	}


	
	// ------------------------------------------------------------------------------------------
	// Application Hooks
	// ------------------------------------------------------------------------------------------


	Pages.page_scripts["/3D-era/super-mario-sunshine"] = {
		init: init,
		ready: ready,
		teardown: teardown,
		unmute: unmute
	};

})(window,Pages);




/*
	var videoEvents = [
		"abort"
		,"canplay"
		,"canplaythrough"
		,"durationchange"
		,"emptied"
		,"ended"
		,"error"
		,"loadeddata"
		,"loadedmetadata"
		,"loadstart"
		,"pause"
		,"play"
		,"playing"
		,"progress"
		,"ratechange"
		,"seeked"
		,"seeking"
		,"stalled"
		,"suspend"
//		,"timeupdate"
		,"volumechange"
		,"waiting"
	];

abort	Fires when the loading of an audio/video is aborted
canplay	Fires when the browser can start playing the audio/video
canplaythrough	Fires when the browser can play through the audio/video without stopping for buffering
durationchange	Fires when the duration of the audio/video is changed
emptied	Fires when the current playlist is empty
ended	Fires when the current playlist is ended
error	Fires when an error occurred during the loading of an audio/video
loadeddata	Fires when the browser has loaded the current frame of the audio/video
loadedmetadata	Fires when the browser has loaded meta data for the audio/video
loadstart	Fires when the browser starts looking for the audio/video
pause	Fires when the audio/video has been paused
play	Fires when the audio/video has been started or is no longer paused
playing	Fires when the audio/video is ready to play after having been paused or stopped for buffering
progress	Fires when the browser is downloading the audio/video
ratechange	Fires when the playing speed of the audio/video is changed
seeked	Fires when the user is finished moving/skipping to a new position in the audio/video
seeking	Fires when the user starts moving/skipping to a new position in the audio/video
stalled	Fires when the browser is trying to get media data, but data is not available
suspend	Fires when the browser is intentionally not getting media data
timeupdate	Fires when the current playback position has changed
volumechange	Fires when the volume has been changed
waiting	Fires when the video stops because it needs to buffer the next frame
 */



	// function handleMouseUp()
	// {
	// 	body.removeClass( "noSelect" );
	// 	// element.off( "mousemove", handleMouseMove );
	// 	// element.off( "mouseup mouseleave", handleMouseUp );
	// 	drawInfo.points.push( {x:event.pageX, y:event.pageY, timestamp:timer.time} );
	// }


	// function handleMouseDown( event )
	// {
	// 	body.addClass( "noSelect" );
	// 	// element.on( "mousemove", handleMouseMove );
	// 	// element.on( "mouseup mouseleave", handleMouseUp );
	// 	drawInfo.points.push( {x:event.pageX, y:event.pageY, timestamp:timer.time} );
	// }