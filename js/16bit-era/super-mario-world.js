// main welcome page
(function(global,Pages){
	//SETTINGS
	var config = {
		debug: true,
		logging: false
	};

	if(config.logging) log('new SuperMarioWorld()');

	//VIEW
	var view = null;
	var $view = null;
	var art = null;

	//AUDIO
	var audios = null//Array
    var courseClearAudioPrototype = null;
    var keyholeAudioPrototype = null;
	var yoshiTongueAudioPrototype = null;
    var yoshiSwallowAudioPrototype = null;

	//CONTROLLER
	var inited = false;
	var readied = false;
	var fullTeardown = true;
	var sceneScale = null;
	var locked = false;
	var currentFood = null;
	var allowPanting = true;
	var pantingTimer = null;
	var circleMaskHasBeenTransitioned = false;
	var audioLoaded = false;
	var courseClearAudioHasPlayed = false;
	
	//Initialize the page so it can slide in.
	function init() {
		if(config.logging) log('SuperMarioWorld.init()');
		showRefreshButton();
		
		//INIT VIEW
		view = document.getElementById('super-mario-world');
		$view = $(view);
		art = $view.find('.super-mario-world__art')[0];
		mainStage = $view.find('.super-mario-world__main-stage')[0];
			world = $view.find('.super-mario-world__world')[0];
				circleMask = $view.find('.super-mario-world__circle-mask')[0];
				background = $view.find('.super-mario-world__background')[0];
				landscape = $view.find('.super-mario-world__landscape')[0];
				marioAndYoshi = $view.find('.super-mario-world__mario-and-yoshi')[0];
				foodsContainer = $view.find('.super-mario-world__foods-container')[0];
					foods = $view.find('.super-mario-world__food').toArray();

		//INIT AUDIO
		courseClearAudioPrototype = $view.find('.course-clear-audio')[0];
		keyholeAudioPrototype = $view.find('.keyhole-audio')[0];
		yoshiTongueAudioPrototype = $view.find('.yoshi-tongue-audio')[0];
		yoshiSwallowAudioPrototype = $view.find('.yoshi-swallow-audio')[0];
		audios = [courseClearAudioPrototype, keyholeAudioPrototype, yoshiTongueAudioPrototype, yoshiSwallowAudioPrototype];
		window._AVManager.addAudios(audios, true, function(){
			if(!audios) return;
			log('All SMW audios are loaded.');
			audioLoaded = true;
			if(inited && !courseClearAudioHasPlayed){
				courseClearAudioHasPlayed = true;
				window._AVManager.playAudio(courseClearAudioPrototype);
			}
		});

		//INIT CONTROLLER
		sceneScale = .5;

		//SET INITIAL STATE
		positionObjectsOnLandscape();
		$(circleMask).show();
		$(world).show();//It is hidden by default, since the layout isn't completed until positionObjectsOnLandscape() has run.

		inited = true;
	}

	// start the page's animations, event handling, etc
	function ready() {
		if(config.logging) log('SuperMarioWorld.ready()');

		//INIT INTERACTION
		disableSelectionOnMobileBrowsers(art);//Prevent selection of art elements.
		//FastClick.attach(art);//Allow faster interaction on mobile. This prevents double-clicks.
		$(window).bind('resize', onResize);
		$(marioAndYoshi).bind('click', marioAndYoshi__onClick);
		$(marioAndYoshi).bind('mouseover', circleMask__hoverEffect__over);
		$(marioAndYoshi).bind('mouseout', circleMask__hoverEffect__out);
		$(foods).bind('click', foods__onClick);

		//SET INITIAL STATE
		showFood(foods[0]);//Show the first food, so Yoshi can eat it.
		waitForPanting();
		if(audioLoaded && !courseClearAudioHasPlayed){
			courseClearAudioHasPlayed = true;
			window._AVManager.playAudio(courseClearAudioPrototype);
		}

		readied = true;
	}

	// stop the page, freeze the display, remove event handlers, etc
	function teardown() {
		if(config.logging) log('SuperMarioWorld.teardown()');

		//TEARDOWN INTERACTION
		$(window).unbind('resize', onResize);
		$(marioAndYoshi).unbind('click', marioAndYoshi__onClick);
		$(marioAndYoshi).unbind('mouseover', circleMask__hoverEffect__over);
		$(marioAndYoshi).unbind('mouseout', circleMask__hoverEffect__out);
		$(foods).unbind('click', foods__onClick);

		//TEARDOWN AUDIO
		if(audios) window._AVManager.removeAudios(audios);
		audios = null;

		//TEARDOWN VIEW
		if(fullTeardown){
			view.id = view.id+'__old';//Change the old view's id, so it can't accidentally be found by the new ViewController.
		}
		view = null;
		$view = null;
		art = null;
			mainStage = null;

		//TEARDOWN CONTROLLER
		inited = false;
		readied = false;
		sceneScale = null;
		locked = false;
		currentFood = null;
		allowPanting = true;
		audioLoaded = false;
		courseClearAudioHasPlayed = false;
		
		clearTimeout(pantingTimer);
		pantingTimer = null;
		circleMaskHasBeenTransitioned = false;
	}

	Pages.page_scripts["/16bit-era/super-mario-world"] = {
		init: init,
		ready: ready,
		teardown: teardown,
		refresh: refresh
	};
	
	function refresh(){
		fullTeardown = false;//Prevent the view's id from changing.
		teardown();
		fullTeardown = true;
		init();
		ready();
	}

	function onResize(event){
		positionObjectsOnLandscape();
		centerWorldWithinWindow();
	}

	function marioAndYoshi__onClick(){
		if(locked) return;
		if(!circleMaskHasBeenTransitioned){
			transitionCircleMaskIn();
		}else{
			marioAndYoshi__eatStuff();
		}
	}

	function foods__onClick(){
		if(locked) return;
		marioAndYoshi__eatStuff();
	}

	function marioAndYoshi__eatStuff(){
		locked = true;

		window._AVManager.playAudio(yoshiTongueAudioPrototype);//(id:String, rewind:Boolean, loop:Boolean, onComplete:Function):void

		allowPanting = false;

		var fps = 28;
		var currentFrame = 0;
		var numberOfFrames = 15;
		var frameWhereTheFoodStartsToMove = 5;
		var frameWhereTheFoodDisappears = 10;
		var spacingBetweenFrames = 500 * sceneScale;//The number of pixels between the images in the mario-and-yoshi.png sprite.

		//Find the thing that Yoshi is going to eat.
		var foodToEat = null;
		for(var i in foods){
			var food = foods[i];
			if($(food).is(":visible")){
				foodToEat = food;
				break;
			}
		}

		//Start animation.
		goToNextFrame();

		//Show the next food after a moment.
		setTimeout(function(){
			var nextFood = getNextFood();
			showFood(nextFood);
			locked = false;
		}, 700);

		function goToNextFrame(){
			currentFrame++;
			if(currentFrame > numberOfFrames){
				currentFrame = 0;
			}
			var backgroundXOffset = 0 - currentFrame * spacingBetweenFrames;
			$(marioAndYoshi).css({
				backgroundPosition:backgroundXOffset+'px 0'
			});
			if(currentFrame == 0){
				waitForPanting();
				return;//Quit the animation after one loop.
			}else if(currentFrame >= frameWhereTheFoodStartsToMove){//At this frame, move the foodToEat to Yoshi's mouth.
				var xPos = xPositionsOfFood_byFrameOfAnimation = {
					5:0,
					6:-25,
					7:-36,
					8:-72,
					9:-94
				}
				var newX = xPos[currentFrame];
				if(newX != null){
					$(foodToEat).css({left: newX});
				}
			}
			if(currentFrame == frameWhereTheFoodDisappears){
				$(foodToEat).hide().css({left:0});
				window._AVManager.playAudio(yoshiSwallowAudioPrototype);//(id:String, rewind:Boolean, loop:Boolean, onComplete:Function):void
			}
			setTimeout(function(){
				goToNextFrame();
			}, 1000/fps);
		}
	}

	function waitForPanting(){
		//log('waitForPanting()');
		allowPanting = true;
		if(pantingTimer){
			clearTimeout(pantingTimer);//Prevent duplicate timers, by cancelling the old one.
		}
		pantingTimer = setTimeout(function(){
			clearTimeout(pantingTimer)
			pantingTimer = null;
			if(allowPanting){
				marioAndYoshi__pant();
				waitForPanting();
			}
		}, 5000);
	}

	function marioAndYoshi__pant(){
		//log('marioAndYoshi__pant()');
		var fps = 4;
		var currentFrame = 0;
		var numberOfFrames = 2;
		var spacingBetweenFrames = 500 * sceneScale;//The number of pixels between the images in the mario-and-yoshi.png sprite.
		goToNextFrame();
		function goToNextFrame(){
			currentFrame++;
			if(currentFrame > numberOfFrames){
				currentFrame = 0;
			}
			var backgroundXOffset = 0 - currentFrame * spacingBetweenFrames;
			$(marioAndYoshi).css({
				backgroundPosition:backgroundXOffset+'px '+eval(-300/2)+'px'
			});
			if(currentFrame == 0){
				return;//Quit the animation after one loop.
			}
			setTimeout(function(){
				goToNextFrame();
			}, 1000/fps);
		}
	}

	function positionObjectsOnLandscape(){
		//Position landscape at bottom.
		var shortBrowserYAdjustment = (window.innerHeight - 700)/2;
		if(shortBrowserYAdjustment > 0) shortBrowserYAdjustment = 0;
		var landscapeY = window.innerHeight - $(landscape).height() - shortBrowserYAdjustment;
		if(window.innerWidth < 770){
			landscapeY -= 100;
		}
		$(landscape).css({top:landscapeY});

		var landscapeSurfaceY = landscapeY + $(landscape).height() - 488 * sceneScale;
		var newY = landscapeSurfaceY - $(marioAndYoshi).height();
		$(marioAndYoshi).css({top:newY, left:400});
		var objectsNewY = landscapeSurfaceY - 35;
		$(foodsContainer).css({top:objectsNewY});

		placeCircleMask();
	}

	function centerWorldWithinWindow(){
		//var centerOfWorld =
	}

	function showFood(food){//(div.__food):void
		currentFood = food;
		$(foods).hide();
		$(currentFood).css({left:0}).fadeIn();
	}

	function getNextFood(){//(void):div.__food
		var currentIndex = null;
		for(var i in foods){
			var food = foods[i];
			if(food == currentFood){
				currentIndex = i;
				break;
			}
		}
		var nextIndex = null;
		if(currentIndex == foods.length-1){
			nextIndex = 0;
		}else{
			nextIndex = eval(currentIndex) + 1;
		}
		var nextFood = foods[nextIndex];
		if(!nextFood) console.error('No food found.');
		return nextFood;
	}

	var maskSize = 2560;
	var maskHoleSize = 180;
	var maxScaleToCoverWindow = (2560/maskSize) * 1.3;//27" display resolution, plus a little bit extra.
	function placeCircleMask(){
		var marioXInWorld = eval(marioAndYoshi.style.left.substring(0, marioAndYoshi.style.left.length-2))
		var marioYInWorld = eval(marioAndYoshi.style.top.substring(0, marioAndYoshi.style.top.length-2));
		//var maxScaleToCoverWindow = (window.innerWidth / maskSize) * 1.3;//*1.5 to make extra sure
		$(circleMask).css({
			left: marioXInWorld - maskSize/2 + 46,
			top: marioYInWorld - maskSize/2 + 53,
			scale: maxScaleToCoverWindow
		});
	}

	var easing = 'easeInOutQuart';
	var duration = 500;
	function circleMask__hoverEffect__over(){
		$(circleMask).transition({
			scale: maxScaleToCoverWindow * 1.1,
			duration: duration,
			easing: easing,
			//queue:false
		});
	}
	function circleMask__hoverEffect__out(){
		$(circleMask).transition({
			scale: maxScaleToCoverWindow,
			duration: duration,
			easing: easing,
			//queue:false
		});
	}

	function transitionCircleMaskIn(){
		locked = true;
		circleMaskHasBeenTransitioned = true;
		window._AVManager.playAudio(keyholeAudioPrototype);//(id:String, rewind:Boolean, loop:Boolean, onComplete:Function):void
		$(marioAndYoshi).unbind('mouseover', circleMask__hoverEffect__over);
		$(marioAndYoshi).unbind('mouseout', circleMask__hoverEffect__out);
		var maxScaleForHoleToCoverWindow = (2560/maskHoleSize) * 1.2;//27" display resolution...
		$(circleMask).transition({
			//left: marioXInWorld - maskSize/2 + 38,
			//top: marioYInWorld - maskSize/2 + 29,
			scale: maxScaleForHoleToCoverWindow,
			duration: 1500,
			easing: 'easeInQuad',
			complete: function(){
				$(circleMask).hide();
				locked = false;
			}
		});
	}

})(window,Pages);




