module.exports = function( grunt ) {
"use strict";
grunt.loadNpmTasks( "grunt-clean" );
grunt.loadNpmTasks( "grunt-html" );
grunt.loadNpmTasks( "grunt-wordpress" );
grunt.loadNpmTasks( "grunt-jquery-content" );
grunt.loadNpmTasks( "grunt-check-modules" );

grunt.initConfig({
	clean: {
		folder: "dist/"
	},
	htmllint: {
		page: "page/**.html"
	},
	jshint: {
		options: {
			undef: true,
			node: true
		}
	},
	lint: {
		grunt: "grunt.js"
	},
	watch: {
		pages: {
			files: "page/**.html",
			tasks: "deploy"
		}
	},
	"build-pages": {
		all: grunt.file.expandFiles( "page/**" )
	},
	"build-resources": {
		all: grunt.file.expandFiles( "resources/**" )
	},
	wordpress: grunt.utils._.extend({
		dir: "dist/wordpress"
	}, grunt.file.readJSON( "config.json" ) )
});

grunt.registerTask( "build-download", function() {
	function writeFiles() {
		var frontend = new ( require( "download.jqueryui.com" ) )( "http://download.jqueryui.com" ),
			resources = grunt.file.expandFiles( dir + "/app/**" ),
			download = frontend.download,
			themeroller = frontend.themeroller;

		grunt.file.write( grunt.config( "wordpress.dir" ) + "/posts/page/download.html",
			"<script>" + JSON.stringify({
				title: "Download Builder",
				pageTemplate: "page-fullwidth.php"
			}) + "</script>\n" + download.index() );

		grunt.file.write( grunt.config( "wordpress.dir" ) + "/posts/page/themeroller.html",
			"<script>" + JSON.stringify({
				title: "ThemeRoller",
				pageTemplate: "page-fullwidth.php"
			}) + "</script>\n" + themeroller.index() );

		resources.forEach(function( file ) {
			grunt.file.copy( file, file.replace( dir + "/app", grunt.config( "wordpress.dir" ) ) );
		});

		grunt.log.write( "Wrote download.html, themeroller.html and " + resources.length + " resources." );
	}
	var path = require( "path" ),
		dir = path.dirname( require.resolve( "download.jqueryui.com" ) ),
		done = this.async();

	if ( grunt.option( "noprepare" ) ) {
		writeFiles();
		done();
		return;
	}

	// at this point, the download builder repo is available, so let's initialize it
	grunt.log.writeln( "Initializing download module, might take a while..." );
	grunt.utils.spawn({
		cmd: "grunt",
		args: [ "prepare" ],
		opts: {
			cwd: "node_modules/download.jqueryui.com"
		}
	}, function( error, result, stringResult ) {
		if ( error ) {
			grunt.log.error( error, stringResult );
			done( false );
			return;
		}
		writeFiles();
		done();
	});
});

grunt.registerTask( "build-demos", function() {
	function sortByTitle( a, b ) {
		if ( a.filename === "default" ) {
			return -1;
		}
		if ( b.filename === "default" ) {
			return 1;
		}
		return a.title > b.title ? 1 : -1;
	}

	// We hijack the jquery-ui checkout from download.jqueryui.com
	this.requires( "build-download" );

	var path = require( "path" ),
		jsdom = require( "jsdom" ).jsdom,
		downloadModulePath = path.dirname( require.resolve( "download.jqueryui.com" ) ),
		versions = grunt.file.readJSON( downloadModulePath + "/config.json" ),
		repoDir = downloadModulePath + "/release/" + versions.jqueryUi.stable.version,
		demosDir = repoDir + "/demos",
		distDir = repoDir + "/dist",
		targetDir = grunt.config( "wordpress.dir" ) + "/resources/demos",
		highlightDir = targetDir + "-highlight",
		demoList = {},
		subdir;

	// Copy all demos files to /resources/demos
	grunt.file.recurse( demosDir, function( abspath, rootdir, subdir, filename ) {
		if ( filename === "index.html" ) {
			return;
		}

		var content, document, description, title,
			dest = targetDir + "/" + subdir + "/" + filename,
			highlightDest = highlightDir + "/" + subdir + "/" + filename;

		if ( /html$/.test( filename ) ) {
			content = replaceResources( grunt.file.read( abspath ) );

			if ( !( /(\/)/.test( subdir ) ) ) {
				document = jsdom( content, null, {
					features: {
						FetchExternalResources: [],
						ProcessExternalResources: false
					}
				});
				description = document.getElementsByClassName( "demo-description" )[0];
				if ( description ) {
					description.parentNode.removeChild( description );
				}
				title = document.getElementsByTagName( "title" )[0];
				if ( !demoList[ subdir ] ) {
					demoList[ subdir ] = [];
				}
				demoList[ subdir ].push({
					filename: filename.substr( 0, filename.length - 5 ),
					title: title.innerHTML.replace( /[^\-]+\s-\s/, '' ),
					description: description ? description.innerHTML : ""
				});

				// Save modified demo
				content = "<!doctype html>\n" + document.innerHTML;
				grunt.file.write( dest, content );

				// Create syntax highlighted version
				document.innerHTML = "<pre><code data-linenum='true'></code></pre>";
				document.getElementsByTagName( "code" )[0].appendChild(
					document.createTextNode( content ) );
				grunt.file.write( highlightDest,
					grunt.helper( "syntax-highlight", { content: document.innerHTML } ) );
			} else {
				grunt.file.write( dest, content );
			}
		} else {
			grunt.file.copy( abspath, dest );
		}
	});

	for ( subdir in demoList ) {
		demoList[ subdir ].sort( sortByTitle );
	}

	// Create list of all demos
	grunt.file.write( targetDir + "/demo-list.json", JSON.stringify( demoList, null, "\t" ) );

	// Copy externals into /resources/demos/external
	grunt.file.expandFiles( repoDir + "/external/**" ).forEach(function( filename ) {
		grunt.file.copy( filename, targetDir + "/external/" + path.basename( filename ) );
	});

	function replaceResources( source ) {
		// ../../jquery-x.y.z.js -> CDN
		source = source.replace(
			/<script src="\.\.\/\.\.\/jquery-\d+\.\d+(\.\d+)?\.js">/,
			"<script src=\"http://code.jquery.com/jquery-" + versions.jquery + ".js\">" );

		// ../../ui/* -> CDN
		// Only the first script is replaced, all subsequent scripts are dropped,
		// including the full line
		source = source.replace(
			/<script src="\.\.\/\.\.\/ui\/[^>]+>/,
			"<script src=\"http://code.jquery.com/ui/" + versions.jqueryUi.stable.version + "/jquery-ui.js\">" );
		source = source.replace(
			/^.*<script src="\.\.\/\.\.\/ui\/[^>]+><\/script>\n/gm,
			"" );

		// ../../external/* -> /resources/demos/external/*
		source = source.replace(
			/<script src="\.\.\/\.\.\/external\//g,
			"<script src=\"/resources/demos/external/" );

		// ../../ui/themes/* -> CDN
		source = source.replace(
			/<link rel="stylesheet" href="\.\.\/\.\.\/themes[^>]+>/,
			"<link rel=\"stylesheet\" href=\"http://code.jquery.com/ui/" + versions.jqueryUi.stable.version + "/themes/base/jquery-ui.css\">" );

		// ../demos.css -> /resources/demos/style.css
		source = source.replace(
			/<link rel="stylesheet" href="\.\.\/demos.css\">/,
			"<link rel=\"stylesheet\" href=\"/resources/demos/style.css\">" );

		return source;
	}
});

grunt.registerTask( "copy-taxonomies", function() {
	grunt.file.copy( "taxonomies.json",
		grunt.config( "wordpress.dir" ) + "/taxonomies.json" );
});

grunt.registerTask( "create-quickdownload", function() {
	// We hijack the jquery-ui checkout from download.jqueryui.com
	this.requires( "build-download" );

	var done = this.async(),
		path = require( "path" );

	grunt.utils.spawn({
		cmd: "grunt",
		args: [ "build:" + path.resolve( "resources/download" ) ],
		opts: {
			cwd: "node_modules/download.jqueryui.com"
		}
	}, function( error, result, stringResult ) {
		if ( error ) {
			grunt.log.error( error, stringResult );
			done( false );
			return;
		}
		grunt.log.write( result.stdout );
		done();
	});
});

grunt.registerTask( "default", "lint" );
grunt.registerTask( "build", "build-pages build-resources build-download build-demos copy-taxonomies" );
grunt.registerTask( "build-wordpress", "check-modules clean lint build" );

};
