var SuperMarioBros2VC = (function(global,Pages){

	//SETTINGS
	var config = {
	    debug: true,
	    logging: false
	};

	if(config.logging) log('new SuperMarioBros2VC()');

	//VIEW
	var view = null;
	var $view = null;
	var art = null;
		var selectAPlayerArea = null;
			var players = null;
			var arrow = null;
	var playerBios = null;
    var playerBioModal = null;

    //AUDIO
    var cherryAudioPrototype = null;
    var bonusChanceStartAudioPrototype = null;
    var bonusChanceLoseAudioPrototype = null;
	var audios = null;//Array
	var locked = null;

	//CONTROLLER
    var shownPlayer = null;

	//Initialize the page so it can slide in.
	function init() {
		if(config.logging) log('SuperMarioBros2VC.init()');

        //VIEW
        view = document.getElementById('super-mario-bros-2');
        $view = $(view);
        art = $view.find('.super-mario-bros-2__art')[0];
            selectAPlayerArea = $view.find('.select-a-player-area')[0];
                players = $view.find('.player').toArray();
                arrow = $view.find('.arrow')[0];
        playerBios = $view.find('.player-bio').toArray();
        playerBioModal = $view.find('.player-bio-modal')[0];

        //AUDIO
        cherryAudioPrototype = $view.find('.cherry-audio')[0];
        bonusChanceStartAudioPrototype = $view.find('.bonus-chance-start-audio')[0];
        bonusChanceLoseAudioPrototype = $view.find('.bonus-chance-lose-audio')[0];
		audios = [cherryAudioPrototype, bonusChanceStartAudioPrototype, bonusChanceLoseAudioPrototype];
		window._AVManager.addAudios(audios, true, function(){
			log('All SMB2 audios are loaded.');
		});
		
		//CONTROLLER
		hideRefreshButton();
	}

	//Start the page's animations, event handling, etc.
	function ready() {
		if(config.logging) log('SuperMarioBros2VC.ready()');

		//INIT INTERACTIVITY
        disableSelectionOnMobileBrowsers(art);//Prevent selection of art elements.
        //FastClick.attach(art);//Allow faster interaction on mobile. This prevents double-clicks.
        $(players).bind('mouseover', function(event){
            var player = event.currentTarget;
            var x = player.offsetLeft + $(player).width()/2 - $(arrow).width()/2;
            var sceneScale = (window.innerWidth <= 768)? 0.5 : 1;
            var y = player.offsetTop - 30 - 30*sceneScale;
            $(arrow).show().css({x:x, y:y});

            window._AVManager.playAudio(cherryAudioPrototype);//(id:String, rewind:Boolean, loop:Boolean, onComplete:Function):void
        });
        $(players).bind('mouseout', function(event){
            var player = event.currentTarget;
            $(arrow).hide();
        });
        $(players).bind('click', function(event){
            if(locked) return;
			var playerName = event.currentTarget.attributes['data-name'].value;
            showPlayerBio(playerName);
            event.stopPropagation();//Prevents events from being captured on the whole view that might close the bio.
        });
        $view.bind('click', function(event){
            if(locked) return;
			if(shownPlayer){
                hidePlayerBio();
            }
        });
        inited = true;
	}

	//Stop the page, freeze the display, remove event handlers, etc.
	function teardown(){
		if(config.logging) log('SuperMarioBros2VC.teardown()');

		//PLAYERS
		$(players).unbind('click mouseout mouseover');

        //VIEW
        view = null;
        $view = null;
        art = null;
            selectAPlayerArea = null;
                players = null;
                arrow = null;
        playerBios = null;
        playerBioModal = null;

        //AUDIO
		if(audios) window._AVManager.removeAudios(audios);
        cherryAudioPrototype = null;
        bonusChanceStartAudioPrototype = null;
        bonusChanceLoseAudioPrototype = null;
		audios = null;

		//CONTROLLER
        shownPlayer = null;
		locked = null;
	}

	function showPlayerBio(playerName){//(string):void
		var _ = this;
		if(config.logging) log('SuperMarioBros2VC.showPlayerBio(playerName:'+playerName+')');
		if(!window._AVManager.isMuted) locked = true;
		$(art).css('cursor', 'pointer');//Let the user know that they can click anywhere to close the panel.
		setTimeout(function(){
			locked = false;
		}, 1200);
		shownPlayer = playerName;

	    //Hide the selectAPlayerArea
	    $(selectAPlayerArea).hide();

		//Show the player-bio panel.
		$(playerBioModal).show();
		window._AVManager.playAudio(bonusChanceStartAudioPrototype);//(id:String, rewind:Boolean, loop:Boolean, onComplete:Function):void

		//Show the specific player bio and hide the others.
		for(var i in playerBios){
			var playerBio = playerBios[i];
			if(playerBio.attributes['data-name'].value == playerName){
				$(playerBio).show();
			}else{
				$(playerBio).hide();
			}
		}
	}

	function hidePlayerBio(){//(void):void
		if(config.logging) log('SuperMarioBros2VC.hidePlayerBio()');
		if(!window._AVManager.isMuted) locked = true;
		setTimeout(function(){
			locked = false;
		}, 1200);
		$(art).css('cursor', 'default');//Let the user know that they can click anywhere to close the panel.
		shownPlayer = null;

		//Hide the player-bio panel.
		$(playerBioModal).hide();

		//Show the selectAPlayerArea
	    $(selectAPlayerArea).show();

		window._AVManager.playAudio(bonusChanceLoseAudioPrototype);//(id:String, rewind:Boolean, loop:Boolean, onComplete:Function):void
	}


    Pages.page_scripts["/8bit-era/super-mario-bros-2"] = {
        init: init,
        ready: ready,
        teardown: teardown
    };

})(window,Pages);






