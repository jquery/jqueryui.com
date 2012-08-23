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

// TODO make this work, then include it in the build-wordpress alias below
// requires actually publishing the download.jqueryui.com module and adding it to package.json
grunt.registerTask( "build-download", function() {
	var path = require( "path" ),
		dir = path.dirname( require.resolve( "download.jqueryui.com" ) ),
		markup = require( "download.jqueryui.com" )( "http://download.jqueryui.com/download" );
	grunt.file.write( grunt.config( "wordpress.dir" ) + "/posts/page/download.html", "<script>{\n \"title\": \"Downloadbuilder\"\n}</script>\n" + markup );
	var resources = grunt.file.expandFiles( dir + "/app/**" );
	resources.forEach(function( file ) {
		grunt.file.copy( file, file.replace( dir + "/app", grunt.config( "wordpress.dir" ) ) );
	});
	grunt.log.write( "Wrote page/download.html and " + resources.length + " resources." );
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
