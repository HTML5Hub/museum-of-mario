// main welcome page
(function(global,Pages){

	// Scene Globals
	var stage;
	var audioLoaded = false;//Boolean
	var edgeCompositionLoaded = false;//Boolean
	var playedFirstTime = false;//Boolean
	var soundTimeouts = null;//Array
	var sounds = null;//Object
	var soundsArray = null;//Array

	function setupAnimationView() {

		edgeCount++;

		var animationHTML = '<div id="animationContainer">'+
								'<style>'+
									'.edgeLoad-EDGE-1672177555-'+edgeCount+' { visibility:hidden; }'+
								'</style>'+
								'<div class="EDGE-1672177555-'+edgeCount+'"></div>'+
								'<script type="text/javascript" charset="utf-8" src="/js/vendor/edge.js/intro/Screen%2001-2_edgePreload.js"></script>'+
						'</div>';

		stage.html( animationHTML );

		$('#start-screen').delay(750).fadeIn('2000');
		//detect if edge is loaded yet
		var edgeDetectionFunction = function() {

			if ( AdobeEdge && AdobeEdge.compositions != undefined) {
				//put a delay here
				var hasComposition = false;

				if ( AdobeEdge.compositions ) {
					//loop to see if the composition is actually loaded
					for ( var key in AdobeEdge.compositionDefns ) {
						hasComposition = true;
						break;
					}
				}

				if ( hasComposition ) {
					setTimeout( function(){ $(window).trigger( "animationReady" ); }, 100 );
					setTimeout(function(){
						edgeCompositionLoaded = true;
						playFirstTimeIfReady();
					}, 500);
					return;
				}
			}
			else if ( AdobeEdge ) {
				window.onDocLoaded();
			}
			setTimeout( edgeDetectionFunction, 100 );
		}
		edgeDetectionFunction();
	}


	// initialize the page so it can slide in
	function init() {
		showRefreshButton();
		$(document.body).addClass('start');

		$('#contest-block').delay(1500).fadeIn('2000');

		$(window).unbind( "animationReady" );
		stage = $('#content').find('.mario-canvas').html('');
		
		//INIT AUDIO
		var audioFolder = '/audio/intro/';
		canPlayOGG = new Audio().canPlayType("audio/ogg")? true : false;
		canPlayMPEG = new Audio().canPlayType("audio/mpeg")? true : false;
		var extension = (canPlayMPEG)? '.mp3' : '.ogg';
		sounds = {
			bump: new Audio(audioFolder+'SMB-bump'+extension),
			jumpSmall: new Audio(audioFolder+'SMB-jump-small'+extension),
			jumpSuper: new Audio(audioFolder+'SMB-jump-super'+extension),
			powerup: new Audio(audioFolder+'SMB-powerup'+extension),
			stomp: new Audio(audioFolder+'SMB-stomp'+extension)
		};
		soundsArray = [];
		for(var i in sounds){
			soundsArray.push(sounds[i]);
		}
		window._AVManager.addAudios(soundsArray, true, function(){
			audioLoaded = true;
			setTimeout(function(){
				playFirstTimeIfReady();
			}, 500);
			
			//Load music seperately
			sounds.theme = new Audio(audioFolder+'SMB-Theme'+extension);
			soundsArray.push(sounds.theme);
			window._AVManager.addAudio(sounds.theme, true, function(){
				window._AVManager.playAudio(sounds.theme, true, true);//(audio:HTMLAudioElement, rewind:Boolean, loop:Boolean, onComplete:Function):void
			});
		});
	}

	// start the page's animations, event handling, etc
	function ready() {
		setupAnimationView();
		bindTwitterToggle();
	}

	// stop the page, freeze the display, remove event handlers, etc
	function teardown() {

		$(document.body).removeClass('start');

		removeEdge();
		
		playedFirstTime = false;
		audioLoaded = false;
		edgeCompositionLoaded = false;
		
		//TEARDOWN AUDIO
		stopAudio();
		if(soundsArray) window._AVManager.removeAudios(soundsArray);
		sounds = null;
		soundsArray = null;
	}
	
	function stopAudio(){
		if(soundsArray){
			var allSoundsExceptTheTheme = soundsArray.slice(0,soundsArray.length-1);
			window._AVManager.stopAudios(allSoundsExceptTheTheme);
		}
		for(var i in soundTimeouts){
			var soundTimeout = soundTimeouts[i];
			clearTimeout(soundTimeout);
		}
		soundTimeouts = null;
	}
	
	function playAudio(){
		if(soundTimeouts){
			console.error('Error');
		}
		var jumpDelta = 50;
		soundTimeouts = [];
		soundTimeouts.push(setTimeout(function(){
			window._AVManager.playAudio(sounds.jumpSmall, true);
		}, 1150-jumpDelta));
		soundTimeouts.push(setTimeout(function(){
			window._AVManager.playAudio(sounds.jumpSmall, true);
		}, 3200-jumpDelta));
		soundTimeouts.push(setTimeout(function(){
			window._AVManager.playAudio(sounds.stomp, true);
		}, 3800));
		soundTimeouts.push(setTimeout(function(){
			window._AVManager.playAudio(sounds.jumpSmall, true);
		}, 5400-jumpDelta));
		soundTimeouts.push(setTimeout(function(){
			window._AVManager.playAudio(sounds.bump, true);
		}, 5500));
		soundTimeouts.push(setTimeout(function(){
			window._AVManager.playAudio(sounds.powerup, true);
		}, 7850));
		soundTimeouts.push(setTimeout(function(){
			window._AVManager.playAudio(sounds.jumpSuper, true);
		}, 7800-jumpDelta));
	}
	
	function removeEdge() {

		if(window.AdobeEdge.getComposition){
			var comp = window.AdobeEdge.getComposition("EDGE-1672177555-"+edgeCount);
			if(comp){
				var symbols = comp.symbolInstances;
				for(i=0;i<symbols.length;i++){
					symbols[i].stop();
				}
			}
		}		

		window.AdobeEdge = undefined;
		AdobeEdge = undefined;
		jQuery.Edge = undefined;
		composition = undefined;
	}
	
	function playFirstTimeIfReady(){
		if(audioLoaded && edgeCompositionLoaded && !playedFirstTime){
			whenEdgeIsReady("1672177555", playFirstTime);
		}
		function playFirstTime(){
			playedFirstTime = true;
			setTimeout(refresh, 100);
		}
	}
	
	function whenEdgeIsReady(id, onReady){//(Function):void
		checkIfReady();
		
		function checkIfReady(){
			var itsReady = isReady();
			if(itsReady){
				onReady();
			}else{
				setTimeout(checkIfReady, 100);//Keep checking until its ready.
			}
		}
		
		function isReady(){//(void):Boolean
			if(window.AdobeEdge){
				if(window.AdobeEdge.getComposition){
					var compId = "EDGE-"+id+"-"+edgeCount;
					var edgeComposition = window.AdobeEdge.getComposition(compId);
					if(edgeComposition){
						var edgeStage = edgeComposition.symbolInstances[edgeComposition.symbolInstances.length-1];
						if(edgeStage){
							if(edgeStage.play){
								return true;
							}
						}
					}
				}
			}
			return false;
		}
	}

	function refresh() {
		console.log('refresh');
		var compId = "EDGE-1672177555-"+edgeCount;
		var edgeComposition = window.AdobeEdge.getComposition(compId);
		//edgeComposition.play();
		var edgeStage = edgeComposition.symbolInstances[5];
		edgeStage.seek(0);
		edgeStage.play();
		stopAudio();
		playAudio();
	}


	Pages.page_scripts["/index"] = {
		init: init,
		ready: ready,
		teardown: teardown,
		refresh: refresh
	};

})(window,Pages);
