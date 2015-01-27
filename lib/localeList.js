"use strict";

var fs = require('fs');
var path = require('path');
var BB = require('bluebird');

var readdir = BB.promisify(fs.readdir);

module.exports = function getLocaleList(root, cb) {
    return readdir(root).then(function (countries) {
        return BB.all(countries.map(function(country) {
            return readdir(path.resolve(root, country)).then(function (val) {
                var filtered = val.filter(twoChar);
                return { country: country, langs: filtered, countryOnly: ((filtered && filtered.length) !== val.length) };
            }).catch(function (err) {
                if (err.code == 'ENOTDIR') {
                    return null;
                } else {
                    cb(err);
                }
            });
        }));
    }).then(function (locales) {
            var result = [];
            locales.forEach(function(entry) {
                if(!entry) return;
                if (entry.countryOnly) {
                    result.push(entry.country);
                }
                result = result.concat(entry.langs.map(function(lang) {
                    return path.join(entry.country, lang);
                }));
            });
            cb(null, result);
        });
};

function twoChar(e) { return /^..$/.test(e); }
