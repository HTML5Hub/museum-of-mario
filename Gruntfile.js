module.exports = function(grunt) {
	var path = require("path");

	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON("package.json"),

		forever: {
			options: {
				index: path.join(__dirname,"prod.js")
			}
		},
		marioserver: {
			dev: {
				port: 9090,
				host: "localhost"
			}
		},
		compress: {
			prod_js: {
				options: {
					mode: "gzip"
				},
				files: [
					{
						src: path.join(__dirname,"js","load.vendor.js"),
						dest: path.join(__dirname,"js","load.vendor.js.gz")
					},
					{
						src: path.join(__dirname,"js","load.site.js"),
						dest: path.join(__dirname,"js","load.site.js.gz")
					},
				]
			},
			site: {
				options: {
					mode: "gzip"
				},
				files: [
					{
						src: path.join(__dirname,"master.css"),
						dest: path.join(__dirname,"master.css.gz")
					},
					{
						src: path.join(__dirname,"js","index.js"),
						dest: path.join(__dirname,"js","index.js.gz")
					},
					{
						src: path.join(__dirname,"js","finish.js"),
						dest: path.join(__dirname,"js","finish.js.gz")
					},
					{
						expand: true,
						src: path.join(__dirname,"js","*-era","*.js"),
						ext: ".js.gz"
					},
				]
			}
		},
		compass: {
			dist: {
				options: {
					sassDir: "stylesheets",
					cssDir: __dirname,
					specify: path.join(__dirname,"stylesheets","master.scss"),
					imagesDir: "images",
					outputStyle: "nested"
				}
			}
		},
		watch: {
			sass: {
				files: [
					path.join(__dirname,"stylesheets","*"),
					path.join(__dirname,"stylesheets","arcade-era","*"),
					path.join(__dirname,"stylesheets","8bit-era","*"),
					path.join(__dirname,"stylesheets","16bit-era","*"),
					path.join(__dirname,"stylesheets","3D-era","*")
				],
				tasks: ["compass"]
			},
			templates: {
				files: [
					path.join(__dirname,"templates","*")
				],
				tasks: ["shell:build_templates"]
			}
		},
		shell: {
			build_templates: {
				options: {
					failOnError: false,
					stderr: true,
					stdout: true
				},
				command: path.join(__dirname, "build-templates.js")
			},
			build_prod_templates: {
				options: {
					failOnError: false,
					stderr: true,
					stdout: true
				},
				command: path.join(__dirname, "build-templates.js prod")
			},
			build_prod_js: {
				options: {
					failOnError: false,
					stderr: true,
					stdout: true
				},
				command: path.join(__dirname, "build-js.js")
			},
			stop_forever: {
				options: {
					failOnError: false,
					stderr: true,
					stdout: true
				},
				command: path.join(__dirname, "node_modules", ".bin", "forever stopall")
			}
		},
		imagemin: {
			png: {
	            options: {
	                optimizationLevel: 7
	            },
	            files: [
	                {
	                    expand: true,
	                    cwd: './images/',
	                    src: ['**/*.png'],
	                    dest: './images-compressed/',
	                    ext: '.png'
	                }
	            ]
	        },
	        jpg: {
	            options: {
	                progressive: true
	            },
	            files: [
	                {
	                    expand: true,
	                    cwd: './images/',
	                    src: ['**/*.jpg'],
	                    dest: './images-compressed/',
	                    ext: '.jpg'
	                }
	            ]
	        }
	    }
	});

	// start the marioserver instance
	grunt.registerTask("marioserver",function(){
		grunt.log.writeln("Starting 'marioserver' on " + grunt.config("marioserver.dev.host") + ":" + grunt.config("marioserver.dev.port"));

		require(path.join(__dirname,"marioserver.js"))
		.start(grunt.config("marioserver.dev"));
	});

	grunt.registerTask("marioserver.prod",function(){
		grunt.log.writeln("Starting 'marioserver.prod'");

		grunt.task.run("shell:stop_forever","forever:start");
	});

	// Load the plugins
	grunt.loadNpmTasks("grunt-contrib-compass");
	grunt.loadNpmTasks("grunt-contrib-watch");
	grunt.loadNpmTasks("grunt-contrib-compress");
	grunt.loadNpmTasks("grunt-shell");
	grunt.loadNpmTasks('grunt-contrib-imagemin');
	grunt.loadNpmTasks('grunt-forever');

	// Default task(s).
	grunt.registerTask("default", ["compass", "shell:build_templates", "compress:site", "marioserver", "watch"]);
	grunt.registerTask("heroku", ["compass", "shell:build_templates"]);
	grunt.registerTask('imgcompress', ['imagemin']);
	grunt.registerTask('imagejpg', ['imagemin:jpg']);

	// production deployment task
	// TODO: uncomment the image compression bits
	grunt.registerTask("prod", [/*"imgcompress", "imagejpg",*/ "compass", "shell:build_prod_templates", "shell:build_prod_js", "compress:prod_js", "compress:site", "marioserver.prod"]);
};
