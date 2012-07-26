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
			files: "page/*.html",
			tasks: "deploy"
		}
	},
	"build-pages": {
		all: grunt.file.expandFiles( "page/**/*.html" )
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
		markup = require("download.jqueryui.com")();
	grunt.file.write( grunt.config( "wordpress.dir" ) + "/posts/page/download.html", "<script>{\n \"title\": \"Downloadbuilder\"\n}</script>" + markup );
	var resources = grunt.file.expandFiles( dir + "/app/**" );
	resources.forEach(function( file ) {
		grunt.file.copy( file, file.replace( dir + "/app", "dist" ) );
	});
	grunt.log.write( "Wrote page/download.html and " + resources.length + " resources." );
});

grunt.registerTask( "default", "lint" );
grunt.registerTask( "build-wordpress", "clean lint build-pages build-resources");
grunt.registerTask( "deploy", "wordpress-deploy" );

};
