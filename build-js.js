#!/usr/bin/env node

var
	path = require("path"),
	fs = require("fs"),
	uglify = require("uglify-js"),

	VENDOR_FILENAME = path.join(__dirname,"js","load.vendor.js"),
	SITE_FILENAME = path.join(__dirname,"js","load.site.js"),

	vendor_files = [
		// jquery scripts
		path.join(__dirname,"js","vendor","jquery.parallax.js"),
		path.join(__dirname,"js","vendor","jquery.animateSprite.js"),
		path.join(__dirname,"js","vendor","jquery.transit.min.js"),
		path.join(__dirname,"js","vendor","jquery.mousewheel.js"),

		// "Three" scripts
		path.join(__dirname,"js","vendor","Three.js","Three.js"),
		path.join(__dirname,"js","vendor","Three.js","loaders","MTLLoader.js"),
		path.join(__dirname,"js","vendor","Three.js","loaders","OBJMTLLoader.js"),

		// Additional required scripts
		path.join(__dirname,"js","vendor","grips.min.js"),
		path.join(__dirname,"js","vendor","blockandtackle-libs.js"),
		path.join(__dirname,"js","vendor","tween.min.js"),
		path.join(__dirname,"js","vendor","h5ive.animationframe.js"),
		path.join(__dirname,"js","vendor","sound.js","soundjs-0.5.0.min.js"),
		path.join(__dirname,"js","vendor","history.js"),
		path.join(__dirname,"js","vendor","stroll.js"),
	],

	site_files = [
		path.join(__dirname,"js","plugins.js"),
		path.join(__dirname,"js","tmpls.js"),
		path.join(__dirname,"js","Pages.js"),
		path.join(__dirname,"js","scrollpager.js"),
		path.join(__dirname,"js","main.js"),
		path.join(__dirname,"js","Twitter.js"),
	    path.join(__dirname,"js","twitter","interaction.js"),
	]
;



function bundleJS(files) {
	var bundle_str = "";

	files.forEach(function(file){
		console.log("Bundling: " + file.replace(/.*\//,""));
		var st = fs.statSync(file), contents;

		contents = fs.readFileSync(file,{ encoding: "utf8" });

		try {
			bundle_str += ";" + uglify.minify(contents,{ fromString: true }).code + ";";
		}
		catch (err) {
			bundle_str += ";" + contents + ";";
		}
	});

	return bundle_str;
}

console.log("*** Production JS build ***");

// load.vendor.js
fs.writeFileSync(
	VENDOR_FILENAME,
	bundleJS(vendor_files),
	{ encoding: "utf8" }
);

// load.site.js
fs.writeFileSync(
	SITE_FILENAME,
	bundleJS(site_files),
	{ encoding: "utf8" }
);
