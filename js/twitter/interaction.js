(function($){
// INITIALIZE THE SOCKET
    var socket = io.connect();

// HANDLE ANY NEW TWEETS THAT COME IN.
    socket.on('new-tweet', function (data) {
        var display = grips.render("/twitter#single-tweet", data);
        $(display).addClass('tweet--new').prependTo('.js-all-tweets');

        // Set new tweet count
        var cur_count = parseInt( $('.js-all-tweets').attr('data-new') );
        cur_count += 1;
        $('.js-all-tweets').attr('data-new', cur_count);

        // Prep text to populate
        var loadText = "Load 1 more tweet.";
        if( cur_count > 1 )
        {
            loadText = "Load " + cur_count + " more tweets";
        }

        // Append the new tweets alert
        $('.js-tweet-new').remove();
        var alerts = grips.render("/twitter#new-tweet-alert", {text: loadText});
        $(alerts).prependTo('.js-all-tweets');

        $('.js-load-more-tweets').on('click', function(e){
            e.preventDefault();
            showNewTweets();
        });
    });

// SHOW MORE TWEETS
    function showNewTweets() {
        // Fade in new tweets
        $('.tweet--new').each(function()
        {
            $(this).fadeIn(400, function(){
                $(this).removeClass('tweet--new');
            });
        });

        // Reset counter
        $('.js-all-tweets').attr('data-new', 0);

        // Remove alert
        $('.js-tweet-new').remove();
    }

// START TWEET COMPOSER FUNCTIONS
    function watchTweetComposer($composer, $btn, $counter) {
        updateTweetButton($composer, $btn);

        $composer.on('focus', function(){
            var val = $(this).val();
            if( val === "" ) {
                var input = this;
                $(this).val( $(this).data('default') );
                window.setTimeout(function(){input.setSelectionRange(0, 0)}, 0);
            }
        });

        $composer.on("propertychange keyup keydown input click focus", function(){
            updateCount($(this), $counter);
            updateTweetButton($composer, $btn);
        });

        $btn.on('click', function() {
            window.setTimeout(function(){resetTweet($composer, $btn)}, 2000);
        });
    }

    function updateCount($composer, $counter) {
        var count = 140 - $composer.val().length;

        // Change text if over limit.
        if( count < 0 ) {
            $counter.addClass('chars-count--red');
        } else {
            $counter.removeClass('chars-count--red');
        }

        $counter.html(count);
    }

    function updateTweetButton($composer, $btn) {
        var val = $composer.val();
        var defaultText = $composer.data('default');

        if(val === "") {
            val = defaultText;
        }

        var url = $composer.data('url');
        $btn.attr('href', "https://twitter.com/intent/tweet?text=" + encodeURIComponent(val) + "&url=" + encodeURIComponent(url));
    }

    function resetTweet($composer, $btn) {
        $composer.val($composer.data('default'));
        updateTweetButton($composer, $btn);
    }
//------------------------------------------------------------------------------

    $(function() {
        console.log("twitter js ready called.");

        // Get memories
        $.ajax({
            url: '/json/memories.json',
            type: 'GET',
            data: "",
            dataType: "json"
        })
        .done(function(data) {
            $('.js-all-tweets').attr('data-new', 0);
            var display = grips.render("/twitter#hash-tweets", data);
            $(display).appendTo(".js-all-tweets");
        })
        .fail(function() {
            // console.log( "error" );
        })
        .always(function() {
            // console.log( "complete" );
        });

        // Get featured
        $.ajax({
            url: '/json/featured.json',
            type: 'GET',
            data: "",
            dataType: "json"
        })
        .done(function(data) {
            var display = grips.render("/twitter#featured-tweets", data);
            $(display).appendTo(".js-featured-tweets");
        })
        .fail(function() {
            // console.log( "error" );
        })
        .always(function() {
            // console.log( "complete" );
        });

        watchTweetComposer($('.js-tweet-composer'), $('.js-tweet-btn'), $('.js-tweet-counter'));

        stroll.bind( '.tweet-list', {live: true});
    });
})(jQuery);