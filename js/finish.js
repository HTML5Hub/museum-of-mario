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
									'.edgeLoad-EDGE-1693577303-'+edgeCount+' { visibility:hidden; }'+
								'</style>'+
								'<div class="EDGE-1693577303-'+edgeCount+'"></div>'+
								'<script type="text/javascript" charset="utf-8" src="/js/vendor/edge.js/finish/screen_17_edgePreload.js"></script>'+
						'</div>';

		stage.html( animationHTML );
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
		$(document.body).addClass('finish');

		$(window).unbind( "animationReady" );
		stage = $('#content').find('#final-screen > .main-stage').html('');
		
		//INIT AUDIO
		var audioFolder = '/audio/finish/';
		canPlayOGG = new Audio().canPlayType("audio/ogg")? true : false;
		canPlayMPEG = new Audio().canPlayType("audio/mpeg")? true : false;
		var extension = (canPlayMPEG)? '.mp3' : '.ogg';
		sounds = {
			jumpSuper: new Audio(audioFolder+'smb_jump-super'+extension),
			flagpole: new Audio(audioFolder+'smb_flagpole'+extension),
			stageClear: new Audio(audioFolder+'smb_stage_clear'+extension),
			fireworks: new Audio(audioFolder+'smb_fireworks'+extension),
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
		});
	}

	// start the page's animations, event handling, etc
	function ready() {
		setupAnimationView();
		bindTwitterToggle();
	}

	// stop the page, freeze the display, remove event handlers, etc
	function teardown() {
		$(document.body).removeClass('finish');
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
		if(soundsArray) window._AVManager.stopAudios(soundsArray);
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
		soundTimeouts = [];
		soundTimeouts.push(setTimeout(function(){
			window._AVManager.playAudio(sounds.jumpSuper, true);
		}, 1));
		soundTimeouts.push(setTimeout(function(){
			window._AVManager.playAudio(sounds.flagpole, true);
		}, 300));
		soundTimeouts.push(setTimeout(function(){
			window._AVManager.playAudio(sounds.stageClear, true);
		}, 1800));
		
		soundTimeouts.push(setTimeout(function(){
			window._AVManager.playAudio(sounds.fireworks, true);
		}, 5000));
		soundTimeouts.push(setTimeout(function(){
			window._AVManager.playAudio(sounds.fireworks, true);
		}, 5500));
		soundTimeouts.push(setTimeout(function(){
			window._AVManager.playAudio(sounds.fireworks, true);
		}, 6000));
	}

	function removeEdge() {
		if(window.AdobeEdge.getComposition){
			var comp = window.AdobeEdge.getComposition("EDGE-1693577303-"+edgeCount);
			if(comp){
				var symbols = comp.symbolInstances;
				for(i=0;i<symbols.length;i++){
					symbols[i].stop();
				}
			}
		}
		jQuery.Edge = undefined;
		window.AdobeEdge = undefined;
		AdobeEdge = undefined;
	}
	
	function playFirstTimeIfReady(){
		if(audioLoaded && edgeCompositionLoaded && !playedFirstTime){
			whenEdgeIsReady("1693577303", playFirstTime);
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
		var compId = "EDGE-1693577303-"+edgeCount;
		var edgeComposition = window.AdobeEdge.getComposition(compId);
		//edgeComposition.play();
		var edgeStage = edgeComposition.symbolInstances[3];
		if(!edgeStage){
			console.error('Edge not loaded.');
		}
		if(!edgeStage.seek){
			console.error('Edge.seek() not available.');
		}
		if(!edgeStage.play){
			console.error('Edge.seek() not available.');
		}
		edgeStage.seek(0);
		edgeStage.play();
		stopAudio();
		playAudio();
	}

	Pages.page_scripts["/finish"] = {
		init: init,
		ready: ready,
		teardown: teardown,
		refresh: refresh
	};

})(window,Pages);
