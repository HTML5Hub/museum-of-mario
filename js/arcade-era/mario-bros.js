var MarioBrosVC = (function(global,Pages){

	// Scene Globals
	var stage;
	var audioLoaded = false;//Boolean
	var edgeCompositionLoaded = false;//Boolean
	var playedFirstTime = false;//Boolean
	var soundTimeouts = null;//Array
	var sounds = null;//Object
	var soundsArray = null;//Array
	var checkForEdgeTimeout = null;//Timeout Number

	function setupAnimationView() {

		edgeCount++;

		var animationHTML = '<div id="animationContainer">'+
									'<style>'+
										'.edgeLoad-EDGE-1995881270-'+edgeCount+' { visibility:hidden; }'+
									'</style>'+
									'<div class="EDGE-1995881270-'+edgeCount+'">'+
									'</div>'+
									'<script type="text/javascript" charset="utf-8" src="/js/vendor/edge.js/mario-bros/Screen%2003_edgePreload.js"></script>'+
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
					}, 1000);
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






	//Initialize the page so it can slide in.
	function init() {
		showRefreshButton();
		$(window).unbind( "animationReady" );
		stage = $('#content').find('#mario-bros > .main-stage').html('');
		
		//INIT AUDIO
		var audioFolder = '/audio/arcade-era/mario-bros/';
		canPlayOGG = new Audio().canPlayType("audio/ogg")? true : false;
		canPlayMPEG = new Audio().canPlayType("audio/mpeg")? true : false;
		var extension = (canPlayMPEG)? '.mp3' : '.ogg';
		sounds = {
			coin: new Audio(audioFolder+'mba-coin'+extension),
			coin2: new Audio(audioFolder+'mb-coin'+extension),
			jump: new Audio(audioFolder+'mb-jump'+extension),
			newMario: new Audio(audioFolder+'mb-new'+extension)
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

	//Start the page's animations, event handling, etc.
	function ready() {
		setupAnimationView();
	}

	//Stop the page, freeze the display, remove event handlers, etc.
	function teardown(){
		removeEdge();
		
		//TEARDOWN AUDIO
		stopAudio();
		if(soundsArray) window._AVManager.removeAudios(soundsArray);
		sounds = null;
		soundsArray = null;
		playedFirstTime = false;
		if(checkForEdgeTimeout) clearTimeout(checkForEdgeTimeout);
	}
	
	function playAudio(){
		if(soundTimeouts){
			console.error('Error');
		}
		soundTimeouts = [];
		var coin = sounds.coin2;
		var coinDelta = 100;
		soundTimeouts.push(setTimeout(function(){
			window._AVManager.playAudio(sounds.newMario, true);
		}, 10));
		soundTimeouts.push(setTimeout(function(){
			window._AVManager.playAudio(coin, true);
		}, 2300+coinDelta));
		soundTimeouts.push(setTimeout(function(){
			window._AVManager.playAudio(sounds.jump, true);
		}, 3900));
		soundTimeouts.push(setTimeout(function(){
			window._AVManager.playAudio(sounds.jump, true);
		}, 4800));
		soundTimeouts.push(setTimeout(function(){
			window._AVManager.playAudio(coin, true);
		}, 5300+coinDelta));
		soundTimeouts.push(setTimeout(function(){
			window._AVManager.playAudio(sounds.jump, true);
		}, 6600));
		soundTimeouts.push(setTimeout(function(){
			window._AVManager.playAudio(coin, true);
		}, 6800+coinDelta));
		soundTimeouts.push(setTimeout(function(){
			window._AVManager.playAudio(coin, true);
		}, 6900+coinDelta));
		soundTimeouts.push(setTimeout(function(){
			window._AVManager.playAudio(sounds.jump, true);
		}, 7400));
		soundTimeouts.push(setTimeout(function(){
			window._AVManager.playAudio(sounds.jump, true);
		}, 8400));
		soundTimeouts.push(setTimeout(function(){
			window._AVManager.playAudio(sounds.jump, true);
		}, 9300));
		soundTimeouts.push(setTimeout(function(){
			window._AVManager.playAudio(coin, true);
		}, 9800+coinDelta));
		soundTimeouts.push(setTimeout(function(){
			window._AVManager.playAudio(coin, true);
		}, 10000+coinDelta));
	}
	
	function stopAudio(){
		if(soundsArray) window._AVManager.stopAudios(soundsArray);
		for(var i in soundTimeouts){
			var soundTimeout = soundTimeouts[i];
			clearTimeout(soundTimeout);
		}
		soundTimeouts = null;
	}
	
	function playFirstTimeIfReady(){
		if(audioLoaded && edgeCompositionLoaded && !playedFirstTime){
			whenEdgeIsReady("1995881270", playFirstTime);
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

	function removeEdge() {

		if(window.AdobeEdge.getComposition){
			var comp = window.AdobeEdge.getComposition("EDGE-1995881270-"+edgeCount);
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

	function refresh(){
		var compId = "EDGE-1995881270-"+edgeCount;
		var edgeComposition = window.AdobeEdge.getComposition(compId);
		//edgeComposition.play();
		var edgeStage = edgeComposition.symbolInstances[10];
		edgeStage.seek(0);
		edgeStage.play();
		stopAudio();
		playAudio();
	}


    Pages.page_scripts["/arcade-era/mario-bros"] = {
        init: init,
        ready: ready,
        teardown: teardown,
        refresh: refresh
    };

})(window,Pages);






