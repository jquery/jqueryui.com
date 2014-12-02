var rimraf = require( "rimraf" );

module.exports = function( grunt ) {

grunt.loadNpmTasks( "grunt-check-modules" );
grunt.loadNpmTasks( "grunt-jquery-content" );
grunt.loadNpmTasks( "grunt-wordpress" );

grunt.initConfig({
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

grunt.registerTask( "clean", function() {
	rimraf.sync( "dist" );
});

grunt.registerTask( "build-download", function() {
	function writeFiles() {
		var frontend = require( "download.jqueryui.com" ).frontend({
				host: "http://download.jqueryui.com",
				env: "production"
			}),
			resources = grunt.file.expandFiles( dir + "/app/dist/**" ),
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
			grunt.file.copy( file, file.replace( dir + "/app/dist", grunt.config( "wordpress.dir" ) + "/resources" ) );
		});

		grunt.log.writeln( "Wrote download.html, themeroller.html and " + resources.length + " resources." );
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
		return a.title.toLowerCase() > b.title.toLowerCase() ? 1 : -1;
	}

	// We hijack the jquery-ui checkout from download.jqueryui.com
	this.requires( "build-download" );

	var jqueryCore, subdir,
		path = require( "path" ),
		cheerio = require( "cheerio" ),
		downloadBuilder = require( "download.jqueryui.com" ),
		stable = downloadBuilder.JqueryUi.getStable(),
		repoDir = path.normalize( stable.path ),
		demosDir = repoDir + "demos",
		externalDir = (repoDir + "external").replace( process.cwd() + "/", "" ),
		targetDir = grunt.config( "wordpress.dir" ) + "/resources/demos",
		highlightDir = targetDir + "-highlight",
		demoList = {};

	jqueryCore = stable.files().jqueryCore[ 0 ].data.match( /jQuery JavaScript Library v([0-9.]*)/ )[ 1 ];

	// Copy all demos files to /resources/demos
	grunt.file.recurse( demosDir, function( abspath, rootdir, subdir, filename ) {
		if ( filename === "index.html" ) {
			return;
		}

		var content, $,
			dest = targetDir + "/" + subdir + "/" + filename,
			highlightDest = highlightDir + "/" + subdir + "/" + filename;

		if ( /html$/.test( filename ) ) {
			content = replaceResources( grunt.file.read( abspath ) );

			if ( !( /(\/)/.test( subdir ) ) ) {
				$ = cheerio.load( content );
				if ( !demoList[ subdir ] ) {
					demoList[ subdir ] = [];
				}
				demoList[ subdir ].push({
					filename: filename.substr( 0, filename.length - 5 ),
					title: $( "title" ).text().replace( /[^\-]+\s-\s/, "" ),
					description: $( ".demo-description" ).remove().html()
				});

				// Save modified demo
				content = $.html();
				grunt.file.write( dest, content );

				// Create syntax highlighted version
				$ = cheerio.load( "<pre><code data-linenum='true'></code></pre>" );
				$( "code" ).text( content );
				grunt.file.write( highlightDest,
					grunt.helper( "syntax-highlight", { content: $.html() } ) );
			} else {
				grunt.file.write( dest, content );
			}
		} else {
			grunt.file.copy( abspath, dest );
		}
	// TODO: Remove subdir parameter when upgrading to grunt 0.4.1+
	// https://github.com/gruntjs/grunt/pull/722
	}, "" );

	for ( subdir in demoList ) {
		demoList[ subdir ].sort( sortByTitle );
	}

	// Create list of all demos
	grunt.file.write( targetDir + "/demo-list.json", JSON.stringify( demoList, null, "\t" ) );

	// Copy externals into /resources/demos/external
	grunt.file.expandFiles( externalDir + "/**" ).forEach(function( filename ) {
		grunt.file.copy( filename, targetDir + "/external/" + filename.replace( externalDir, "" ) );
	});

	function replaceResources( source ) {
		// ../../jquery-x.y.z.js -> CDN
		source = source.replace(
			/<script src="\.\.\/\.\.\/external\/jquery\/jquery\.js">/,
			"<script src=\"//code.jquery.com/jquery-" + jqueryCore + ".js\">" );

		// ../../ui/* -> CDN
		// Only the first script is replaced, all subsequent scripts are dropped,
		// including the full line
		source = source.replace(
			/<script src="\.\.\/\.\.\/ui\/[^>]+>/,
			"<script src=\"//code.jquery.com/ui/" + stable.pkg.version + "/jquery-ui.js\">" );
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
			"<link rel=\"stylesheet\" href=\"//code.jquery.com/ui/" + stable.pkg.version + "/themes/smoothness/jquery-ui.css\">" );

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
		args: [ "build-packages:" + path.resolve( "resources/download" ) ],
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

grunt.registerTask( "build", "build-pages build-resources build-download build-demos copy-taxonomies" );
grunt.registerTask( "build-wordpress", "check-modules clean build" );

};
