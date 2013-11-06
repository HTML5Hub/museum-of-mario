// main welcome page
(function(global,Pages){

	// stage globals
	var stageParts = {};
	var sounds = {};
	var soundsArray = null;
	var timers = [];
	var themeShouldBePlaying = false;

	function animate(){

		var consoleWidth = stageParts.consoleOpen.width();
		var cartAreaWidth = stageParts.cartridgeArea.width();
		var pixelsToEntry = consoleWidth*0.235; // image ratio to entry point
		var entryRightPerc = pixelsToEntry/cartAreaWidth*100;

		stageParts.cartridgeHover.hide();

		// timed transitions
		stageParts.cartridge.css({
			'right' : entryRightPerc+'%',
			'bottom' : '91%',
			'opacity' : '0',
			'margin-bottom' : '-1%',
			'height' : '67%',
			'margin-right' : '.4%'
		});
		stageParts.consoleOpen.css('opacity', '0');
		stageParts.consoleClosed.css('opacity', '1');
		stageParts.consoleBright.css('opacity', '1');
		stageParts.darkness.css('opacity', '0');
		stageParts.glare.css('opacity', '.6');
		// play insert sound
		timers[0] = setTimeout(function(){
			window._AVManager.playAudio(sounds.insert);//(id:String, rewind:Boolean, loop:Boolean, onComplete:Function):void
		},600);

		// play startup sound
		timers[1] = setTimeout(function(){
			window._AVManager.playAudio(sounds.start);//(id:String, rewind:Boolean, loop:Boolean, onComplete:Function):void
		},4500);

		// screen bright
		timers[2] = setTimeout(function(){
			stageParts.glare.css({
				'transition-delay' : '0s',
				'opacity' : '1'
			});
		},6700);

		// start game
		timers[3] = setTimeout(function(){
			themeShouldBePlaying = true;
			if(sounds.theme){
				window._AVManager.playAudio(sounds.theme, true, true);//(id:String, rewind:Boolean, loop:Boolean, onComplete:Function):void
			}
			stageParts.glare.css({
				'-webkit-animation' : 'twinkle 800ms infinite',
				'animation' : 'twinkle 800ms infinite',
				'-moz-animation' : 'twinkle 800ms infinite',
			});

		},7300);


	}

	var resizeTimer;

	function resizerSMB() {
		clearTimeout(resizeTimer);
		resizeTimer = setTimeout(function(){
			var consoleWidth = stageParts.consoleOpen.width();
			var cordRight= consoleWidth*0.1; // ratio to side of console
			var controllerRight = consoleWidth*0.18; // ratio to side of console
			stageParts.cables.css("right", 0-cordRight+"px");
			stageParts.controller.css("right", controllerRight+"px");
		},100);
	}

	function startResize() {
		resizerSMB();
		$(window).resize(resizerSMB);
	}

	function endResize() {
		$(window).off("resize", resizerSMB);
	}

	// initialize the page so it can slide in
	function init() {
		showRefreshButton();
		
		stageParts = {};
		stageParts.stage = $('#super-mario-bros > .main-stage').html('');

		// setup stage elements
		stageParts.gameArea = $('<div class="game-area" />').appendTo(stageParts.stage);
		stageParts.cables = $('<img src="/images/8bit-era/super-mario-bros/cables.png" class="cables">').appendTo(stageParts.gameArea);
		stageParts.consoleOpen = $('<img src="/images/8bit-era/super-mario-bros/console-open.png" class="console console-open">').appendTo(stageParts.gameArea);
		stageParts.consoleClosed = $('<img src="/images/8bit-era/super-mario-bros/console-closed.png" class="console console-closed">').appendTo(stageParts.gameArea);
		stageParts.consoleBright = $('<img src="/images/8bit-era/super-mario-bros/bright-console-closed.png" class="console console-bright">').appendTo(stageParts.gameArea);
		stageParts.controller = $('<img src="/images/8bit-era/super-mario-bros/controller.png" class="controller">').appendTo(stageParts.gameArea);
		stageParts.box = $('<img src="/images/8bit-era/super-mario-bros/box.png" class="box">').appendTo(stageParts.gameArea);

		stageParts.cartridgeArea = $('<div class="cartridge-area" />').appendTo(stageParts.gameArea);
		stageParts.cartridge = $('<img src="/images/8bit-era/super-mario-bros/cartridge.png" class="cartridge cartridge-main">').appendTo(stageParts.cartridgeArea);
		stageParts.cartridgeHover = $('<img src="/images/8bit-era/super-mario-bros/cartridge-hover.png" class="cartridge cartridge-hover">').appendTo(stageParts.cartridgeArea);

		stageParts.darkness = $('<div class="darkness" />').appendTo(stageParts.gameArea);
		stageParts.glare = $('<img src="/images/8bit-era/super-mario-bros/tv-glare.png" class="tv-glare">').appendTo(stageParts.gameArea);

		// Audio
		var audioFolder = '/audio/8bit-era/super-mario-bros/';
		var extension = '.mp3';
		var isFirefox = typeof InstallTrigger !== 'undefined';
		if(isFirefox){
			extension = '.ogg';
		}
		var soundFiles = ['SMB-Game-Insert', 'SMB-NintendoStartSound', 'SMB-Theme'];
		sounds = {};
		sounds.insert = new Audio(audioFolder+soundFiles[0]+extension);
		sounds.start = new Audio(audioFolder+soundFiles[1]+extension);
		if(!window._AVManager.isMuted){
			sounds.theme = new Audio(audioFolder+soundFiles[2]+extension);
		}
		soundsArray = [];
		for(var i in sounds){
			soundsArray.push(sounds[i]);
		}
		window._AVManager.addAudios(soundsArray, true, function(){
			//console.log('All SMB sounds are loaded.');
		});
	}

	// start the page's animations, event handling, etc
	function ready() {
		stageParts.gameArea.bind('click', function(){
			animate();
			stageParts.gameArea.unbind('click');
		});
		startResize();
		stageParts.cartridgeHover.add(stageParts.glare).addClass('animated');
	}

	// stop the page, freeze the display, remove event handlers, etc
	function teardown() {

		// unbind events
		stageParts.gameArea.unbind('click');

		// clear animation timers
		for(i=0;i<timers.length;i++){
			clearTimeout(timers[i]);
		}

		// stop sounds
		if(soundsArray) window._AVManager.removeAudios(soundsArray);
		soundsArray = null;
		sounds = null;
		endResize();
		themeShouldBePlaying = false;
		
		stageParts.cartridgeHover.add(stageParts.glare).removeClass('animated');

	}
	
	function unmute(){
		if(!sounds.theme){
			var audioFolder = '/audio/8bit-era/super-mario-bros/';
			var extension = '.mp3';
			var isFirefox = typeof InstallTrigger !== 'undefined';
			if(isFirefox){
				extension = '.ogg';
			}
			sounds.theme = new Audio(audioFolder+'SMB-Theme'+extension);
			soundsArray.push(sounds.theme);
			window._AVManager.addAudio(sounds.theme, true, function(){
				if(themeShouldBePlaying){
					window._AVManager.playAudio(sounds.theme, true, true);//(id:String, rewind:Boolean, loop:Boolean, onComplete:Function):void
				}
			});
		}
	}
	
	function refresh(){
		teardown();
		init();
		ready();
	}

	Pages.page_scripts["/8bit-era/super-mario-bros"] = {
		init: init,
		ready: ready,
		teardown: teardown,
		refresh: refresh,
		unmute: unmute
	};

})(window,Pages);
