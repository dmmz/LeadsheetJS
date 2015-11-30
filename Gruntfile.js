module.exports = function(grunt) {
	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		qunit: {
			all: ['tests/*.html']
		},
		jshint: {
			all: ['Gruntfile.js', 'modules/**/*.js', 'utils/**/*.js', 'tests/**/*.js']
		},
		requirejs: {
			compile: {
				options: {
					baseUrl: ".",
					paths: {
						jquery: 'empty:',
						jquery_autocomplete: 'empty:',
						qunit: 'empty:',
						vexflow: 'empty:',
						Midijs: 'empty:',
						text: 'external-libs/require-text',
						pubsub: 'empty:',
						jsPDF: 'empty:',
						mustache: 'empty:',
						JsonDelta: 'empty:'
						
						/*jquery: 'external-libs/jquery-2.1.0.min',
						jquery_autocomplete: 'external-libs/jquery.autocomplete.min',
						qunit: 'external-libs/qunit/qunit',
						vexflow: 'external-libs/vexflow-min',
						Midijs: 'external-libs/Midijs/midijs.min',
						text: 'external-libs/require-text',
						pubsub: 'external-libs/tiny-pubsub.min',
						jsPDF: 'external-libs/jspdf/jspdf.min',
						mustache: 'external-libs/mustache'*/
						
					},
					//cjsTranslate: true,
					//findNestedDependencies: true,
					optimize: "none", // "uglify2", "none"
					/*wrap: {
						startFile: 'build/start.frag',
						endFile: 'build/end.frag'
					},*/
					/*wrap: {
						start: "(function() {",
						end: "}());"
					},*/
					/*modules: [
					{
						name: 'leadhseet',
						include: ['modules/main']
					},
					{
						name: 'viewer',
						include: ['modules/core/src/main', 'modules/core/src/LSViewer']
					}
					],*/
					name: "LJS",
					//name: "build/LeadsheetJS-0.1.0.min.js",
					//name: "samples/simpleInterface/interface",
					// include: ['modules/**/*.js', '!modules/core/src/SongModel.old.js'],
					out: "build/<%= pkg.name %>-<%= pkg.version %>.min.js",
					// exclude: ["jquery, jquery_autocomplete, qunit, vexflow_helper, vexflow, Midijs, pubsub, jsPDF, mustache, bootstrap"],
					fileExclusionRegExp: /\.git/,
					/*done: function(done, output) {
						var duplicates = require('rjs-build-analysis').duplicates(output);

						if (duplicates.length > 0) {
							grunt.log.subhead('Duplicates found in requirejs build:');
							grunt.log.warn(duplicates);
							return done(new Error('r.js built duplicate modules, please check the excludes option.'));
						}

						done();
					}*/
				}
			}
		},
		watch: {
			scripts: {
				files: ['modules/**/*.js', 'modules/**/*.html', '!modules/core/src/SongModel.old.js', 'utils/**/*.js', '*.js'],
				tasks: 'default',
				options: {
					spawn: false,
				},
			},
		},
		umd: {
			all: {
				options: {
					src: 'build/<%= pkg.name %>-<%= pkg.version %>.min.js',
					dest: 'build/<%= pkg.name %>-<%= pkg.version %>UMD.min.js', // optional, if missing the src will be used
					// can be specified by name (e.g. 'umd'); if missing, the templates/umd.hbs
					// file will be used from [libumd](https://github.com/bebraw/libumd)
					objectToExport: 'library', // optional, internal object that will be exported
					amdModuleId: 'LJS', // optional, if missing the AMD module will be anonymous
					globalAlias: 'LJS', // optional, changes the name of the global variable
				}
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-requirejs');
	grunt.loadNpmTasks('grunt-contrib-qunit');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-umd');

	// Default task(s).

	grunt.registerTask('default', ['requirejs']);

};