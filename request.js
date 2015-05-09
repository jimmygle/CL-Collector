'use strict';

var http = require('http');

var Request = function (options) {
    this._host = options.host || '';
    this._path = options.path || '';
    return this;
}

Request.prototype = {

    make: function(responseCallback) {
        http.request({
            host: this._host,
            path: this._path
        }, function(response) {
            var rawResponseMarkup;
            response.setEncoding('utf8');
            response.on('data', function (chunk) {
                rawResponseMarkup += chunk;
            });
            response.on('end', function() {
                 responseCallback(rawResponseMarkup);
            });
        }).end();
        return this;
    }

}

module.exports = Request;