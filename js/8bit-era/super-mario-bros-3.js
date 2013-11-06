// 8-BIT / SUPER MARIO 3
(function(global,Pages){
	
	var bgMusic = null;
	
    // initialize the page so it can slide in
    function init() {
    	hideRefreshButton();
        // Music

		if(!window._AVManager.isMuted){
			createBgMusic();
		}

    }

    // start the page's animations, event handling, etc
    function ready() {

        var stage = $('.main-stage')[0];
        // INIT INTERACTIVITY
        disableSelectionOnMobileBrowsers(stage);//Prevent selection of art elements.
        //FastClick.attach(stage);//Allow faster interaction on mobile. This prevents double-clicks.

        // Add temporary classes can be added to Mario, changing his costume, running the sprite, then returning to normal
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

        // Create variables for each state of Mario
        var $mario = $("#mario");
        var $powerUps = $("#mario-power-ups a");
        var $transformed = $(".transformed");

        var $raccoon = $(".as-raccoon");
        var $hammer = $(".as-hammer");
        var $shoe = $(".as-shoe");
        var $frog = $(".as-frog");
        var $tanooki = $(".as-tanooki");

        // Initialize the animated sprites so all they have to be is restarted
        $raccoon.animateSprite({
            columns: 8,
            totalFrames: 8,
            duration: 1000,
            loop: false
        })

        $hammer.animateSprite({
            columns: 8,
            totalFrames: 8,
            duration: 1000,
            loop: false
        })

        $shoe.animateSprite({
            columns: 5,
            totalFrames: 5,
            duration: 700,
            loop: false
        })

        $frog.animateSprite({
            columns: 5,
            totalFrames: 5,
            duration: 700,
            loop: false
        })

        $tanooki.animateSprite({
            columns: 18,
            totalFrames: 18,
            duration: 1500,
            loop: false
        })

        // When a powerUp is clicked, add the as- class to mario and restart its animated sprite
        $powerUps.click(function(event) {
            $mario.hide();
            $('#poof').fadeIn('fast').fadeOut('slow');

            switch(event.currentTarget.id) {
                case 'raccoon-power':
                    $raccoon.show();
                    $transformed.not($raccoon).hide();
                    $raccoon.animateSprite('restartAnimation');
                break;

                case 'hammer-power':
                    $hammer.show();
                    $transformed.not($hammer).hide();
                    $hammer.animateSprite('restartAnimation');
                break;

                case 'shoe-power':
                    $shoe.show();
                    $transformed.not($shoe).hide();
                    $shoe.animateSprite('restartAnimation');
                break;

                case 'frog-power':
                    $frog.show();
                    $transformed.not($frog).hide();
                    $frog.animateSprite('restartAnimation');
                break;

                case 'tanooki-power':
                    $tanooki.show();
                    $transformed.not($tanooki).hide();
                    $tanooki.animateSprite('restartAnimation');
                break;
            }
        });

        // Give each power-up its own audio so they can fire and overlap if needed
        $("#mario-power-ups a")
          .click(function() {
          	if(!window._AVManager.isMuted){
				var sound = $("#transform-sound")[0];
				sound.load();
				sound.play();
            }
          });

         // CLOUDS
        $('.cloudly').addClass('animate');
    }

    // stop the page, freeze the display, remove event handlers, etc
    function teardown() {
        $("#mario-power-ups a").unbind("click");

        var $raccoon = $(".as-raccoon");
        var $hammer = $(".as-hammer");
        var $shoe = $(".as-shoe");
        var $frog = $(".as-frog");
        var $tanooki = $(".as-tanooki");
        
        $raccoon.animateSprite("stopAnimation");
        $hammer.animateSprite("stopAnimation");
        $shoe.animateSprite("stopAnimation");
        $frog.animateSprite("stopAnimation");
        $tanooki.animateSprite("stopAnimation");

		if(bgMusic){
        	window._AVManager.removeAudio(bgMusic);
        	bgMusic = null;
		}
		
		// stop clouds in the sky
		$('.cloudly').each(function(){
		var $el = $(this);
		var pos = $el.css('left');
		$(this)
			.removeClass('animate')
			.css('left', pos);
		});

    }
	
	function unmute(){
		if(!bgMusic){
			createBgMusic();
		}
	}
	
	function createBgMusic(){
		var audioFolder = '/audio/8bit-era/super-mario-bros-3/';
		var audioFile = 'WorldMap1-GrassLand.mp3';
		var isFirefox = typeof InstallTrigger !== 'undefined';
		if(isFirefox){
			audioFile = 'WorldMap1-GrassLand.ogg';
		}
		bgMusic = new Audio(audioFolder+audioFile);
		window._AVManager.addAudio(bgMusic, true, function(){
			if(!bgMusic) return;
			 window._AVManager.playAudio(bgMusic, true, true);
		});
	}

    Pages.page_scripts["/8bit-era/super-mario-bros-3"] = {
        init: init,
        ready: ready,
        teardown: teardown,
		unmute:unmute
    };

})(window,Pages);
