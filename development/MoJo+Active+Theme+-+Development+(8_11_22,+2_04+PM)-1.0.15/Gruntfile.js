/* eslint-disable */

module.exports = function(grunt) {
    require('time-grunt')(grunt);
    require('load-grunt-config')(grunt, {
        jitGrunt: {
            staticMappings: {
                scsslint: 'grunt-scss-lint',
            },
        },
    });

    grunt.registerTask('switch', function() {
        var env = grunt.option('env');
        grunt.log.writeln(
            'Switching stencil site configuration to ' + env + '.',
        );

        if (!grunt.file.exists('.stencil')) {
            grunt.log.error('No .stencil configuration exists!');
            return true;
        }

        if (!grunt.file.exists('env.' + env + '.json')) {
            grunt.log.error('No environment configuration exists for: ' + env);
            return true;
        }

        var config = grunt.file.readJSON('env.' + env + '.json');
        var stencil = grunt.file.readJSON('.stencil');

        stencil.normalStoreUrl = config.url;
        stencil.clientId = config.id;
        stencil.accessToken = config.token;

        grunt.file.write('.stencil', JSON.stringify(stencil, null, '\t'));
    });

    grunt.registerTask('version', function(key, value) {
        var projectFile = 'config.json';
        if (!grunt.file.exists(projectFile)) {
            grunt.log.error('file ' + projectFile + ' not found');
            return true; //return false to abort the execution
        }
        var project = grunt.file.readJSON(projectFile), //get file as json object
            name = project['name'].split('--')[0],
            split = project['version'].split('.'),
            major = split[0],
            minor = split[1],
            // patch = split[2],
            version = project['version'];

        minor = Number(minor) + 1;
        name = name.replace(project['version'], [major, minor].join('.'));
        const d = new Date();
        // prettier-ignore
        const dateString = `${d.getFullYear()}-${d.getMonth() +
            1}-${d.getDate()}-${
            d.getHours() < 10 ? '0' + d.getHours() : d.getHours()
        }${d.getMinutes() < 10 ? '0' + d.getMinutes() : d.getMinutes()}`;
        if (/\(.*\)/.test(name)) {
            name.replace(/\((.*)\)/gi, () => {
                return dateString;
            });
        } else {
            name += `--${dateString}-`;
        }
        // name = name.replace(project["version"], [major, minor, patch].join('.'))

        project['version'] = [major, minor].join('.');
        // project["version"] = [major, minor, patch].join('.');
        project['name'] = name;
        grunt.file.write(projectFile, JSON.stringify(project, null, 2));
    });

    grunt.registerTask('default', ['eslint', 'karma', 'scsslint', 'svgstore']);
};
