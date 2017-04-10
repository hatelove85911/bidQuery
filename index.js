var jsdom = require('jsdom')

var request = require('request');
var cheerio = require('cheerio');
var cmd = require('node-cmd');

jsdom.env('http://www.alltobid.com/contents/16/80.html', 
  ['http://code.jquery.com/jquery.js'], {
  features: {
    FetchExternalResources: ["script", 'img', 'link'],
    ProcessExternalResources: ["script"]
  },
  resourceLoader: function (resource, cb) {
    var pathname = resource.url.pathname;

    if (/\.js$/.test(pathname)) {
      resource.url.pathname = pathname.replace("/js/", "/js/raw/");
      return resource.defaultFetch(function (err, body) {
        if (err) return callback(err);
        callback(null, '"use strict";\n' + body);
      });
    } else {
      return resource.defaultFetch(callback);
    }
  }
  done: function (err, window) {
    var $ = window.$;

  }
})
