var exec = require( "child_process" ).exec,
	fs = require( "fs" ),
	jqueryContent = require( "grunt-jquery-content" );

module.exports = function( grunt ) {

grunt.loadNpmTasks( "grunt-jquery-content" );

grunt.initConfig({
	"build-posts": {
		page: "page/**"
	},
	"build-resources": {
		all: "resources/**"
	},
	wordpress: (function() {
		var config = require( "./config" );
		config.dir = "dist/wordpress";
		return config;
	})()
});

grunt.registerTask( "build-download", function() {
	function writeFiles() {
		var frontend = require( "download.jqueryui.com" ).frontend({
				host: "http://download.jqueryui.com",
				env: "production"
			}),
			download = frontend.download,
			themeroller = frontend.themeroller,
			wordpressDir = grunt.config( "wordpress.dir" ),
			resourceCount = 0;

		grunt.file.write( wordpressDir + "/posts/page/download.html",
			"<script>" + JSON.stringify({
				title: "Download Builder",
				pageTemplate: "page-fullwidth.php"
			}) + "</script>\n" + download.index() );

		grunt.file.write( wordpressDir + "/posts/page/themeroller.html",
			"<script>" + JSON.stringify({
				title: "ThemeRoller",
				pageTemplate: "page-fullwidth.php"
			}) + "</script>\n" + themeroller.index() );

		grunt.file.expand( { filter: "isFile" }, dir + "/app/dist/**" ).forEach(function( file ) {
			grunt.file.copy( file,
				file.replace( dir + "/app/dist", wordpressDir + "/resources" ) );
			resourceCount++;
		});

		grunt.log.writeln( "Wrote download.html, themeroller.html and " +
			resourceCount + " resources." );
	}

	var path = require( "path" ),
		dir = path.dirname( require.resolve( "download.jqueryui.com" ) ),
		done = this.async();

	if ( grunt.option( "noprepare" ) ) {
		writeFiles();
		return done();
	}

	// At this point, the download builder repo is available, so let's initialize it
	grunt.log.writeln( "Initializing download module, might take a while..." );
	exec( "grunt prepare", {
		cwd: "node_modules/download.jqueryui.com"
	}, function( error, stdout, stderr ) {
		if ( error ) {
			grunt.log.error( stderr );
			return done( error );
		}

		writeFiles();
		done();
	});
});

// Build demos
//
//     grunt build-demos[:optionalJqueryUiPath]
//
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

	var demosDir, externalDir, jqueryCore, repoDir, pkg, subdir,
		path = require( "path" ),
		cheerio = require( "cheerio" ),
		targetDir = grunt.config( "wordpress.dir" ) + "/resources/demos",
		highlightDir = targetDir + "-highlight",
		demoList = {};

	if ( this.args.length ) {
		repoDir = this.args[ 0 ];
	} else {

		// We hijack the jquery-ui checkout from download.jqueryui.com
		this.requires( "build-download" );
		repoDir = require( "download.jqueryui.com" ).JqueryUi.getStable().path;
	}
	repoDir = path.resolve( repoDir );

	demosDir = path.join( repoDir, "demos" );
	externalDir = path.join( repoDir, "external" ).replace( process.cwd() + "/", "" );
	pkg = require( path.join( repoDir, "package" ) );
	jqueryCore = fs.readFileSync( path.join( repoDir, "external/jquery/jquery.js" ) )
		.toString().match( /jQuery JavaScript Library v([0-9.]*)/ )[ 1 ];

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
				grunt.file.write( highlightDest, jqueryContent.syntaxHighlight( $.html() ) );
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
	grunt.file.expand( { filter: "isFile" }, externalDir + "/**" ).forEach(function( filename ) {
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
			"<script src=\"//code.jquery.com/ui/" + pkg.version + "/jquery-ui.js\">" );
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
			"<link rel=\"stylesheet\" href=\"//code.jquery.com/ui/" + pkg.version + "/themes/smoothness/jquery-ui.css\">" );

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

	exec( "grunt build-packages:" + path.resolve( "resources/download" ), {
		cwd: "node_modules/download.jqueryui.com"
	}, function( error, stdout, stderr ) {
		if ( error ) {
			grunt.log.error( stderr );
			return done( error );
		}

		grunt.log.write( stdout );
		done();
	});
});

grunt.registerTask( "build", [
	"build-posts",
	"build-resources",
	"build-download",
	"build-demos",
	"copy-taxonomies"
]);

};
