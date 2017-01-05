'use strict';

module.exports = function (grunt) {

  require('load-grunt-tasks')(grunt);

  grunt.initConfig({
    connect: {
      main: {
        options: {
          port: 9001
        }
      }
    },
    watch: {
      main: {
        options: {
          livereload: true,
          livereloadOnError: false,
          spawn: false
        },
        files: ['angular-busy.html','angular-busy.js','angular-busy.css','dist/**/*','demo/**/*'],
        tasks: ['jshint','build']
      }
    },
    jshint: {
      main: {
        options: {
          jshintrc: '.jshintrc'
        },
        src: 'angular-busy.js'
      }
    },
    jasmine: {
      unit: {
        src: ['./bower_components/jquery/dist/jquery.js','./bower_components/angular/angular.js','./bower_components/angular-animate/angular-animate.js','./bower_components/angular-mocks/angular-mocks.js','./dist/angular-busy.js','./demo/demo.js'],
        options: {
          specs: 'test/*.js'
        }
      }
    },
    ngtemplates: {
      main: {
        options: {
          module:'cgBusy',
          base:''
        },
        src:'angular-busy.html',
        dest: 'temp/templates.js'
      }
    },
    concat: {
      main: {
        src: ['angular-busy.js', 'temp/templates.js'],
        dest: 'dist/angular-busy.js'
      }
    },
    copy: {
      main: {
        files: [
          {src:'angular-busy.css',dest:'dist/'},
          {src:'index.js',dest:'dist/'}
        ]
      }
    },
    uglify: {
      main: {
        files: [
        {src:'dist/angular-busy.js',dest:'dist/angular-busy.min.js'}
        ]
      }
    },
    cssmin: {
      main: {
        files: {
          'dist/angular-busy.min.css': 'dist/angular-busy.css'
        }
      }
    }
  });

  grunt.registerTask('serve', ['jshint','connect', 'watch']);
  grunt.registerTask('build',['ngtemplates','concat','uglify','copy','cssmin']);
  grunt.registerTask('test',['build','jasmine']);

};