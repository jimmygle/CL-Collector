'use strict';

var $ = require('cheerio');
var EventEmitter = require('events').EventEmitter;

var Parse = function (options) {
    this.initialize(options);
    return this;
}

Parse.prototype = {

    initialize: function(options) {
        this.events = new EventEmitter();
        this.posts = [];
        this._options = options || {}
        this.currentRangeStart = 1;
        this.currentRangeEnd = 100;
        this.totalCount = 0;
        this.parse(this._options.markup);
        return this;
    },

    parse: function(rawResponseMarkup) {
        this._rawResponseMarkup = rawResponseMarkup;
        this.parsePosts();
        this.parsePagination();
        return this;
    },

    parsePosts: function() {
        var postsContainer = $('body div.middle form#searchform div.rightpane div.content p.row', this._rawResponseMarkup);

        var posts = [];
        postsContainer.each(function() {
            posts.push({
                'title': $('span.txt span.pl a', this).text(),
                'time': $('span.txt span.pl time', this).attr('datetime'),
                'uri': $('span.txt span.pl a', this).attr('href'),
                'id': Number($('span.txt span.pl a', this).attr('data-id')) || false,
                'repost-of': Number($('span.txt span.pl a', this).attr('data-repost-of')) || false,
                'price': $('span.txt span.l2 span.price', this).text(),
                'location': $('span.txt span.l2 span.pnr small', this).text()
            });
        });
        this.posts = this.posts.concat(posts);

        this.events.emit('posts-parsed');
        return this;
    },

    parsePagination: function() {
        var paginationContainer = $('#searchform > div.rightpane > div.content > div.toc_legend.bottom > div > span > span.buttons', this._rawResponseMarkup);

        this.currentRangeStart = Number($('span.button.pagenum > span.range > span.rangeFrom', paginationContainer).text());
        this.currentRangeEnd = Number($('span.button.pagenum > span.range > span.rangeTo', paginationContainer).text());
        this.totalCount = Number($('span.button.pagenum > span.totalcount', paginationContainer).text());
        this.previousPageUri = $('a.button.prev', paginationContainer).attr('href');
        this.nextPageUri = $('a.button.next', paginationContainer).attr('href');

        this.events.emit('pagination-parsed');
        return this;
    }

}

module.exports = Parse;