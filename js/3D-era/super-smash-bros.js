// main welcome page
(function(global,Pages){

	// stage Global variables
	var stage, scene, mario, luigi;
	
	//Audio
	var sounds = null;//Object
	var soundsArray = null;//Array
	
	function init() {
		hideRefreshButton();
		$(document.body).addClass('super-smash-bros');

		stage = $('#super-smash-bros .main-stage');
		scene = stage.find('#smash-scene');
		mario = stage.find('#smash-mario');
		luigi = stage.find('#smash-luigi');
		
		//INIT AUDIO
		if(!window._AVManager.isMuted){
			createAudio();
		}
	}


	function ready() {

		scene.parallax();
		
		mario.add(luigi).addClass('animated');
		
	}

	function teardown() {

		$(document.body).removeClass('super-smash-bros');

		scene.parallax('disable');
		
		mario.add(luigi).removeClass('animated');
		
		//TEARDOWN AUDIO
		if(soundsArray){
			window._AVManager.stopAudios(soundsArray);
			window._AVManager.removeAudios(soundsArray);
		}
		sounds = null;
		soundsArray = null;
	}
	
	function unmute(){
		if(!sounds){
			createAudio();
		}
	}
	
	function createAudio(){
		var audioFolder = '/audio/3D-era/super-smash-bros/';
		canPlayOGG = new Audio().canPlayType("audio/ogg")? true : false;
		canPlayMPEG = new Audio().canPlayType("audio/mpeg")? true : false;
		var extension = (canPlayMPEG)? '.mp3' : '.ogg';
		sounds = {
			theme: new Audio(audioFolder+'ssbm_opening_theme'+extension)
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

	Pages.page_scripts["/3D-era/super-smash-bros"] = {
		init: init,
		ready: ready,
		teardown: teardown,
		unmute: unmute
	};

})(window,Pages);
