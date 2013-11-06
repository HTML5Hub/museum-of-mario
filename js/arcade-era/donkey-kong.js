var DonkeyKongVC = (function(global,Pages){

	//SETTINGS
	var config = {
		debug: true,
		logging: false
	};

	if(config.logging) log('new DonkeyKongVC()');

	//VIEW
	var view = null;
	var $view = null;
	var art = null;
		var mainStage = null;
			var mainStage__inner = null;
				var flipBook = null;
				var flipBookImages = null;
				var currentFlipBookImageIndex = null;
				var scene = null;
				var renderer = null;
				var camera = null;
				var lights = null;//Array
				var cabinet = null;
				var gameVideo = null;
				var video = null;
				var sideart = null;
				var bezel = null;
				var sideCover = null;
				var sideCover2 = null;
				var videoTexture = null;
				var focalPoint = null;//Where the camera is looking. At the center of the video game screen.

	//CONTROLLER
	var inited = false;
	var readied = false;
	var cameraDoesRespondToMousePosition = false;//This is enabled after the intro animation completes.
	var mouseXPercentageFromCenter = 0;
	var mouseYPercentageFromCenter = 0;

	//Initialize the page so it can slide in.
	function init() {
		if(config.logging) log('DonkeyKongVC.init()');
		hideRefreshButton();

		//INIT VIEW
		view = document.getElementById('donkey-kong');
		$view = $(view);
		art = $view.find('.donkey-kong__art')[0];
		mainStage = $view.find('.donkey-kong__main-stage')[0];
		mainStage__inner = $view.find('.donkey-kong__main-stage__inner')[0];
		lights = [];

		//INIT CONTROLLER
		//

		inited = true;
	}

	//Start the page's animations, event handling, etc.
	function ready() {
		if(config.logging) log('DonkeyKongVC.ready()');

		//SET STATE
		if(supportsWebGL()){
			create3DScene();
			$(mainStage).addClass('mode__3D');
			$(art).addClass('hasBackgroundImage');
		}else{
			createFlipBook();
			$(mainStage).addClass('mode__2D');
			$(art).css({background:'black'});
		}

		//INIT INTERACTION
		disableSelectionOnMobileBrowsers(art);//Prevent selection of art elements.
		//FastClick.attach(art);//Allow faster interaction on mobile. This prevents double-clicks.
		$(window).bind('resize', onResize);
		$(window).bind('mousemove', onMouseMove);//Now start responding the user's cursor.

		readied = true;
	}

	//Stop the page, freeze the display, remove event handlers, etc.
	function teardown(){
		if(config.logging) log('DonkeyKongVC.teardown()');

		//TEARDOWN VIEW
		$(mainStage).removeClass('mode__3D mode__2d');
		view.id = view.id+'__old';//Change the old view's id, so it can't accidentally be found by the new ViewController.

		this.oldview = view;
		view = null;
		$view = null;
		art = null;
			mainStage = null;
				mainStage__inner = null;
					if(flipBook){
						flipBook.parentElement.removeChild(flipBook);
						flipBook = null;
						flipBookImages = null;
						currentFlipBookImageIndex = null;
					}
					scene = null;
					renderer = null;
					camera = null;
					lights = null;
					cabinet = null;
					if(gameVideo){
						window._AVManager.removeVideo(gameVideo);
						//gameVideo.pause();
						//delete(gameVideo);
						//gameVideo = null;
					}
					video = null;
					bezel = null;
					sideart = null;
					sideCover = null;
					sideCover2 = null;
					videoTexture = null;
					focalPoint = null;

		//TEARDOWN CONTROLLER
		inited = false;
		readied = false;
		mouseXPercentageFromCenter = 0;
		mouseYPercentageFromCenter = 0;
		cameraDoesRespondToMousePosition = false;

		//TEARDOWN INTERACTION
		$(window).unbind('mousemove', onMouseMove);
		$(window).unbind('resize', onResize);
	}

	function create3DScene(){
		createScene();//Defined renderer, camera, and scene.
		createLights();
		createCabinet();

		function createScene(){
			// set the scene size
			//var WIDTH = 400;
			//var HEIGHT = 300;

			// set some camera attributes
			var VIEW_ANGLE = 45;
			var aspectRatio = mainStage__inner.clientWidth/mainStage__inner.clientHeight;
			var NEAR = 0.1;
			var FAR = 10000;

			// get the DOM element to attach to
			// - assume we've got jQuery to hand
			var $container = $('#container');

			renderer = new THREE.WebGLRenderer({antialias: true});//Chrome, Firefox
			//renderer.gammaInput = true;
			//renderer.gammaOutput = true;
			//renderer.physicallyBasedShading = true;

			camera = new THREE.PerspectiveCamera(VIEW_ANGLE, aspectRatio, NEAR, FAR);

			scene = new THREE.Scene();
			scene.add(camera);//Add the camera to the scene.
			
			$(mainStage__inner).append(renderer.domElement);//Add it to the view.
			var canvas = $(mainStage__inner).find('canvas')[0];
			if(!canvas || !mainStage__inner){
				e.e;
			}
		}

		function createLights(){

			lights[0] = new THREE.PointLight(0xFFFFFF, 1.5);//Put a light on the top right.
			//light = new THREE.AmbientLight(0xFFFFFF);//Put a light on the top right.
			//light = new THREE.DirectionalLight(0xFFFFFF);//Put a light on the top right.
			lights[0].position.x = 100;
			lights[0].position.y = 100;
			lights[0].position.z = 100;
			scene.add(lights[0]);

			lights[1] = new THREE.PointLight(0xFFFFFF, 1.5);//Put a light on the top left.
			lights[1].position.x = -200;
			lights[1].position.y = 100;
			lights[1].position.z = 100;
			scene.add(lights[1]);

			/*scene.remove(light3);
			light3 = new THREE.PointLight(0xFFFFFF);
			light3.position.x = 200;
			light3.position.y = 100;
			light3.position.z = 300;
			scene.add(light3);*/
		}
		function createVideo(){
			var isChrome = (navigator.vendor.toLowerCase().indexOf('google') > -1);
			var isWindows = (navigator.platform.toLowerCase().indexOf('win') > -1);
			var usingChromeOnWindows = (isChrome && isWindows);
			if(usingChromeOnWindows == 1){
				return;
			}
			
			//CREATE VIDEO
			//http://learningthreejs.com/blog/2012/02/07/live-video-in-webgl
			gameVideo = document.createElement('video');
			
			gameVideo.autoplay = true;
			gameVideo.preload = 'none';//?
			//gameVideo.loop = true;//Does not work without <source contentType=''> attribute
			gameVideo.addEventListener('ended', gameVideo_onEnd);
			if(Modernizr.video.h264){
				//if(gameVideo.canPlayType || gameVideo.canPlayType('video/mp4')){//Use mp4 if possible, else fallback to ogv.
				gameVideo.src = '../images/arcade-era/donkey-kong/3d-model/video/donkey-kong__shortened.mp4';
			}else{
				gameVideo.src = '../images/arcade-era/donkey-kong/3d-model/video/donkey-kong__ultra-shortened.ogv';
			}
			window._AVManager.addVideo(gameVideo, function(){
				if(config.logging) log('Donkey Kong video is loaded.');
				applyVideoTexture();
			});
			
			
			videoTexture = new THREE.Texture(gameVideo);
			videoTexture.minFilter = THREE.LinearFilter;
			videoTexture.magFilter = THREE.LinearFilter;
			videoTexture.format = THREE.RGBFormat;
			videoTexture.generateMipmaps = false;
			videoTexture.flipY = true;

			var videoMaterial = new THREE.MeshLambertMaterial({
				color: 0xffffff,
				map: videoTexture
			});

			var videoWidth = 20;
			var videoAspectRatio = 226/256;//Pixel size of the video.
			
			function applyVideoTexture(){
				if(!cabinet) return;
				var videoContainer = cabinet.children[19];
				video = videoContainer.children[0];//Use a video for the game screen.
				video.material = videoMaterial;
				video.parent.add(video);//Re-add to the scene so video works. Unsure why this is neccessary.
			}
		}
		
		function gameVideo_onEnd(event){
			gameVideo.removeEventListener('ended', gameVideo_onEnd);
			window._AVManager.playVideo(gameVideo, true);//(video:HTML5VideoElement, rewind:Boolean, onComplete:Function):void
			gameVideo.addEventListener('ended', gameVideo_onEnd);
		}

		function createCabinet(){
			
			//createVideo();

			//LOAD AND CREATE CABINET
			var loader = new THREE.OBJMTLLoader();
			loader.addEventListener( 'load', function ( event ) {
				if(!scene) return;
				cabinet = event.content;
				cabinet.position.set(0, 0, 0);
				cabinet.scale.set(1, 1, 1);
				scene.add(cabinet);
				
				//Find the bezel and make it transparent.
				for(var i in cabinet.children){
					var child = cabinet.children[i];

					if(i == 5){//Prevent the side cabinet texture from repeating.
						var texture = child.children[0].material.map;
						texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;//Tell the texture to not repeat.

					}else if(i == 11){//Make the bezel transparent, so you can see the game inside.
						bezel = child.children[0];
						bezel.material.transparent = true;

					}else if(i == 13){//Make the glass reflective. This does not work, and I have not determined why.
						glass = child.children[0];
						/*glass.material = new THREE.MeshPhongMaterial( {
							color: 0xff0000,
							ambient: 0x00ff00, // should generally match color
							specular: 0x0000ff,
							shininess: 100
						});
						glass.material.transparent = true;*/

					}
				}
				
				//Move the side panel up a tiny bit so you don't see white pixels along the top from the plastic edging.
				cabinet.children[5].position.y += .1;
				
				//Wishful Todo: Add interactivity to the cabinet. :)
				//threex.domevent.js
				/*cabinet.on('click', function(){
					cabinet.position.x += 1;
				});*/

				/* CONTENTS OF cabinet.children: (Disregard the names, because they are not accurate.)
				0 (nothing in this?)
				1 black side cabinet, and bezel around the screen
				2 orange button
				3 marquee
				4 insert coin sticker
				5 side art
				6 (unknown? possibly the steel bezel)
				7 speaker mesh (not really visible)
				8 metal coinage area
				9 little rectangles on metal coinage area
				10 instructions sticker
				11 bezel (the window)
				12 controls area
				13 glass
				14 black area around the screen
				15 blue speaker front, below controls
				16 blue buttons
				17 plastic edges
				18 joystick
				19 screen
				*/

				//DEBUG: Use this to quickly find the child you want.
				/*for(var i in cabinet.children){
					if(i == 1){
						var debugChild = cabinet.children[i];
						if(debugChild.children.length){
							debugChild.children[0].material = new THREE.MeshLambertMaterial({color: 0x00ff00});
						}else{
							console.log('no material found');
						}
					}
				}
				//glass.parent.remove(glass);
				//bezel.parent.remove(bezel);
				*/

				//Create a black rectangle to cover up the interior side wall of the cabinet. It is grey and does not look realistic.
				sideCover = new THREE.Mesh(
					new THREE.PlaneGeometry(25, 30),//(w,h)
					new THREE.MeshLambertMaterial({color: 0x000000})
				);
				cabinet.children[0].add(sideCover);
				sideCover.position.set(11.5,50,-11);
				sideCover.rotation.y = -.5*Math.PI;//90 deg counter clockwise
				
				sideCover2 = new THREE.Mesh(
					new THREE.PlaneGeometry(25, 30),//(w,h)
					new THREE.MeshLambertMaterial({color: 0x000000})
				);
				cabinet.children[0].add(sideCover2);
				sideCover2.position.set(-12,50,-9);
				sideCover2.rotation.y = .5*Math.PI;//90 deg clockwise
				
				focalPoint = new THREE.Vector3(0+cabinet.position.x,55,5);//Where the camera is looking. At the center of the video game screen.
				
				apply();
				animateIn();
				setSize();
				render(true);//Start render loop, using requestAnimationFrame.
				createVideo();
			});
			loader.load(
				'../images/arcade-era/donkey-kong/3d-model/donkey-kong-cabinet.obj'//,
				//'../images/arcade-era/donkey-kong/3d-model/donkey-kong-cabinet.mtl'//Loads automatically via .obj
			);
		}
	}

	function createFlipBook(){
		cameraDoesRespondToMousePosition = true;
		flipBook = document.createElement('div');
		$(flipBook).addClass('donkey-kong__flip-book');
		mainStage__inner.appendChild(flipBook);
		flipBookImages = [];
		var useFewerFrames = false;
		var numberOfFrames = 11;
		if(useFewerFrames) numberOfFrames = Math.ceil(numberOfFrames/2);
		for(var i=0; i<numberOfFrames; i++){
			if(useFewerFrames){
				if(!isEven(i)){
					break;//Skip all odd-numbered images so there are half as many.
				}
			}
			var image = new Image();
			image.id = 'donkey-kong__flip-book__image'+i;
			$(image).addClass('donkey-kong__flip-book__image');
			image.src = '../images/arcade-era/donkey-kong/flip-book/'+i+'.jpg';
			flipBookImages.push(image);
			flipBook.appendChild(image);
		}
		
		onResize();//Set image sizes with JavaScript, so they do not get stretched. Each browser seems to have its own stretching variations, so this is a fool-proof approach.

		//Go to the first image.
		$(flipBookImages).hide();
		$(flipBookImages[0]).show();
		currentFlipBookImageIndex = 0;

		//Allow the user to change the image.
		$(flipBook).bind('click', function(event){
			var x = event.offsetX;
			var y = event.offsetY;

			//Go to the view closest image
			var currentFlipBookImage = getCurrentFlipBookImage();
			var mouseXPercentageFromLeft = x / $(flipBook).width();
			var i = Math.floor(flipBookImages.length * mouseXPercentageFromLeft);
			if(i < 0) i = 0;
			if(i > flipBookImages.length - 1){
				i = flipBookImages.length - 1;
			}
			var newFlipBookImage = flipBookImages[i];
			if(newFlipBookImage != currentFlipBookImage){
				$(flipBookImages).hide();
				$(newFlipBookImage).show();
				currentFlipBookImageIndex = i;
			}


			//Todo: Play an animation loop when the user clicks on the flipbook.
			/*cameraDoesRespondToMousePosition = false;
			var newFlipBookImage = getCurrentFlipBookImage();
			var startingFlipBookImageIndex = currentFlipBookImageIndex;
			animateToImage(newFlipBookImage);
			function animateToImage(image){
				cameraDoesRespondToMousePosition = false;//Disabled interaction.
				$(image).transition({opacity:0, duration:200, complete:function(){
					currentFlipBookImageIndex++;
					if(currentFlipBookImageIndex >= flipBookImages.length){
						currentFlipBookImageIndex = 0;
					}
					var nextImage = flipBookImages[currentFlipBookImageIndex];
					if(startingFlipBookImageIndex != currentFlipBookImageIndex){
						animateToImage(nextImage);
						cameraDoesRespondToMousePosition = true;//Re-enable interactivity.
					}
				}});
			}*/
		});
	}

	function getCurrentFlipBookImage(){
		/*for(var i in flipBookImages){
			if($(flipBookImages[i]).is(':visible')){
				currentFlipBookImageIndex = i;
				return flipBookImages[i];
			}
		}*/
		return flipBookImages[currentFlipBookImageIndex];
	}

	function isEven(value){
		if (value%2 === 0){
			return true;
		}else{
			return false;
		}
	}

	function setSize(){
		if(renderer){
			renderer.setSize(100,100);//Size down the renderer, so it doesn't stretch out its container.

			//Update the camera size.
			camera.aspect = mainStage__inner.clientWidth/mainStage__inner.clientHeight;
			//camera.aspect = window.innerWidth/mainStage__inner.clientHeight;
			camera.updateProjectionMatrix();

			//Update the renderer size.
			renderer.setSize(mainStage__inner.clientWidth, mainStage__inner.clientHeight);//Set it back to the size of its container.
			//renderer.setSize(window.innerWidth, mainStage__inner.clientHeight);
		}else if(flipBook){
			//Keep images square by setting the height of each image to match its width.
			var size = $(flipBookImages[0]).width();
			$(flipBookImages).css({height:size});
		}
		apply();
	}

	function animateIn(){
		//Fade in lights.
		for(var i in lights){
			var light = lights[i];
			tweenLight(light);//Has to be outside of the loop.
		}
		function tweenLight(light){
			var intensity = light.intensity;
			light.intensity = 0;//Set to 0, so we can fade in.

			var lightsTween = new TWEEN.Tween({intensity:0})
				.to({intensity:intensity}, 2000)
				.easing(TWEEN.Easing.Linear.None)
				.onUpdate(function(){
					light.intensity = this.intensity;
					//render();//Don't call this, because it will create a loop.
				})
				.onComplete(function(){
					//render();
				})
				.start();
		}

		//Move cabinet in from bottom.
		/*var cabinetTween = new TWEEN.Tween({y:-70})
			.to({y:0}, 3000)
			.easing(TWEEN.Easing.Quadratic.Out)
			.onUpdate(function(){
				cabinet.position.y = this.y;
				//render();//Don't call this, because it will create a loop.
			})
			.onComplete(function(){
				transitionToUsersCursor();
				//render();
			})
			.start();*/
			
		//Fade the cabinet in
		$(renderer.domElement).css({opacity:0}).transition({opacity:1, duration:1500});
		transitionToUsersCursor();

		function transitionToUsersCursor(){
			var defaultCameraPosition = calculateCameraPosition(false);//true makes it calculate the default camera position, without responding to the mouse.
			var newCameraPosition = calculateCameraPosition(true);//The camera position in response to the user's mouse.
			var cabinetTween2 = new TWEEN.Tween(defaultCameraPosition)
				.to(newCameraPosition, 100)
				.easing(TWEEN.Easing.Quadratic.InOut)
				.onUpdate(function(){
					camera.position.set(this.x, this.y, this.z);
					//render();//Don't call this, because it will create a loop.
				})
				.onComplete(function(){
					cameraDoesRespondToMousePosition = true;
					//render();
				})
				.start();
		}
	}

	function onResize(event){
		setSize();//Calls render().
	}

	function onMouseMove(event){
		//return;
		//log(event.clientX + ' ' + event.clientY);
		var w = mainStage__inner.clientWidth;
		var h = mainStage__inner.clientHeight;
		var mouseXRelativeToScene = event.clientX - mainStage__inner.offsetLeft;
		var mouseYRelativeToScene = event.clientY - mainStage__inner.offsetTop;
		var mouseXPxFromCenter = mouseXRelativeToScene - w/2;
		var mouseYPxFromCenter = mouseYRelativeToScene - h/2;
		mouseXPercentageFromCenter = mouseXPxFromCenter / (w/2);
		mouseYPercentageFromCenter = mouseYPxFromCenter / (h/2);

		//Shrink the interaction area by a bit.
		//Reduce the effect to 1/3 of original, if your cursor moves outside of the interaction area.
		var interactionAreaRatio = 0.8;
		mouseXPercentageFromCenter *= interactionAreaRatio;
		mouseYPercentageFromCenter *= interactionAreaRatio;
		var interactionReduction = 1/3;
		var delta = null;
		if(mouseXPercentageFromCenter < -1){
			delta = mouseXPercentageFromCenter+1;
			mouseXPercentageFromCenter = -1 + delta * interactionReduction;
		}
		if(mouseXPercentageFromCenter > 1){
			delta = mouseXPercentageFromCenter-1;
			mouseXPercentageFromCenter = 1 + delta * interactionReduction;
		}
		if(mouseYPercentageFromCenter < -1){
			delta = mouseYPercentageFromCenter+1;
			mouseYPercentageFromCenter = -1 + delta * interactionReduction;
		}
		if(mouseYPercentageFromCenter > 1){
			delta = mouseYPercentageFromCenter-1;
			mouseYPercentageFromCenter = 1 + delta * interactionReduction;
		}

		if(!cameraDoesRespondToMousePosition) return;
		if(renderer){
			apply();
		}
		if(flipBook){
			var currentFlipBookImage = getCurrentFlipBookImage();
			var mouseXPercentageFromLeft = (mouseXPercentageFromCenter + 1)/2;
			var i = Math.floor(flipBookImages.length * mouseXPercentageFromLeft);
			if(i < 0) i = 0;
			if(i > flipBookImages.length - 1){
				i = flipBookImages.length - 1;
			}
			var newFlipBookImage = flipBookImages[i];
			if(newFlipBookImage != currentFlipBookImage){
				//$(currentFlipBookImage).css({'z-index':0});
				//$(newFlipBookImage).css({'z-index':1}).transition({opacity:1, duration:50, complete:function(){
					$(newFlipBookImage).show();
					$(currentFlipBookImage).hide();
					currentFlipBookImageIndex = i;
					cameraDoesRespondToMousePosition = true;//Re-enable interaction.
				//}});
			}
		}
	}

	function apply(){
		if(cabinet){
			var newCameraPosition = calculateCameraPosition(cameraDoesRespondToMousePosition);
			camera.position.set(newCameraPosition.x, newCameraPosition.y, newCameraPosition.z);
		}
	}

	function calculateCameraPosition(respondToMouse){
		//When the cursor is at left ("start"), you see the side of the cabinet from afar and low.
		//When the cursor moves right ("end"), you are looking into the cabinet window.
		/*var cameraPositions = {
			x:{start:-50+cabinet.position.x, end:6+cabinet.position.x},//Move towards front.
			y:{start:36, end:65},//Move up towards window.
			z:{start:80, end:40}//Move
		};*/
		var cameraPositions = {
			x:{start:-80+cabinet.position.x, end:6+cabinet.position.x},//Move towards front.
			y:{start:36, end:65},//Move up towards window.
			z:{start:80, end:50}//Move
		};
		for(var i in cameraPositions){
			var axis = cameraPositions[i];
			axis.midpoint = axis.start + (axis.end - axis.start)/2;
			axis.range = axis.end - axis.start;
		}

		var mouseX = 0;
		var mouseY = 0;
		if(respondToMouse){
			mouseX = mouseXPercentageFromCenter;
			mouseY = mouseYPercentageFromCenter;
		}

		var value = {
			x: cameraPositions.x.midpoint + mouseX * cameraPositions.x.range/2,
			y: cameraPositions.y.midpoint + mouseX * cameraPositions.y.range/2 + 5 * mouseY,
			z: cameraPositions.z.midpoint + mouseX * cameraPositions.z.range/2
		};

		//Adjust settings for small screens.
		/*if(window.innerWidth < 768){
			camera.position.z = 90;//Move the camera backwards.
		}else{
			camera.position.z = 70;//Move the camera backwards.
		}*/

		return value;
	}

	function render(doRequestAnimationFrame){
		if(!inited){
			return;
		}
		if(video){
			if(video.readyState === video.HAVE_ENOUGH_DATA){
				videoTexture.needsUpdate = true;
			}
		}
		if(lights){//Debug
			//lights[0].intensity = 1.5;
			//lights[0].position.set(100,100,100);

			//lights[1].intensity = 1.5;
			//lights[1].position.set(-200,100,100);
		}
		
		TWEEN.update();
		camera.lookAt(focalPoint);
		renderer.render(scene, camera);
		if(doRequestAnimationFrame){
			requestAnimationFrame(function(){
				render(true);
			});
		}
	}


	Pages.page_scripts["/arcade-era/donkey-kong"] = {
		init: init,
		ready: ready,
		teardown: teardown
	};

})(window,Pages);






