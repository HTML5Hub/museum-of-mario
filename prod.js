process.env.NODE_ENV = "production";

var	path = require("path"),

	prod = {
		port: 8081,
		host: ""
	}
;

console.log("marioserver.prod listening on " + prod.host + ":" + prod.port);

require(path.join(__dirname,"marioserver.js")).start(prod);
