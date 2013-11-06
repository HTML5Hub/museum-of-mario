// main welcome page
(function(global,Pages){

	// Stage Universals
	var stage;
	var karts = new Array();
	var bgInterval;
	var bgposition = 0;
	var bgMusic;

	// Scrolling Background
	function bgscroll(){
		bgposition -= 5;
		var bgSize = 775;

		if(bgposition <= 0-bgSize){
			bgposition = 0;
		}

		stage.css("backgroundPosition", bgposition+"px" + ' bottom');
	}

	function bgScrolling(){
		bgInterval = setInterval(bgscroll, 30);
	}

	function bgStop(){
		clearInterval(bgInterval);
	}

	// Kart Object
	function interactiveKart(obj, stage) {
		this.obj = obj;
		this.frameXPositions = [0,108,222,330,442,553,667,778];
		this.stage = stage;
		this.currentFrame = 0;
		this.moveInterval;
		this.bounceInterval;
		this.spinInterval;
		this.startTimer;
		this.spriteStartX = 0;
		this.spriteStartY = 0;
		this.kartSpeed =  Math.random()*20+25;
	}

	interactiveKart.prototype = {

		start : function(){
			var me = this;
			me.readyToDrive();
		},
		moveBack : function(){
			var me = this;
			var currentPos = parseInt(me.obj.css('left'));
			clearInterval(me.moveInterval);
			me.moveInterval = setInterval(function(){
					me.obj.css("left", "-=7px");
					currentPos-=7;
					if(currentPos < -100){
						me.resetPosition();
						me.readyToDrive();
					}
			},me.kartSpeed);
		},
		driveForward : function(){
			var me = this;
			var currentPos = parseInt(me.obj.css('left'));
			clearInterval(me.moveInterval);
			// smaller for mobile
			var movement = 7;
			if($(window).width() <= 768){
				movement = 4;
			}
			me.moveInterval = setInterval(function(){
					me.obj.css("left", "+="+movement+"px");
					currentPos+=movement;
					if(currentPos > parseInt(me.stage.outerWidth())){
						clearInterval(me.moveInterval);
						// drive again
						me.resetPosition();
						me.readyToDrive();
					}
			},me.kartSpeed);
		},
		readyToDrive : function(){
			var me = this;
			var rand = Math.random();
			var startTime = rand*10000;

			// random delay before starting
			me.startTimer = setTimeout(function(){
				me.bounce();
				me.enableClick();
				me.driveForward();
			},startTime);
		},
		enableClick : function(){
			var me = this;
			me.obj.bind('click', function(){
				me.disableClick();
				me.stopBounce();
				me.spin();
				me.moveBack();
			});
		},
		disableClick: function(){
			this.obj.unbind('click');
		},
		bounce : function(){
			var me = this;
			var movement = 3
			var m = 3;

			// smaller for mobile
			if($(window).width() <= 768){
				movement = 2;
			}
			var rand = Math.random();
			var startTime = rand*150;
			var frequency = rand*40+100;
			// start at random time
			setTimeout(function(){

				me.bounceInterval = setInterval(function(){
					me.obj.css("margin-bottom", m);
					if(m == movement){
						m = 0;
					}else{
						m = movement;
					}
				},frequency);
			},startTime);

		},
		stopBounce : function(){
			clearInterval(this.bounceInterval);

		},
		spin : function(){
			var me = this;
			var x = me.spriteStartX;
			var y = me.spriteStartY;
			clearInterval(me.spinInterval);

			// smaller for mobile
			var sizeRatio = 1;
			if($(window).width() <= 768){
				sizeRatio = 0.6;
			}
			// calculate position and rotate through frames in sprite
			me.spinInterval = setInterval(function(){
				if(me.currentFrame !== me.frameXPositions.length - 1){
					me.currentFrame++;
				}else{
					me.currentFrame = 0;
				}
				var x = 0-me.frameXPositions[me.currentFrame] * sizeRatio;

				me.obj.css("background-position", x+'px '+y+'px');

			},60);

		},
		stopSpin : function(){
			clearInterval(this.spinInterval);
		},
		resetPosition : function(){
			var me = this;
			me.stopSpin();
			clearInterval(me.moveInterval);
			me.stopBounce();
			me.obj.css({
				"background-position" : me.spriteStartX+' '+me.spriteStartY,
				"left" : '-100px',
				"margin-bottom": 0
			});
		},
		tearDown : function(){
			this.resetPosition();
			this.disableClick();
			clearTimeout(this.startTimer);
		}

	}

	// initialize the page so it can slide in
	function init() {
		hideRefreshButton();
		stage = $('#super-mario-kart > .main-stage').html('');

		// Music
		if(!window._AVManager.isMuted){
			createBgMusic();
		}

		// Add Kart Elements
		var dk = $('<div class="kart dk"></div>').appendTo(stage);
		var toad = $('<div class="kart toad"></div>').appendTo(stage);
		var yoshi = $('<div class="kart yoshi"></div>').appendTo(stage);
		var peach = $('<div class="kart peach"></div>').appendTo(stage);
		var bowser = $('<div class="kart bowser"></div>').appendTo(stage);
		var luigi = $('<div class="kart luigi"></div>').appendTo(stage);
		var mario = $('<div class="kart mario"></div>').appendTo(stage);
		var goomba = $('<div class="kart goomba"></div>').appendTo(stage);

		var yValues = [31,42,53,64,75,86,97,108];

		karts[0] = new interactiveKart( toad, stage);
		karts[1] = new interactiveKart( dk, stage );
		karts[2] = new interactiveKart( yoshi, stage );
		karts[3] = new interactiveKart( peach, stage );
		karts[4] = new interactiveKart( bowser, stage );
		karts[5] = new interactiveKart( luigi, stage );
		karts[6] = new interactiveKart( mario, stage );
		karts[7] = new interactiveKart( goomba, stage );

	}

	// start the page's animations, event handling, etc
	function ready() {
		// Animate the background
		bgScrolling();

		// Animate the Karts
		for(i=0;i<karts.length;i++){
			karts[i].start();
		}

	}

	// stop the page, freeze the display, remove event handlers, etc
	function teardown() {
		bgStop();

		// Stop karts
		for(i=0;i<karts.length;i++){
			karts[i].tearDown();
		}
		if(bgMusic) window._AVManager.removeAudio(bgMusic);
		bgMusic = null;
	}
	
	function unmute(){
		if(!bgMusic){
			createBgMusic();
		}
	}
	
	function createBgMusic(){
		var audioFolder = '/audio/16bit-era/super-mario-kart/';
		var audioFile = 'super-mario-kart-titlescreen.mp3';
		var isFirefox = typeof InstallTrigger !== 'undefined';
		if(isFirefox){
			audioFile = 'super-mario-kart-titlescreen.ogg';
		}
		bgMusic = new Audio(audioFolder+audioFile);
		window._AVManager.addAudio(bgMusic, true, function(){
			if(!bgMusic) return;
			 window._AVManager.playAudio(bgMusic, true, true);
		});
	}

	Pages.page_scripts["/16bit-era/super-mario-kart"] = {
		init: init,
		ready: ready,
		teardown: teardown,
		unmute: unmute
	};

})(window,Pages);
