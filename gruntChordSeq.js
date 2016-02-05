module.exports = function(grunt) {
	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		watch: {
			scripts: {
				files: ['Gruntfile.js', 'LJS.js', 'modules/**/*.js', 'modules/**/*.html', 'utils/**/*.js', '*.js'],
				tasks: 'default',
				options: {
					spawn: false,
				},
			},
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

					},
					cjsTranslate: true,
					//findNestedDependencies: true,
					optimize: "none", // "uglify2", "none"
					/*modules: [
					{
						name: 'leadsheet',
						include: ['modules/main']
					},
					{
						name: 'viewer',
						include: ['modules/core/src/main', 'modules/core/src/LSViewer']
					}
					],*/
					name: "ChordSeq",
					//name: "build/LeadsheetJS-0.1.0.min.js",
					//name: "samples/simpleInterface/interface",
					// include: ['modules/**/*.js', '!modules/core/src/SongModel.old.js'],
					out: "build/chordseq-<%= pkg.version %>.min.js",
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
		qunit: {
			all: ['tests/test.html']
		},
	});

	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-requirejs');
	grunt.loadNpmTasks('grunt-contrib-qunit');
	// grunt.loadNpmTasks('grunt-jsdoc');
	// grunt.loadNpmTasks('grunt-umd');

	// Default task(s).

	grunt.registerTask('all', ['requirejs', 'jsdoc']);
	grunt.registerTask('default', ['requirejs']);

};