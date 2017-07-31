/**
 * Created by Владислав on 31.07.2017.
 */
let nconf = require('nconf');

nconf.argv()
    .env()
    .file({
        file: process.cwd() + '/config.json'
    });

module.exports = nconf;