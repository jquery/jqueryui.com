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
		page: "page/*.html"
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
		all: grunt.file.expandFiles( "page/**/*.md" )
	},
	"build-resources": {
		all: grunt.file.expandFiles( "resources/*" )
	},
	wordpress: grunt.utils._.extend({
		dir: "dist/wordpress"
	}, grunt.file.readJSON( "config.json" ) )
});

grunt.registerTask( "build-download", function() {
	var path = require( "path" ),
		dir = path.dirname( require.resolve( "download.jqueryui.com" ) ),
		done = this.async();
	// at this point, the download builder repo is available, so let's initialize it
	grunt.utils.spawn({
		cmd: "grunt",
		// TODO need to set this as config property or use the version from package.json
		args: [ "prepare:master" ],
		opts: {
			cwd: "node_modules/download.jqueryui.com"
		}
	}, function(error) {
		if (error) {
			done(error);
		}
		var markup = require( "download.jqueryui.com" )( "http://download.jqueryui.com/download" );
		grunt.file.write( grunt.config( "wordpress.dir" ) + "/posts/page/download.html", "<script>{\n \"title\": \"Downloadbuilder\"\n}</script>\n" + markup );
		var resources = grunt.file.expandFiles( dir + "/app/**" );
		resources.forEach(function( file ) {
			grunt.file.copy( file, file.replace( dir + "/app", grunt.config( "wordpress.dir" ) ) );
		});
		grunt.log.write( "Wrote page/download.html and " + resources.length + " resources." );
		done();
	});

});

// TODO: Merge with grunt-jquery-content
grunt.registerMultiTask( "build-pages", "Process markdown files as pages and syntax higlight code snippets", function() {
	var files = this.data,
		targetDir = grunt.config( "wordpress.dir" ) + "/posts/";

	files.forEach(function( file ) {
		var post = grunt.helper( "wordpress-parse-post", file ),
			content = grunt.helper( "parse-markdown", post.content, post.toc );

		// TODO: Why is this in anysc callback style if it's sync?
		grunt.helper( "syntax-highlight", { content: content },
			function( error, html ) {
				content = html;
			});

		delete post.content;
		delete post.toc;
		grunt.file.write( targetDir + file.replace( /md$/, "html" ),
			"<script>" + JSON.stringify( post ) + "</script>\n" + content );
	});
});

grunt.registerHelper( "parse-markdown", function( src, generateToc ) {
	var toc = "",
		marked = require( "marked" ),
		tokens = marked.lexer( src );

	if ( generateToc ) {
		tokens.filter(function( item ) {
			if ( item.type !== "heading" ) {
				return false;
			}

			item.tocText = item.text;
			item.tocId = item.text
				.replace( /\W+/g, "-" )
				.replace( /^-+|-+$/, "" )
				.toLowerCase();
			item.text += " <a href='#" + item.tocId + "' id='" + item.tocId + "'>link</a>";
			return true;
		}).forEach(function( item ) {
			toc += Array( (item.depth - 1) * 2 + 1 ).join( " " ) + "* " +
				"[" + item.tocText + "](#" + item.tocId + ")\n";
		});

		tokens = marked.lexer( toc ).concat( tokens );
	}

	return marked.parser( tokens );
});

grunt.registerTask( "default", "lint" );
grunt.registerTask( "build-wordpress", "clean lint build-pages build-resources");

};
