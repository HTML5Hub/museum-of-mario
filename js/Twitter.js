(function UMD(name, context, definition) {
    if (typeof module != "undefined" && module.exports) module.exports = definition();
    else if (typeof define == "function" && define.amd) define(definition);
    else context[name] = definition(name,context);
})("Twitter", this, function definition(name,context) {
    "use strict";

    var
        secret,
        Twit,               // Twit module
        T,                  // Primary instance of Twit module
        fs,                 // File System module
        socket,             // Socket.io module
        io,                 // Socket.io instance
        path,               // Path module
        cacheDir = "json";  // Cache directory

    function serverInit(app) {
        try {
            secret = require("../secret.js");    // secrets...shhhh!
        }
        catch (err) {
            secret = require("../sample.secret.js");    // fake secrets!
        }

        Twit = require('twit');
        fs = require('fs');
        socket = require('socket.io');
        path = require('path');

        // Read featured tweets file
        saveFeaturedTweets();

        T = new Twit({
            consumer_key: secret.TWITTER_CONSUMER_KEY,
            consumer_secret: secret.TWITTER_CONSUMER_SECRET,
            access_token: secret.TWITTER_ACCESS_TOKEN,
            access_token_secret: secret.TWITTER_ACCESS_TOKEN_SECRET
        });

        // Start io
        io = socket.listen(app);

        // configure socket.io
        io.configure(function(){
            io.enable("browser client minification"); // send minified client
            io.enable("browser client etag"); // apply etag caching logic based on version number
            io.set("log level", 1); // reduce logging
            io.set("transports", [
                "websocket",
                "xhr-polling",
                "jsonp-polling"
            ]);
        });

        // Start cycle to cache tweets available on site open
         initMemories();

         // Init twtter stream
        initStream();
    }

// FEATURED TWEETS
    function saveFeaturedTweets() {
        var ids,
            count,
            numLoaded = 0,
            order,
            tweets = [];

        fs.readFile(path.join(path.normalize(__dirname + "/.."), "featured-tweets.json"), function(err, data) {
            if( data )
            {
                var json;
                try {
                    json = JSON.parse(data || "null");
                    if( json !== "null" ) {
                        ids = json.tweets.getUnique();
                        count = ids.length;

                        for(var i = 0; i < count; i++) {
                            var id = ids[i];

                            T.get('statuses/show/:id', {id:id}, function(err, data) {
                                if( data ) {
                                    data.text = parseEntities(data.text, data.entities);
                                    tweets.push(data);
                                    numLoaded++;
                                    if(numLoaded >= count)
                                        save("featured", {statuses:tweets});
                                }
                            });
                        }
                    }
                } catch(e) {
                    console.log("Error loading featured tweets: " + e);
                }
            }
        });

        Array.prototype.getUnique = function(){
            var u = {}, a = [];
            for(var i = 0, l = this.length; i < l; ++i){
                if(u.hasOwnProperty(this[i])) {
                    continue;
                }
                a.push(this[i]);
                u[this[i]] = 1;
            }
            return a;
        }
    }
// -----------------------------------------------------------------------------

// MARIO MEMORIES HASH FEED
    function initMemories() {
        T.get("search/tweets", {q:"#mariomemories", count:"100"}, function(err, data){
            if(data && data.statuses) {
                for(var i = 0; i < data.statuses.length; i++) {
                    data.statuses[i].text = parseEntities(data.statuses[i].text, data.statuses[i].entities);
                    data.statuses[i].friendly_time = friendlyTime(data.statuses[i].created_at);
                }
                save("memories", data);
            }
            // setTimeout(initMemories, 7000);
            setTimeout(initMemories, 30000);
        });
    }

    function initStream(socket) {
        var stream = T.stream('statuses/filter', {track:"#mariomemories"})
        stream.on('tweet', function(data){
            data.text = parseEntities(data.text, data.entities);
            data.friendly_time = friendlyTime(data.created_at);
            io.sockets.emit("new-tweet", data);
        });
    }
// -----------------------------------------------------------------------------

// CACHE SAVE AND READ UTILITIES.
    function save(label, data) {
        fs.writeFile(path.join(path.normalize(__dirname + "/.."), cacheDir, label + ".json"), JSON.stringify(data));
    }

    function read(label, callback) {
        fs.readFile(path.join(path.normalize(__dirname + "/.."), cacheDir, label + ".json"), callback);
    }
// -----------------------------------------------------------------------------

// UTILITY TO PARSE TWITTER TIME
    function friendlyTime(tdate) {
        if(tdate != undefined) {
            var system_date = new Date(Date.parse(tdate));
            var user_date = new Date();
            system_date = Date.parse(tdate.replace(/( \+)/, ' UTC$1'))
            var diff = Math.floor((user_date - system_date) / 1000);
            if (diff <= 1) {return "just now";}
            if (diff < 20) {return diff + " seconds ago";}
            if (diff < 40) {return "half a minute ago";}
            if (diff < 60) {return "less than a minute ago";}
            if (diff <= 90) {return "one minute ago";}
            if (diff <= 3540) {return Math.round(diff / 60) + " minutes ago";}
            if (diff <= 5400) {return "1 hour ago";}
            if (diff <= 86400) {return Math.round(diff / 3600) + " hours ago";}
            if (diff <= 129600) {return "1 day ago";}
            if (diff < 604800) {return Math.round(diff / 86400) + " days ago";}
            if (diff <= 777600) {return "1 week ago";}
            return "on " + system_date;
        }
        else
            return;
    }

    function updateTwitterTime() {
        $('.tweet__time').each(function(index){
            var created = $(this).data('created');
            $(this).html(Twitter.friendlyTime(created));
        })

        // If the block is open, call it again in 30 seconds
        if( $('#twitter-feed-block').hasClass('open') )
        {
            setTimeout(updateTwitterTime, 30000);
        }
    }
// -----------------------------------------------------------------------------

// UTILITIES TO PARSE TWITTER UTILITIES
    function parseEntities(text, entities) {
        // TODO: Fix entities at beginning and end of tweet
        if( typeof entities === "object" ) {
            if(entities.hasOwnProperty('urls')) {
                text = parseUrls(text, entities.urls);
            }
            if(entities.hasOwnProperty('user_mentions')) {
                text = parseUserMentions(text, entities.user_mentions);
            }
            if(entities.hasOwnProperty('hashtags')){
                text = parseHashtags(text, entities.hashtags);
            }
        }
        return text;
    };

    function parseUrls(text, urls) {
        for( var url in urls ) {
            var curUrl = urls[url];
            var reg = new RegExp("[^>]"+curUrl.url+"(?!<)");//Only get links that begin and end with a word boundary, so we don't get links
            text = text.replace(reg, " <a href='" + curUrl.url + "' alt='" + curUrl.expanded_url + "' target='_blank'>" + curUrl.display_url + "</a>");
        }
        return text;
    };

    function parseUserMentions(text, mentions){
        for( var mention in mentions){
            var curMention = mentions[mention];
            var reg = new RegExp("[^>]@" + curMention.screen_name + "(?!<)"); //Only get mentions that end with a word boundary, so we don't get links
            text = text.replace(reg, " <a href='http://twitter.com/" + curMention.screen_name + "' alt='" + curMention.name + "' target='_blank'>@" + curMention.screen_name + "</a>");
        }
        return text;
    };

    function parseHashtags(text, hashTags) {
        for( var tag in hashTags ) {
            var curTag = hashTags[tag];
            var reg = new RegExp("[^>]#" + curTag.text + "(?!<)"); //Only get tags that end with a word boundary, so we don't get links
            text = text.replace(reg, " <a href='https://twitter.com/search?q=%23" + curTag.text + "&src=hash' alt='#" + curTag.text + "' target='_blank'>#" + curTag.text + "</a>");
        }
        return text;
    };
// -----------------------------------------------------------------------------

// PUBLIC API
    var public_api = {
        serverInit: serverInit,
        io: io,
        saveFeaturedTweets: saveFeaturedTweets,
        friendlyTime: friendlyTime,
        updateTwitterTime: updateTwitterTime
    };

    return public_api;
// -----------------------------------------------------------------------------
});
