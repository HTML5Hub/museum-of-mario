// 16BIT-ERA / YOSHIS ISLAND
(function(global,Pages){
	
	var bgMusic = null;
	
    // initialize the page so it can slide in
    function init() {
		hideRefreshButton();
		
		var yoshiTransformSound = null;

        // Music
		if(!window._AVManager.isMuted){
			createBgMusic();
		}
    }

    // start the page's animations, event handling, etc
    function ready() {
        var $yoshi = $('#yoshi');
        var $yoshiPowerUps = $('#yoshi-power-ups a');

		yoshiTransformSound = $("#yoshi-transform-sound")[0];
		window._AVManager.addAudio(yoshiTransformSound, true, function(){
			log("All Yoshi's Island sounded loaded.");
		});
		
        $.fn.extend({ 
            addTemporaryClass: function(className, duration) {
                var elements = this;
                setTimeout(function() {
                    elements.removeClass(className);
                }, duration);

                return this.each(function() {
                    $(this).addClass(className);
                });
            }
        });

        $yoshiPowerUps.click(function() {
            $yoshiPowerUps.removeClass();
            $yoshiPowerUps.fadeOut('slow').delay(4000).fadeIn('slow');
            $('#poof').fadeIn('fast').delay(4000).fadeOut('slow');
            $('#baby-mario').addTemporaryClass('animating' , 4000);
            $('#transform-mask').addTemporaryClass('active' , 4000);
        });

        var $moletank = $(".as-moletank");
        var $helicopter = $(".as-helicopter");
        var $racecar = $(".as-racecar");
        var $submarine = $(".as-submarine");
        var $train = $(".as-train");

        $moletank.animateSprite({
            columns: 8,
            totalFrames: 112,
            duration: 500,
            loop: false
        })
        
        $helicopter.animateSprite({
            columns: 8,
            totalFrames: 108,
            duration: 500,
            loop: false
        })
        
        $racecar.animateSprite({
            columns: 8,
            totalFrames: 92,
            duration: 500,
            loop: false
        })
        
        $submarine.animateSprite({
            columns: 8,
            totalFrames: 85,
            duration: 500,
            loop: false
        })
        
        $train.animateSprite({
            columns: 8,
            totalFrames: 81,
            duration: 500,
            loop: false
        })

        var $runtime = 4000;

        $('#moletank-power').click(function() {
            $yoshi.fadeOut('fast').delay($runtime).fadeIn('fast');
            $moletank.show().delay($runtime).fadeOut('fast');
            $moletank.animateSprite('restartAnimation');
        });

        $('#helicopter-power').click(function() {
            $yoshi.fadeOut('fast').delay($runtime).fadeIn('fast');
            $helicopter.show().delay($runtime).fadeOut('fast');
            $helicopter.animateSprite('restartAnimation');
        });

        $('#racecar-power').click(function() {
            $yoshi.fadeOut('fast').delay($runtime).fadeIn('fast');
            $racecar.show().delay($runtime).fadeOut('fast');
            $racecar.animateSprite('restartAnimation');
        });

        $('#submarine-power').click(function() {
            $yoshi.fadeOut('fast').delay($runtime).fadeIn('fast');
            $submarine.show().delay($runtime).fadeOut('fast');
            $submarine.animateSprite('restartAnimation');
        });

        $('#train-power').click(function() {
            $yoshi.fadeOut('fast').delay($runtime).fadeIn('fast');
            $train.show().delay($runtime).fadeOut('fast');
            $train.animateSprite('restartAnimation');
        });

        $("#yoshi-power-ups a")
          /*.each(function(i) {
            if (i != 0) { 
              $("#yoshi-transform-sound")
                .clone()
                .attr("id", "yoshi-transform-sound" + i)
                .appendTo($(this).parent()); 
            }
            $(this).data("beeper", i);
          })*/
          .click(function() {
			  window._AVManager.playAudio(yoshiTransformSound);//(id:String, rewind:Boolean, loop:Boolean, onComplete:Function):void
          });
        //$('#yoshi-transform-sound').attr("id", "yoshi-transform-sound0");
    }    
    
    // stop the page, freeze the display, remove event handlers, etc
    function teardown() {
        $("#yoshi-power-ups a").unbind("click");

        var $moletank = $(".as-moletank");
        var $helicopter = $(".as-helicopter");
        var $racecar = $(".as-racecar");
        var $submarine = $(".as-submarine");
        var $train = $(".as-train");

        $moletank.animateSprite("stopAnimation");
        $helicopter.animateSprite("stopAnimation");
        $racecar.animateSprite("stopAnimation");
        $submarine.animateSprite("stopAnimation");
        $train.animateSprite("stopAnimation");
		
        window._AVManager.removeAudio(yoshiTransformSound);
		yoshiTransformSound = null;

        if(bgMusic) window._AVManager.removeAudio(bgMusic);
        bgMusic = null;
    }
	
	function unmute(){
		if(!bgMusic){
			createBgMusic();
		}
	}
	
	function createBgMusic(){
		var audioFolder = '/audio/16bit-era/yoshis-island/';
		var audioFile = 'yoshis-island.mp3';
		var isFirefox = typeof InstallTrigger !== 'undefined';
		if(isFirefox){
			audioFile = 'yoshis-island.ogg';
		}
		bgMusic = new Audio(audioFolder+audioFile);
		window._AVManager.addAudio(bgMusic, true, function(){
			if(!bgMusic) return;
			 window._AVManager.playAudio(bgMusic, true, true);
		});
	}

    Pages.page_scripts["/16bit-era/yoshis-island"] = {
        init: init,
        ready: ready,
        teardown: teardown,
		unmute: unmute
    };

})(window,Pages);
