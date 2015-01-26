"use strict";

var fs = require('fs');
var path = require('path');
var Q = require('q');

var readdir = Q.nfbind(fs.readdir);

module.exports = function getLocaleList(root, cb) {
    return readdir(root).then(function (countries) {
        return Q.all(countries.map(function(country) {
            return readdir(path.resolve(root, country)).then(function (val) {
                var filtered = val.filter(twoChar);
                return { country: country, langs: val.filter(twoChar), countryOnly: filtered.length !== val.length };
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
