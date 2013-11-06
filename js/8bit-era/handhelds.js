// main welcome page
(function(global,Pages){
	//SETTINGS
	var config = {
		debug: true,
		logging: false,
		mobileMaxWidth: 768
	};

	if(config.logging) log('new Handhelds()');

	//VIEW
	var view = null;
	var $view = null;
	var mainstage = null;
	var art = null;

	//CONTROLLER
	var inited = false;
	var readied = false;
	var playVideoLoopTimeout = null;
	var videoLoopIsPlaying = false;
	var usingMobileLayout = null;

	//Initialize the page so it can slide in.
	function init() {
		if(config.logging) log('Handhelds.init()');

		//INIT VIEW
		view = document.getElementById('handhelds');
		$view = $(view);
		mainStage = $view.find('.main-stage')[0];
			art = $view.find('.handhelds__art')[0];
				art__inner = $view.find('.handhelds__art >.inner')[0];
					consolesElement = $view.find('.handhelds__consoles')[0];
						gameBoy = $view.find('.handhelds__game-boy')[0];
							gameBoy__video = null;//$(gameBoy).find('video')[0];
						gameBoyAdvance = $view.find('.handhelds__game-boy-advance')[0];
							gameBoyAdvance__video = null;//$(gameBoyAdvance).find('video')[0];
						nintendoDS = $view.find('.handhelds__nintendo-ds')[0];
							nintendoDS__video = null;//$(nintendoDS).find('video')[0];
		consoles = [gameBoy, gameBoyAdvance, nintendoDS];
		videos = null;//Array


		//INIT CONTROLLER
		mousePosition = {left:50, top:400};//The users location is most likely to be over the nav item.

		//SET INITIAL STATE
		hideRefreshButton();
		var browserSupportsVideoAutoplay2 = browserSupportsVideoAutoplay();
		if(browserSupportsVideoAutoplay2){
			gameBoy__video = document.createElement('video');
			gameBoy__video.poster = '../images/8bit-era/handhelds/game-boy__video.jpg';
			gameBoyAdvance__video = document.createElement('video');
			gameBoyAdvance__video.poster = '../images/8bit-era/handhelds/game-boy-advance__video.jpg';
			nintendoDS__video = document.createElement('video');
			nintendoDS__video.poster = '../images/8bit-era/handhelds/nintendo-ds__video.jpg';
			$(nintendoDS__video).addClass('video-1');
			if(Modernizr.video.h264){
				gameBoy__video.src = '../video/8bit-era/handhelds/game-boy.mp4';
				gameBoyAdvance__video.src = '../video/8bit-era/handhelds/game-boy-advance.mp4';
				nintendoDS__video.src = '../video/8bit-era/handhelds/nintendo-ds-1.mp4';
			}else{
				gameBoy__video.src = '../video/8bit-era/handhelds/game-boy.ogv';
				gameBoyAdvance__video.src = '../video/8bit-era/handhelds/game-boy-advance.ogv';
				nintendoDS__video.src = '../video/8bit-era/handhelds/nintendo-ds-1.ogv';
			}
			videos = [
				gameBoy__video,
				gameBoyAdvance__video,
				nintendoDS__video
			];
			
			$(gameBoy.children[0]).prepend(gameBoy__video);
			$(gameBoyAdvance.children[0]).prepend(gameBoyAdvance__video);
			$(nintendoDS.children[0]).prepend(nintendoDS__video);
			
			$(videos).show();
			window._AVManager.addVideos(videos, false, false, function(){
				if(config.logging) log('Handhelds videos loaded.');
				if(readied && !videoLoopIsPlaying && !playVideoLoopTimeout){
					playVideoLoopIfApplicable();
				}
			});
		}else{
			$(videos).hide();
		}

		inited = true;
	}

	// start the page's animations, event handling, etc
	function ready() {
		if(config.logging) log('Handhelds.ready()');
		//return;

		//INIT INTERACTION
		disableSelectionOnMobileBrowsers(art);//Prevent selection of art elements.
		//FastClick.attach(art);//Allow faster interaction on mobile. This prevents double-clicks.
		$(window).bind('resize', onResize);
		$(window).bind('mousemove', onMouseMove);

		//SET INITIAL STATE
		$(art).show();//Unhide after first layout is done.
		onResize();
		$(consoles).css({opacity:0});
		$(consoles[0]).transition({opacity:1, duration:800, delay:0});
		$(consoles[2]).transition({opacity:1, duration:800, delay:300});
		$(consoles[1]).transition({opacity:1, duration:800, delay:600});
		/*if(!videoLoopIsPlaying && !playVideoLoopTimeout){
			playVideoLoopIfApplicable();
		}*/
		
		if(!videoLoopIsPlaying && !playVideoLoopTimeout){
			playVideoLoopIfApplicable();
		}
		
		readied = true;
	}

	// stop the page, freeze the display, remove event handlers, etc
	function teardown() {
		if(config.logging) log('Handhelds.teardown()');

		//SET STATE (before undefining everything)
		$(art).hide();
		clearTimeout(playVideoLoopTimeout);
		playVideoLoopTimeout = null;
		if(videoLoopIsPlaying){
			stopVideoLoop();
		}

		//TEARDOWN VIEW
		view.id = view.id+'__old';//Change the old view's id, so it can't accidentally be found by the new ViewController.

		view = null;
		$view = null;
		art = null;
			mainStage = null;
			art = null;
				art__inner = null;
					consolesElement = null;
						gameBoy = null;
							gameBoy__video = null;
						gameBoyAdvance = null;
							gameBoyAdvance__video = null;
						nintendoDS = null;
							nintendoDS__video = null;
		consoles = null;
		window._AVManager.removeVideos(videos);
		videos = null;

		//TEARDOWN CONTROLLER
		inited = false;
		readied = false;
		mousePosition = null;

		//TEARDOWN INTERACTION
		$(window).unbind('resize', onResize);
		$(window).unbind('mousemove', onMouseMove);
	}

	Pages.page_scripts["/8bit-era/handhelds"] = {
		init: init,
		ready: ready,
		teardown: teardown
	};

	function playVideoLoopIfApplicable(){
		var usingMobileLayout = (window.innerWidth > config.mobileMaxWidth)? false : true;
		var browserSupportsVideoAutoplay2 = browserSupportsVideoAutoplay();
		if(browserSupportsVideoAutoplay2 && !usingMobileLayout){
			playVideoLoopTimeout = setTimeout(function(){
				playVideoLoopTimeout = null;
				playVideoLoop();
			}, 1000);
		}
	}

	function playVideoLoop(){
		videoLoopIsPlaying = true;
		window._AVManager.playVideo(gameBoy__video);//gameBoy__video.play();
		videoTimeouts = [];
		videoTimeouts.push(setTimeout(function(){
			window._AVManager.playVideo(gameBoyAdvance__video);//gameBoyAdvance__video.play();
		}, 6300));
		videoTimeouts.push(setTimeout(function(){
			window._AVManager.playVideo(nintendoDS__video);//nintendoDS__video.play();
		}, 8500));
		videoTimeouts.push(setTimeout(function(){
			videoIsPlaying = false;
			playVideoLoop()//Loop
		}, 11800));
	}

	function stopVideoLoop(){
		videoLoopIsPlaying = false;
		for(var i in videos){
			var video = videos[i];
			video.pause();
		}
		for(var i in videoTimeouts){
			var timeout = videoTimeouts[i];
			clearTimeout(timeout);
		}
		videoTimeouts = [];
	}


	function onResize(event){
		if(window.innerWidth > config.mobileMaxWidth){
			if(usingMobileLayout){
				usingMobileLayout = false;
				playVideoLoopIfApplicable();
			}
		}else{//Disable video if switching to mobile layout.
			if(!usingMobileLayout){
				clearTimeout(playVideoLoopTimeout);
				usingMobileLayout = true;
				if(videoLoopIsPlaying){
					stopVideoLoop();
				}
			}
		}
		positionConsoles();

	}
	function onMouseMove(event){
		mousePosition = {left:event.clientX, top:event.clientY};
		positionConsoles();
	}
	function positionConsoles(){
		var maxHorizontalMovement = -15;//In pixels. Negative so it moves opposite your cursor.
		var maxVerticalMovement = -15;//In pixels. Negative so it moves opposite your cursor.
		var xOffset = -520;
		var yOffset = -360;
		var consoleDefaultPositionsRelativeToStageCenter = [
			{x:100+xOffset, y:200+yOffset, z:0},//gameBoy
			{x:400+xOffset, y:26+yOffset, z:-2},//gameBoyAdvance
			{x:400+xOffset, y:290+yOffset, z:-1},//nintendoDS
		];
		for(var i in consoles){
			var console = consoles[i];

			//Make consoles move farther if they are in front or back.
			var parallaxExaggeration = Math.abs(consoleDefaultPositionsRelativeToStageCenter[i].z)*0.3;

			var mouseXPercentFromCenter = -1 + (mousePosition.left/window.innerWidth)*2;//Number from -1 to 1.
			var basicXParallaxMovement = maxHorizontalMovement * mouseXPercentFromCenter;
			var xParallaxMovement = basicXParallaxMovement + basicXParallaxMovement * parallaxExaggeration;
			var x = consoleDefaultPositionsRelativeToStageCenter[i].x + xParallaxMovement;

			var mouseYPercentFromCenter = -1 + (mousePosition.top/window.innerHeight)*2;//Number from -1 to 1.
			var yParallaxMovement = maxVerticalMovement * mouseYPercentFromCenter;
			yParallaxMovement += yParallaxMovement * parallaxExaggeration;
			var y = consoleDefaultPositionsRelativeToStageCenter[i].y + yParallaxMovement;

			var z = 0;//consoleDefaultPositionsRelativeToStageCenter[i].z;

			//var transform = 'translate('+x+','+y+')';
			var transform = 'translate3d('+x+'px,'+y+'px,'+z+'px)';

			/*$(console).transition({
				//left:left,
				//top:top
				transform: transform,
				duration:1
			});*/

			//$(console).css('-webkit-transform',transform);

			$(console).css({
				webkitTransform: transform,
				mozTransform: transform,
				transform: transform
			});
		}

		//Center the whole container
		var left = $(art).width()/2;
		var top = $(art).height()/2;
		$(art__inner).css({left:left, top:top});
	}


})(window,Pages);
