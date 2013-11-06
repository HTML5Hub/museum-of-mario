"use strict";

function server(req,res) {
	var html, url;

	// a GET request?
	if (req.method === "GET") {
		// static file request?
		if (/^\/(?:js\/(?=.+)|json\/(?=.+)|images\/(?=.+)|audio\/(?=.+)|video\/(?=.+)|master\.css\b|robots\.txt\b|humans\.txt\b|favicon\.ico\b)/.test(req.url)) {
			req.addListener("end",function(){
				static_files.serve(req,res);
			});
			req.resume();
		}
		// a recognized path for a full-page request?
		else if ((url = Pages.recognize(req.url))) {
			html = Pages.getPageHTML(url,{
				title: "IGN presents Museum of Mario",
				bootstrapper: "/js/" + (PROD ? "prod." : "") + "load.js"
			});

			res.writeHead(200,{ "Content-type": "text/html; charset=UTF-8" });
			res.end(html);
		}
		// otherwise, "NOT FOUND"
		else {
			res.writeHead(404);
			res.end();
		}
	}
	// otherwise, "NOT FOUND"
	else {
		res.writeHead(404);
		res.end();
	}
}

function start(options,auth) {
	if (auth) {
		app = http
		.createServer(auth,server);
	}
	else {
		app = http
		.createServer(server);
	}
	app.listen(options.port,options.host);

	Twitter.serverInit(app);
}

function reloadTemplates(file) {
	if (/tmpls\.js$/.test(file)) {
		console.log("\nReloading templates.");

		// clear the templates-module from the require cache
		delete require.cache[require.resolve(path.join(__dirname,"js","tmpls.js"))];

		// clear out the grips collection cache
		Object.keys(grips.collections).forEach(function(key){
			delete grips.collections[key];
		});

		// reload the templates-module and initialize it
		Tmpls = require("./js/tmpls.js");
		Tmpls.grips = grips;
		Tmpls.init();
	}
}


var
	PROD = (process.env.NODE_ENV === "production"),

	path = require("path"),
	url_parser = require("url"),
	grips = require("grips")[
		// either pull in production or debug of grips engine
		PROD ? "grips" : "debug"
	],
	node_static = require("node-static"),
	static_files = new node_static.Server(__dirname, { cache: 14400, gzip: true }),
	watch = require("watch"),

	Twitter = require(path.join(__dirname, "js", "Twitter.js")),
	Pages = require(path.join(__dirname,"js","Pages.js")),
	Tmpls = require(path.join(__dirname,"js","tmpls.js")),

	http = require("http"),
	app
;

// share grips references
Pages.grips = Tmpls.grips = Twitter.grips = grips;

// initialize all the templates
Tmpls.init();

// watch for an updated templates-bundle to reload it
watch.createMonitor(
	/*root=*/path.join(__dirname,"js"),
	/*options=*/{
		filter: function(file) {
			// only monitor the template-bundle "tmpls.js"
			return !/tmpls\.js/.test(file);
		}
	},
	/*handler=*/function(monitor) {
		monitor.on("created",reloadTemplates);
		monitor.on("changed",reloadTemplates);
	}
);

// watch for changes to featured tweets
watch.createMonitor(
	__dirname,
	{
		filter: function(file) {
			return !/featured-tweets\.json$/.test(file);
		}
	},
	function(monitor) {
		monitor.on("created", Twitter.saveFeaturedTweets);
		monitor.on("changed", Twitter.saveFeaturedTweets);
	}
);

module.exports = {
	start: start
};
