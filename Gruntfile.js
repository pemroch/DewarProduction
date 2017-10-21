module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
        options: {
            // define a string to put between each file in the concatenated output
            separator: ';'
        },
        dist: {
            // the files to concatenate
            src: ['dev/App/**/*.js'],
            // the location of the resulting JS file
            dest: 'public/App/app/<%= pkg.name + pkg.version %>.js'
        }
    },
    uglify: {
        options: {
            // the banner is inserted at the top of the output
            banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
        },
        dist: {
            files: {
                'public/App/app/<%= pkg.name + pkg.version %>.min.js': ['<%= concat.dist.dest %>']
            }
        }
    },
    clean: {
        modules: ['public/App/Modules/'],
        uiServices: ['public/App/UI/UiServices/'],
        js: ['public/App/**/*.js']
    }               
  });
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.registerTask('default', ['clean', 'concat', 'uglify']);
};