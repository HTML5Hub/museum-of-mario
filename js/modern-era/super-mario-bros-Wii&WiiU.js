// main welcome page
(function(global,Pages){

	// Stage Universals
	var stage;
	var characters = [];

	var jumpAudio = null;
	var crashAudio = null;
	var sounds = null;

	// Shaking

	var shakeScene = function(){
		stage.css("position", "relative");
		var el = stage;
		var shakeTimer;
		var movement = 12;
		var iFunc = function(){
			if(movement > 0) {
				var pos = el.position();
				if(Math.random() > 0.5){
					el.css('top', pos['top'] + Math.random() * movement < movement/2 ? (Math.random() * movement * (-1)) : Math.random() * movement);
				} else {
					el.css('left', pos['left'] + Math.random() * movement< movement/2 ? (Math.random() * movement * (-1)) : Math.random() * movement);
				}
				movement -= .2;
			}else{
				clearInterval(shakeTimer);
				stage.css({
					"left" : "0",
					"top" : "0"
				});

			}
		}
		shakeTimer = setInterval(iFunc, 20);
	}



	// Interactive Stomper Object
	function stomper(obj, stage, sounds) {
		this.obj = obj;
		this.clicker = this.obj.append('<div class="clicker" />');
		this.stage = stage;
		this.restartTimer;
		this.sounds = sounds;
	}


	stomper.prototype = {

		activate: function(){
			this.enableClick();
		},
		enableClick : function(){
			var me = this;
			me.clicker.bind('click', function(){
				me.disableClick(); // disable Click until ready again
				me.animate();
			});
		},
		disableClick : function(){
			this.clicker.unbind('click');
		},
		animate: function(){
			var me = this;
			clearTimeout(me.restartTimer);
			var myHeight = me.obj.height();
			var jumpHeight = myHeight * 1.5;
			var frames = 28;
			var flipAnimation = { steps: 17, from: -1.3, to: 63.4 }
			var crashAnimation = {  steps: 10, from: 63.4, to: 101.4 }
			
			/* Wouldnt work in Safari for Win or some mobile browsers
			me.obj.css({
				"animation-play-state" : "running",
				"-webkit-animation-play-state" : "running"
			}); 
			*/
			
			if(me.sounds){
				window._AVManager.playAudio(me.sounds.jump);
			}
			var flipPos = flipAnimation.from;
			var flipIncrement = (flipAnimation.to - flipAnimation.from) / flipAnimation.steps;
			var jumpIncrement = 30; // %
			var jumpDist = me.obj.height()*1.5;
			var jumpTime = 200; 
			var jumpAnimSpeed = jumpTime / (jumpDist / jumpIncrement);
			var bottomPos = parseInt(me.obj.css("bottom"));
			var jumpPos = bottomPos;
			var crashPos = crashAnimation.from;
			var crashIncrement = (crashAnimation.to - crashAnimation.from) / crashAnimation.steps;
			var crashBottomAdj = { start: 15, end: -10 }
			var crashBottom = -10;
			

			// jump
			var jumpLoop = setInterval(function(){
				jumpPos += jumpIncrement; 
				if(jumpPos < jumpDist+bottomPos){
					me.obj.css("bottom", jumpPos+"px");
				}else{
					clearTimeout(jumpLoop);
				}
			}, jumpAnimSpeed);
			

			//flip
			setTimeout(function(){
				var flipLoop = setInterval(function(){
					me.obj.css("background-position", flipPos+"% 0");

					flipPos += flipIncrement;
					if(flipPos >= flipAnimation.to){
						clearTimeout(flipLoop);
					}
				}, 500 / flipAnimation.steps);
			},200);

			//fall
			setTimeout(function(){
				var fallLoop = setInterval(function(){
					jumpPos -= jumpIncrement; 
					if(jumpPos >= bottomPos){
						me.obj.css("bottom", jumpPos+"px");
					}else{
						clearTimeout(fallLoop);
						me.obj.css("bottom", "");
					}
				}, jumpAnimSpeed);
			},700);

			
			//crash
			setTimeout(function(){
				var crashLoop = setInterval(function(){ 

					var pos = crashPos+"% "+crashBottom+"px";
					me.obj.css("background-position", pos);

					crashPos += crashIncrement;
					crashBottom += .2;
					if(crashPos > crashAnimation.to){
						
						clearTimeout(crashLoop);
						
						me.obj.css({
							"background-position" : crashAnimation.to+"% 0px",
							"bottom" : ""
						});	
					}
				}, 100);
			},900);

			setTimeout(function(){
				if(me.sounds){
					window._AVManager.playAudio(me.sounds.crash);//(id:String, rewind:Boolean, loop:Boolean, onComplete:Function):void
				}
				shakeScene();
			},1000);

			me.restartTimer = setTimeout(function(){
				me.reset();
			},2000);
		},
		reset: function(){
			var me = this;
			me.obj.css({
				"animation-play-state" : "paused",
				"-webkit-animation-play-state" : "paused"
			});
			var elm = me.obj[0];
			var newOne = elm.cloneNode(true);
			elm.parentNode.replaceChild(newOne, elm);
			me.obj = $(newOne);
			me.clicker = me.obj.find('.clicker:first');
			me.enableClick();
		},
		tearDown : function(){
			this.disableClick();
			this.obj.css({
				"animation-play-state" : "paused",
				"-webkit-animation-play-state" : "paused"
			});
		}

	}
	// initialize the page so it can slide in
	function init() {
		hideRefreshButton();
		
		stage = $('#super-mario-bros-Wii-WiiU > .main-stage').html('');
		// add characters
		var mario = $('<div class="character mario"></div>').appendTo(stage);
		var luigi = $('<div class="character luigi"></div>').appendTo(stage);
		var toadBlue = $('<div class="character toad-blue"></div>').appendTo(stage);
		var toadYellow = $('<div class="character toad-yellow shake"></div>').appendTo(stage);

        // Initialize the animated sprites	

		// Audio
		if(!window._AVManager.isMuted){
			createAudio();
		}

		characters[0] = new stomper( mario, stage, sounds);
		characters[1] = new stomper( luigi, stage, sounds );
		characters[2] = new stomper( toadBlue, stage, sounds );
		characters[3] = new stomper( toadYellow, stage, sounds );
	}

	// start the page's animations, event handling, etc
	function ready() {
		// activate each character
		for(i=0;i<characters.length;i++){
			characters[i].activate();
		}
	
	}

	// stop the page, freeze the display, remove event handlers, etc
	function teardown() {
		// activate each character
		for(i=0;i<characters.length;i++){
			characters[i].tearDown();
		}

		if(sounds) window._AVManager.removeAudios(sounds);
		sounds = null;
	}
	
	function unmute(){
		if(!sounds){
			createAudio();
		}
	}
	
	function createAudio(){
		var audioExt = '.mp3';
		var isFirefox = typeof InstallTrigger !== 'undefined';
		if(isFirefox){
			audioExt = '.ogg';
		}
		jumpAudio = new Audio('/audio/modern-era/super-mario-bros-Wii&WiiU/nsmbwiiGroundPound1'+audioExt);
		crashAudio = new Audio('/audio/modern-era/super-mario-bros-Wii&WiiU/nsmbwiiGroundPound2'+audioExt);
		themeAudio = new Audio('/audio/modern-era/super-mario-bros-Wii&WiiU/theme'+audioExt);
		sounds = {
			jump : jumpAudio,
			crash : crashAudio,
			theme : themeAudio
		}
		var soundsArray = [];
		for(var i in sounds){
			soundsArray.push(sounds[i]);
		}
		window._AVManager.addAudios(soundsArray, true, function(){
			log('SMB Wii audio loaded.');
			if(!sounds) return;
			window._AVManager.playAudio(sounds.theme, true, true);//(audio:HTMLAudioElement, rewind:Boolean, loop:Boolean, onComplete:Function):void
			for(var i in characters){
				characters[i].sounds = sounds;
			}
		});
	}

	Pages.page_scripts["/modern-era/super-mario-bros-Wii&WiiU"] = {
		init: init,
		ready: ready,
		teardown: teardown,
		unmute: unmute
	};

})(window,Pages);
