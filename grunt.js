module.exports = function( grunt ) {

grunt.loadNpmTasks( "grunt-clean" );
grunt.loadNpmTasks( "grunt-html" );
grunt.loadNpmTasks( "grunt-wordpress" );
grunt.loadNpmTasks( "grunt-jquery-content" );

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
			"<script>{\n \"title\": \"Download Builder\"\n}</script>\n" + download.index() );

		grunt.file.write( grunt.config( "wordpress.dir" ) + "/posts/page/themeroller.html",
			"<script>{\n \"title\": \"ThemeRoller\"\n}</script>\n" + themeroller.index() );

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
		// TODO need to set this as config property or use the version from package.json
		args: [ "prepare:master" ],
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
	// We hijack the jquery-ui checkout from download.jqueryui.com
	this.requires( "build-download" );

	var path = require( "path" ),
		jsdom = require( "jsdom" ).jsdom,
		repoDir = path.dirname( require.resolve( "download.jqueryui.com" ) ) +
			"/tmp/jquery-ui",
		demosDir = repoDir + "/demos",
		distDir = repoDir + "/dist",
		targetDir = grunt.config( "wordpress.dir" ) + "/resources/demos",
		highlightDir = targetDir + "-highlight",
		demoList = {},
		// TODO: Figure out how we want to manage versions
		version = "1.9.0-rc.1";

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
				description.parentNode.removeChild( description );
				title = document.getElementsByTagName( "title" )[0];
				if ( !demoList[ subdir ] ) {
					demoList[ subdir ] = {};
				}
				demoList[ subdir ][ filename.substr( 0, filename.length - 5 ) ] = {
					title: title.innerHTML.replace( /[^\-]+\s-\s/, '' ),
					description: description.innerHTML
				};

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

	// Create list of all demos
	grunt.file.write( targetDir + "/demo-list.json", JSON.stringify( demoList ) );

	// Copy externals into /resources/demos/external
	grunt.file.expandFiles( repoDir + "/external/**" ).forEach(function( filename ) {
		grunt.file.copy( filename, targetDir + "/external/" + path.basename( filename ) );
	});

	function replaceResources( source ) {
		// ../../jquery-x.y.z.js -> /resources/demos/jquery.js
		source = source.replace(
			/<script src="\.\.\/\.\.\/jquery-\d+\.\d+(\.\d+)?\.js">/,
			"<script src=\"http://code.jquery.com/jquery-1.8.2.js\">" );

		// ../../ui/* -> /resources/demos/jquery-ui.js
		// Only the first script is replaced, all subsequent scripts are dropped,
		// including the full line
		source = source.replace(
			/<script src="\.\.\/\.\.\/ui\/[^>]+/,
			"<script src=\"http://code.jquery.com/ui/" + version + "/jquery-ui.js\">" );
		source = source.replace(
			/^.*<script src="\.\.\/\.\.\/ui\/[^>]+><\/script>\n/gm,
			"" );

		// ../../external/* -> /resources/demos/external/*
		source = source.replace(
			/<script src="\.\.\/\.\.\/external\//g,
			"<script src=\"/resources/demos/external/" );

		// ../../ui/themes/* -> /resources/demos/theme/jquery-ui.css
		source = source.replace(
			/<link rel="stylesheet" href="\.\.\/\.\.\/themes[^>]+>/,
			"<link rel=\"stylesheet\" href=\"http://code.jquery.com/ui/" + version + "/themes/base/jquery-ui.css\">" );

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

grunt.registerTask( "default", "lint" );
grunt.registerTask( "build", "build-pages build-resources build-download build-demos copy-taxonomies" );
grunt.registerTask( "build-wordpress", "clean lint build" );

};
