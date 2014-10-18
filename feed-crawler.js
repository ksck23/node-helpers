/*
 * -----------------------------------------------------------------------------
 *                A FEED CRAWLER
 * -----------------------------------------------------------------------------
 */

var request      = require('request');
var FeedParser   = require('feedparser');
var concatstream = require('concat-stream');
var pd           = require('pretty-data').pd;

//------------------------------------------------------------------------------
//                      EXTERNAL FUNCTIONS
//------------------------------------------------------------------------------

/*
 * fetch : fetch data from source url
 */
exports.fetch = function (url, cb) {
    var meta, xml, articles = [];

    var req = request(url, {
        timeout: 10000,
        pool: false,
        strictSSL: false
    });
    req.setMaxListeners(0);
    req.setHeader('User-Agent', 'YourAppName (+https://yourapp.domain.com)');

    var feedparser = new FeedParser({ resume_saxerror: true, addmeta: false });

    // Define our handlers
    req.on('error', done);
    req.on('response', function (res) {
        if (res.statusCode != 200) return this.emit('error', new Error('Bad status code'));
        res.pipe(feedparser);
        res.pipe(concatstream(function (chunk) {
            xml = chunk.toString();
        }));
    });

    feedparser.on('error', done);
    feedparser.on('end', done);
    feedparser.on('readable', function () {
        meta = this.meta;
        var item;
        while (item = this.read()) {
            articles.push(item);
        }
    });

    function done (err) {
        if (err) {
            console.log(err, err.stack);
            cb(err, null);
            //return process.exit(1);
        } else {
            cb(null, {
                "url": url,
                "xml": pd.xml(xml),
                "meta": {
                    type: (meta['#type']) ? meta['#type'] : null,
                    author: (meta.author) ? meta.author : null,
                    copyright: (meta.copyright) ? meta.copyright : null,
                    description: (meta.description) ? meta.description : null,
                    favicon: (meta.favicon) ? meta.favicon : null,
                    feedUrl: (meta.xmlUrl) ? meta.xmlUrl : url,
                    generator: (meta.generator) ? meta.generator : null,
                    image: (meta.image && meta.image.url) ? meta.image.url : "/img/default-site-image.jpg",
                    language: (meta.language) ? meta.language : null,
                    link: (meta.link) ? meta.link : null,
                    title: (meta.title) ? meta.title : null
                },
                "articles": articles.map(function (a) {
                    return {
                        "title": a.title,
                        "description": a.description,
                        "summary": a.summary,
                        "pubDate": a.pubDate,
                        "link": a.link,
                        "guid": a.guid,
                        "author": a.author,
                        "origlink": a.origlink,
                        "image": a.image,
                        "source": a.source,
                        "enclosures": a.enclosures
                    }
                })
            });
        }
        //process.exit();
    }
};

/*
 * Sample code to use this helper.
 * ============================================================================
    var crawler = require('./feed-crawler.js');
    crawler.fetch('some rss or atom feed url', function (err, data) {
        console.log(err, data);
    });
 */