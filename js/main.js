Pages.grips = Tmpls.grips = grips;
Tmpls.init();
edgeCount = 0;
$(document).ready(function(){
	Pages.siteInit();
	ScrollPager.setPageCount(Pages.pageCount());
	ScrollPager.setPageNum(Pages.currentPageNum());

	bindEventTracking();
});

// detecting mobile for when to call init() & ready() for performance
isMobile = false;
 if( navigator.userAgent.match(/Android/i)
 || navigator.userAgent.match(/webOS/i)
 || navigator.userAgent.match(/iPhone/i)
 || navigator.userAgent.match(/iPad/i)
 || navigator.userAgent.match(/iPod/i)
 || navigator.userAgent.match(/BlackBerry/i)
 || navigator.userAgent.match(/Windows Phone/i)
 ){
	isMobile = true;
  }

// bind google event tracking
function bindEventTracking() {
	$('*[data-track="yes"]').on('click', function(e){
		if (typeof _gaq !== 'undefined') {
			try {
				_gaq.push(['_trackEvent', $(this).data('cat'), $(this).data('label')]);
				// console.log('tracked');
			} catch(err){
				// console.log('not tracked');
			};
		}
	});
}

// call from Start and Finish pages
function bindTwitterToggle(){

	$('.twitter-feed-toggle').unbind('click').click(function() {
		$('#twitter-feed-block').toggleClass('open fadeInRight animated');

		if($('#twitter-feed-block').hasClass('open'))
		{
			$('#html5-influencer-block').removeClass('open');
			ScrollPager.disable();
			Twitter.updateTwitterTime();
		}
		else
		{
			ScrollPager.enable();
		}
	});

	$('#mobile-twitter-feed-toggle').unbind('click').click(function() {
		$('#twitter-feed-block').toggleClass('open fadeInRight animated');

		if($('#twitter-feed-block').hasClass('open')) {
			$('#html5-influencer-block').removeClass('open');
			ScrollPager.disable();
			Twitter.updateTwitterTime();
		}
		else
		{
			ScrollPager.enable();
		}

		$(this).toggleClass('open');
	});
}

function unbindTwitterToggle(){
	$('.twitter-feed-toggle').add('#mobile-twitter-feed-toggle').unbind('click');
}

// CLOSE MARIO-MEMORIES WHEN A NAV ITEM IS CLICKED
$('#global-nav a').click(function() {
	$('#twitter-feed-block').removeClass('open');
});

// OPEN THE TWITTER PANEL WHEN #MarioMemories IS IN THE URL
$(function() {
    if (document.location.href.indexOf('#MarioMemories') > -1 ) {
        setTimeout(function() {
        	$('#twitter-feed-block').addClass('open');
    	},3000);
    }
});

// OPEN THE DEV PANEL AS SOON AS THE ANIMATION ENDS ON FINISH
$(function() {
    if (document.location.href.indexOf('finish') > -1 ) {
        setTimeout(function() {
        	$('#html5-influencer-block').addClass('open');
    	},8000);
    }
});

$(document).ready(function() {

// ONLOAD ANIMATIONS
	$('.main-content').delay(750).css('opacity','1');
	$('.off-canvas').hide().delay(2000).fadeIn('2000');

// HTML5 INFLUENCER FEATURETTE SLIDE PANEL
	$('.html5-influencer-toggle').click(function() {
		$('#html5-influencer-block').toggleClass('open');

		if($('#html5-influencer-block').hasClass('open'))
		{
			ScrollPager.disable();
		}
		else
		{
			ScrollPager.enable();
		}
	});

// MOBILE-HTML5-INFLUENCER SLIDE TRIGGER
	$('#mobile-html5-influencer-toggle').click(function() {
		$('#html5-influencer-block').toggleClass('open fadeInRight animated');
		$(this).toggleClass('open');

		if($('#html5-influencer-block').hasClass('open'))
		{
			ScrollPager.disable();
		}
		else
		{
			ScrollPager.enable();
		}
	});

// TWITTER SLIDE TRIGGER
	bindTwitterToggle();

// MOBILE-NAV TOGGLE SWITCH
	var $mobileNavToggle = $('#mobile-nav-toggle');
	var $mobileMask = $('.mobile-mask');
	var $globalNav = $('nav#global-nav');

	$mobileNavToggle.add($mobileMask).bind('click', function(event){
		$globalNav.toggleClass('open');
		$mobileNavToggle.toggleClass('open');
		$mobileMask.toggleClass('fadeIn animated active');
	});
	$('.era-link').click(function(){
		$globalNav.removeClass('open');
		$mobileNavToggle.removeClass('open');
		$mobileMask.removeClass('fadeIn animated active');
	});


// MOBILE-NAV GAME-PAGE FULL-SCREEN TOGGLE SWITCH
	$('#share-toggle').click(function() {
		$('#icon-dock').toggleClass('open');
		$('#share-toggle i').toggleClass('open');
	});

// FACEBOOK SHARE
	$('.facebook-share').on('click', function(e) {
		e.preventDefault();
		return window.FB.ui({
			method: 'feed',
			name: $(this).attr('data-name'),
			link: $(this).attr('data-link'),
			picture: $(this).attr('data-picture'),
			description: $(this).attr('data-description')
		}, function(r) {});
	});

// GOOGLE+ SHARE
	$(".plus-share").on('click', function(e) {
		e.preventDefault();
		var url = $(this).data('url');
		var share = "https://plus.google.com/share?url=" + encodeURIComponent(url);
		window.open(share, '', 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=600,width=600');
	});

});

function showRefreshButton(){
	var $refreshIcons = $('#refresh-icon, #refresh-animation');
	$refreshIcons.show();
}
function hideRefreshButton(){
	var $refreshIcons = $('#refresh-icon, #refresh-animation');
	$refreshIcons.hide();
}



/*****
Class: AVManager
*****/
function AVManager(){
	var _this = this;
	this.enabled = true;
	this.settings = {useSoundJS:true};
	this.audios = [];//Array of HTMLAudioElements.
	this.soundJS__audioInstances = [];//Array of SoundJS__Sounds
	this.videos = [];//Array of HTMLVideoElements.
	this.isMuted = true;//Boolean. Muted by default.
	this.onFileLoadCallbacks = {};//A Dictionary:Object of callbacks:Function, by audioId:String
	//Example: this.onFileLoadCallbacks[audio.id] = function(event){ };
	if(this.settings.useSoundJS){
		//var proxy = createjs.proxy(this.loadHandler, this);
		createjs.Sound.addEventListener("fileload", function(event){
			//Find the callback associated with this file.
			var callback = _this.onFileLoadCallbacks[event.id];
			if(callback){
				callback(event);
			}
		});
		createjs.Sound.registerPlugins([createjs.WebAudioPlugin, createjs.HTMLAudioPlugin]);
		//createjs.Sound.addEventListener("fileload", createjs.proxy(this.soundJS_onFileLoad, (this)));
		//createjs.Sound.addEventListener("fileload", this.soundJS_onFileLoad);

	}
}
AVManager.prototype.disable = function(){
	//alert('disable');
	this.enabled = false;
	this.setVolume(0);
}
AVManager.prototype.mute = function(){
	//alert('mute');
	if(!this.enabled) return false;
	this.isMuted = true;
	setCookie(muteCookieName, 'muted');
	this.setVolume(0);
	var icons = $('#audio-control-1 i, #audio-control-2 i').toArray();
	//$(icons).remove();//css('opacity',1);
	$(icons).removeClass('icon-microphone').addClass('icon-microphone-off');
}
AVManager.prototype.setVolume = function(volume){
	this.volume = volume;
	if(this.soundJS__audioInstances){
		for(var i in this.soundJS__audioInstances){
			var audioInstance = this.soundJS__audioInstances[i];
			audioInstance.volume = volume;
		}
	}
	for(var i in this.audios){
		var audio = this.audios[i];
		audio.volume = volume;
	}
	for(var i in this.videos){
		var video = this.videos[i];
		video.volume = volume;
	}
}
AVManager.prototype.unmute = function(){
	//alert('unmute');
	if(!this.enabled) return false;
	var icons = $('#audio-control-1 i, #audio-control-2 i').toArray();
	setCookie(muteCookieName, 'unmuted');
	$(icons).removeClass('icon-microphone-off').addClass('icon-microphone');
	this.isMuted = false;
	this.setVolume(1);
}
AVManager.prototype.addVideo = function(video, onLoaded){
	if(!(video instanceof HTMLVideoElement)) console.error("Invalid HTMLVideoElement");//TypeCheck

	//Make sure the audio instance has a source.
	if(!video.src){
		var sourceURL = this._getSourceURLFromAudioOrVideo(video);
		//alert(sourceURL);
		video.src = sourceURL;
		if(!sourceURL){//Need to check this as video.src would equal "undefined" String.
			console.error("No source found.");
			return;
		}
	}
	//alert(video.src);

	//Check if there is already an audio instance with this URL, and prevent duplicates.
	for(var i in this.videos){
		var video2 = this.videos[i];
		if(video.src == video2.src){
			console.error('An video with this URL was already found.');
			return;
		}
	}
	this.videos.push(video);
	video.volume = this.volume;
	if(video.readyState == 4){
		if(onLoaded) onLoaded();
	}else{
		video.addEventListener('canplaythrough', function(event){
			if(onLoaded) onLoaded();
		});
	}
}
AVManager.prototype.addVideos = function(videos, onLoaded){//(Array of HTMLVideoElements, Boolean, Function):void
	var _this = this;
	for(var i in videos){
		var video = videos[i];
		this.addVideo(video, part__onLoaded);
	}

	var numberOfPartsLoaded = 0;
	function part__onLoaded(){
		numberOfPartsLoaded++;
		if(numberOfPartsLoaded == videos.length){
			if(onLoaded) onLoaded();
		}
	}
}
AVManager.prototype.removeVideo = function(video){
	video.pause();
	for(var i in this.videos){
		var video2 = this.videos[i];
		if(video == video2){
			this.videos.splice(i, 1);//Remove the video from the array of videos.
		}
	}
	delete(video);
	video = null;
}
AVManager.prototype.removeVideos = function(videos){//(Array of HTMLVideoElements):void
	var _this = this;
	for(var i in videos){
		var video = videos[i];
		this.removeVideo(video);
	}
}
AVManager.prototype.addAudio = function(audio, load, onLoaded){
	var _this = this;
	if(!this.enabled) return false;
	if(!(audio instanceof HTMLAudioElement)) console.error("Invalud HTMLAudioElement");//TypeCheck

	//Make sure the audio instance has a source.
	if(!audio.src){
		var sourceURL = this._getSourceURLFromAudioOrVideo(audio);
		audio.src = sourceURL;
		if(!audio.src){
			console.error("No source found.");
			return;
		}
	}

	//Check if there is already an audio instance with this URL, and prevent duplicates.
	for(var i in this.audios){
		var audio2 = this.audios[i];
		if(audio.src == audio2.src){
			console.error('An audio with this URL was already found.');
			return;
		}
	}
	audio.id = 'audio'+Math.floor((Math.random()*100000));//Create a unique id.
	this.audios.push(audio);
	audio.volume = this.volume;

	if(this.settings.useSoundJS){
		if(load){
			var instance = createjs.Sound.registerSound(audio.src, audio.id);
			if(instance === true){//Already loaded.
				if(onLoaded) onLoaded();
			}else{
				this.onFileLoadCallbacks[audio.id] = function(event){
					delete _this.onFileLoadCallbacks[audio.id];
					if(onLoaded) onLoaded();
				};
			}
		}
	}else{
		//Load audios. We need to still load them manually since SoundJS's loadhander is erroring.
		if(load){
			audio.load();
		}
		if(audio.readyState == 4){
			if(onLoaded) onLoaded();
		}else{
			audio.addEventListener('canplaythrough', function(event){
				if(onLoaded) onLoaded();
			});
		}
	}
}
AVManager.prototype.addAudios = function(audios, load, onLoaded){//(Array of HTMLAudioElements, Boolean, Function):void
	if(!this.enabled) return false;
	var _this = this;
	var numberOfPartsLoaded = 0;
	for(var i in audios){
		var audio = audios[i];
		this.addAudio(audio, load, part__onLoaded);
	}

	function part__onLoaded(){
		numberOfPartsLoaded++;
		if(numberOfPartsLoaded == audios.length){
			if(onLoaded) onLoaded();
		}
	}
}
AVManager.prototype.stopAudio = function(audio){//(HTMLAudioElement):void
	if(!this.enabled) return false;
	if(this.settings.useSoundJS){
		for(var i in this.soundJS__audioInstances){
			var instance = this.soundJS__audioInstances[i];
			if(instance.id == audio.id){
				instance.pause();
			}
		}
	}else{
		audio.pause();
	}
}
AVManager.prototype.stopAudios = function(audios){//(Array of HTMLAudioElements):void
	if(!this.enabled) return false;
	var _this = this;
	for(var i in audios){
		var audio = audios[i];
		this.stopAudio(audio);
	}
}
AVManager.prototype.removeAudio = function(audio){
	if(!this.enabled) return false;
	this.stopAudio(audio);
	for(var i in this.soundJS__audioInstances){
		var instance = this.soundJS__audioInstances[i];
		if(instance.id == audio.id){
			this.soundJS__audioInstances.splice(i, 1);//Remove from Array.
			createjs.Sound.removeSound(audio.id);
		}
	}
	for(var i in this.audios){
		var audio2 = this.audios[i];
		if(audio == audio2){
			this.audios.splice(i, 1);//Remove the audio from the array of audios.
			break;
		}
	}
	delete(audio);
	audio = null;
}
AVManager.prototype.removeAudios = function(audios){//(Array of HTMLAudioElements):void
	if(!this.enabled) return false;
	var _this = this;
	for(var i in audios){
		var audio = audios[i];
		this.removeAudio(audio);
	}
}
AVManager.prototype.playAudio = function(audio, rewind, loop, onComplete){//(HTMLAudioElement, Boolean, Function):void
	if(!this.enabled) return false;
	var _this = this;
	if(!(audio instanceof HTMLAudioElement)) console.error("Invalud HTMLAudioElement");//TypeCheck
	if(rewind == null) rewind = true;//Defaults to true.
	if(this.settings.useSoundJS){
		var isLoaded = createjs.Sound.loadComplete(audio.id);
		if(!isLoaded){
			setTimeout(function(){
				var audioStillExists = null;
				for(var i in _this.audios){
					var audio2 = _this.audios[i];
					if(audio2 == audio){
						audioStillExists = true;
					}
				}
				if(audioStillExists){
					_this.playAudio(audio, rewind, onComplete);
				}
			}, 100);//Check 10 times a second to see if the audio is loaded, and play it as soon as it is.
			return;
		}
	}
	//Make sure the audio is in the system.
	var matchFound = false;
	for(var i in this.audios){
		var audio2 = this.audios[i];
		if(audio2 == audio){
			matchFound = true;
			break;
		}
	}
	if(!matchFound){
		console.error("Audio needs to be added to the AVManager before it can be played.");
		return;
	}

	if(this.settings.useSoundJS){
		createjs.Sound.loadComplete(audio.id)
		var instance = createjs.Sound.play(audio.id, {loop:loop});// play using id.  Could also use full source path or event.src.
		instance.id = audio.id;//Custom property so we can find it later.
		instance.volume = this.volume;
		this.soundJS__audioInstances.push(instance);
		instance.addEventListener("complete", function(){
			if(!loop){
				for(var i in this.soundJS__audioInstances){
					var instance2 = this.soundJS__audioInstances[i];
					if(instance == instance2){
						this.soundJS__audioInstances.splice(i, 1);//Remove from Array.
					}
				}
			}
			if(onComplete) onComplete();
		});
	}else{
		if(rewind){
			if(audio.currentTime > 0){
				//audio.currentTime = 0;
				//log('load', true);
				audio.load();//This forces a rewind since audio.currentTime = 0 does not work.
			}
		}
		audio.play();
	}
}
AVManager.prototype.playVideo = function(video, rewind, onComplete){//(HTMLVideoElement, Boolean, Function):void
	if(!(video instanceof HTMLVideoElement)){
		console.error("Invalid HTMLVideoElement");//TypeCheck
		return;
	}
	if(rewind == null) rewind = true;//Defaults to true.

	//Make sure the audio is in the system.
	var matchFound = false;
	for(var i in this.videos){
		var video2 = this.videos[i];
		if(video2 == video){
			matchFound = true;
			break;
		}
	}
	if(!matchFound){
		console.error("Video needs to be added to the AVManager before it can be played.");
		return;
	}

	if(rewind){
		if(video.currentTime > 0){
			//audio.currentTime = 0;
			video.load();//This forces a rewind since video.currentTime = 0 does not work.
		}
	}
	video.play();
}
AVManager.prototype._getSourceURLFromAudioOrVideo = function(audioOrVideo){//(HTMLAudioElement):String
	var sourceType = null;
	var canPlayOGG = null;
	var canPlayMPEG = null;
	if(audioOrVideo instanceof HTMLVideoElement){
		canPlayOGG = audioOrVideo.canPlayType("video/ogg")? true : false;
		canPlayMPEG = audioOrVideo.canPlayType("video/mp4")? true : false;
		sourceType = (canPlayMPEG)? 'mp4' : 'ogg';
	}else{
		canPlayOGG = audioOrVideo.canPlayType("audio/ogg")? true : false;
		canPlayMPEG = audioOrVideo.canPlayType("audio/mpeg")? true : false;
		sourceType = (canPlayMPEG)? 'mpeg' : 'ogg';
	}
	var sourceElements = $(audioOrVideo).find('source').toArray();
	for(var i in sourceElements){
		var sourceElement = sourceElements[i];
		var sourceType2 = sourceElement.attributes.type.value;
		if(sourceType2.indexOf(sourceType) >= 0){
			var sourceURL = sourceElement.attributes.src.value;
			return sourceURL;
		}
	}
	console.error('No media found.');
}
/*****
End Class: AVManager
*****/



window._AVManager = new AVManager();
var muteCookieName = 'historyOfMario_muteCookie';
var soundSetting = getURLParameter('sound');
if(soundSetting == 'off'){
	window._AVManager.disable();
}else if(soundSetting == 'on'){
	window._AVManager.unmute();
}else{
	var isMutedCookie = getCookie(muteCookieName);
	if(isMutedCookie == 'unmuted'){
		window._AVManager.unmute();
	}else{
		window._AVManager.mute();
	}
}

function getURLParameter(name) {
    return decodeURI(
        (RegExp(name + '=' + '(.+?)(&|$)').exec(location.search)||[,null])[1]
    );
}
