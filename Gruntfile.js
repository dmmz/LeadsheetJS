module.exports = function(grunt) {
  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %>, <%= pkg.description %> <%= grunt.template.today("yyyy-mm-dd") %> - Sony CSL */\n'
      },
      build: {
        src: 'modules/**/*.js',
        dest: 'build/<%= pkg.name %>.min.js'
      }
    },
    qunit: {
      all: ['tests/main-test.js']
    },
    jshint: {
      all: ['Gruntfile.js', 'modules/**/*.js', 'tests/**/*.js']
    },
    /*requirejs: {
      compile: {
        options: {
          baseUrl: "modules",
          mainConfigFile: "tests/main-test.js",
          name: "node_modules/",
          out: "build/optimized.js",
          done: function(done, output) {
            var duplicates = require('rjs-build-analysis').duplicates(output);

            if (duplicates.length > 0) {
              grunt.log.subhead('Duplicates found in requirejs build:');
              grunt.log.warn(duplicates);
              return done(new Error('r.js built duplicate modules, please check the excludes option.'));
            }

            done();
          }
        }
      }
    }*/
    watch: {
      scripts: {
        files: ['modules/**/*.js'],
        tasks: 'default',
        options: {
          spawn: false,
        },
      },
    },
  });

  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-contrib-qunit');

  grunt.loadNpmTasks('grunt-contrib-jshint');
  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');

  // Default task(s).
  grunt.registerTask('qunit', ['qunit']);

  grunt.registerTask('default', ['uglify']);

};