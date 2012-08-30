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
	var path = require( "path" ),
		dir = path.dirname( require.resolve( "download.jqueryui.com" ) ),
		done = this.async();
	// at this point, the download builder repo is available, so let's initialize it
	grunt.log.writeln("Initializing download module, might take a while");
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

grunt.registerTask( "default", "lint" );
grunt.registerTask( "build-wordpress", "clean lint build-pages build-resources build-download");

};
