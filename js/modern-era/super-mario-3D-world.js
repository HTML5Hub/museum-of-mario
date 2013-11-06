// main welcome page
(function(global,Pages){

	var stageParts = {};
	var orbs = [];
	var orbImages = [
		"/images/modern-era/super-mario-3D-world/orb1.png",
		"/images/modern-era/super-mario-3D-world/orb4.png",
		"/images/modern-era/super-mario-3D-world/orb5.png",
		"/images/modern-era/super-mario-3D-world/orb6.png",
		"/images/modern-era/super-mario-3D-world/orb7.png",
		"/images/modern-era/super-mario-3D-world/orb8.png",
		"/images/modern-era/super-mario-3D-world/orb9.png",
		"/images/modern-era/super-mario-3D-world/orb10.png"
	];

	// for preloading	 and checking when ready
	var stageAssets = [
		"/images/modern-era/super-mario-3D-world/mario.png",
		"/images/modern-era/super-mario-3D-world/ball.png",
		"/images/modern-era/super-mario-3D-world/background.jpg"
	];

	var loadedAssets= 0;
	var assetsLoaded = false;
	var pageReady = false;
	
	
	//Audio
	var sounds = null;//Object
	var soundsArray = null;//Array
	var allowMouseSounds = true;//Boolean
	
	function createInitialOrbs(){
		setTimeout(function(){ 
			createOrbs(); 
		}, 500);
	}

	function assetloadpost(){
        loadedAssets++
        if (loadedAssets==orbImages.length+stageAssets.length){
			assetsLoaded = true;
			if(pageReady){
				createInitialOrbs();
			}
        }
    }

	function preloadAndCheck() {
		$(orbImages).add(stageAssets).each(function(){
			var img = $('<img/>')[0];
			img.src = this;
			 img.onload=function(){
				assetloadpost();
			}
			img.onerror=function(){
				assetloadpost();
			}

		});
	}

	function animatedOrb(image, container) {
		this.$obj;
		this.image = image;
		this.startBottom = "0";
		this.startLeft = "30%";
		this.container = container;
		this.create();
	}

	animatedOrb.prototype = {

		create : function (){
			var me = this;
			var speed = .4 + Math.random();
			var duration = speed + Math.random(); // total opacity duration
			var delay = Math.random() * 0.5;
			var delayL = 0;
			var delayB = 0;
			if(Math.random() >= 0.5){
				delayL = delay;
			}else{
				delayB = delay
			}
			this.$obj = $('<img src='+me.image+' />')
			.addClass('orb')
			.css({
				"transition-property" : "left, bottom, opacity, height",
				"transition-duration" : speed+"s, "+speed+"s, .5s, "+speed+"s",
				"transition-timing-function" : "ease-out, ease-out, ease, ease-out",
				"transition-delay" : delayL+"s, "+delayB+"s, "+duration+"s, .4s",
				"z-index" : Math.round(Math.random()*10)
			})
			.appendTo(me.container);
			setTimeout(function(){
				me.animate();
			}, 10);
		},
		animate : function(){
			var me = this;
			var left = Math.random()*70+"%"; // range 0 - 70%
			var bottom = Math.random()*70+30+"%"; // range 30% - 100%
			me.$obj.css({
				"height" : "16%",
				"left" : left,
				"bottom" : bottom,
				"opacity" : "0"
			});
			me.deleteThis();
		},
		deleteThis : function(){
			// need to delete this instance
			var me = this;
			// self destruct after 2 seconds...
			setTimeout(function(){
				me.$obj.remove();
				delete me;
				me = null;
			}, 2000);

		}

	}

	function createOrbs(){
		for(i=0;i<20;i++){
			var random = Math.floor(Math.random()*(orbImages.length));
			var orb = new animatedOrb( orbImages[random], stageParts.scene );
		}
	}

	function init() {
		hideRefreshButton();
		stageParts = {};
		stageParts.stage = $('#content #super-mario-3D-world > .main-stage');
		stageParts.scene = stageParts.stage.children('.scene:first');
		stageParts.background = stageParts.stage.children('.background:first');
		stageParts.parallaxLayers = stageParts.scene.children();
		preloadAndCheck();
		
		
		//INIT AUDIO
		if(!window._AVManager.isMuted){
			createAudio();
		}
	}

	// start the page's animations, event handling, etc
	function ready() {
		stageParts.stage.unbind('click');

		stageParts.scene.add(stageParts.background).parallax({
			calibrateX: false,
			calibrateY: true,
			invertX: true,
			invertY: true,
			limitX: 200,
			limitY: 0,
			scalarX: 20,
			scalarY: 10,
			frictionX: 0.5,
			frictionY: 0.2
		});

		stageParts.stage.bind('click', function(){
			createOrbs();
			if(allowMouseSounds && sounds){
				allowMouseSounds = false;
				window._AVManager.playAudio(sounds.meow, true);
				setTimeout(function(){
					allowMouseSounds = true;
				}, 5000);
			}
		});
		pageReady = true;
		if(assetsLoaded){
			createInitialOrbs();
		}

	}

	// stop the page, freeze the display, remove event handlers, etc
	function teardown() {
		pageReady = false;
		stageParts.stage.unbind('click');
		stageParts.scene.add(stageParts.background).parallax('disable');
		
		if(sounds) window._AVManager.removeAudios(sounds);
		sounds = null;
	}
	
	function unmute(){
		if(!sounds){
			createAudio();
		}
	}
	
	function createAudio(){
		var audioFolder = '/audio/modern-era/super-mario-3D-world/';
		canPlayOGG = new Audio().canPlayType("audio/ogg")? true : false;
		canPlayMPEG = new Audio().canPlayType("audio/mpeg")? true : false;
		var extension = (canPlayMPEG)? '.mp3' : '.ogg';
		sounds = {
			meow: new Audio(audioFolder+'sm3d_meow'+extension),
			theme: new Audio(audioFolder+'smb3d_main_theme_cut'+extension)
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

	Pages.page_scripts["/modern-era/super-mario-3D-world"] = {
		init: init,
		ready: ready,
		teardown: teardown,
		unmute: unmute
	};

})(window,Pages);
