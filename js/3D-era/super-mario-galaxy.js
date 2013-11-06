// main welcome page
(function(global,Pages){
	
	var bgMusic = null;
	
	// initialize the page so it can slide in
	function init() {
		console.log("super-mario-galaxy page init");
		hideRefreshButton();
		
		
	}

	// start the page's animations, event handling, etc
	function ready() {
		// TODO: start the page
		$('#content #galaxy-scene').parallax().find('div').addClass('animated');
		
		// Music
        if(!window._AVManager.isMuted){
			createAudio();
		}
		
	}	

	// stop the page, freeze the display, remove event handlers, etc
	function teardown() {
		// TODO: stop the page
		console.log("super-mario-galaxy page teardown");

		$('#content #galaxy-scene').parallax('disable').find('div').removeClass('animated');
	
		if(bgMusic) window._AVManager.removeAudio(bgMusic);
		bgMusic = null;
	}
	
	function unmute(){
		if(!bgMusic){
			createAudio();
		}
	}
	
	function createAudio(){
		var audioFolder = '/audio/3D-era/super-mario-galaxy/';
        var audioFile = 'galaxy.mp3';
        var isFirefox = typeof InstallTrigger !== 'undefined';
        if(isFirefox){
            audioFile = 'galaxy.ogg';
        }
        bgMusic = new Audio(audioFolder+audioFile);
        window._AVManager.addAudio(bgMusic, true, function(){
            if(!bgMusic) return;
            window._AVManager.playAudio(bgMusic, true, true);
        });
	}

	Pages.page_scripts["/3D-era/super-mario-galaxy"] = {
		init: init,
		ready: ready,
		teardown: teardown,
		unmute: unmute
	};

})(window,Pages);
