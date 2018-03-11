'use strict';

/**
 * @author George Borisov <git@gir.me.uk>
 * @copyright George Borisov 2018
 * @license LGPL-3.0
 */

var http = require('http');
var httpHash = require('http-hash');

function return_404 (res) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(`404 ${http.STATUS_CODES[404]}`);
}

function make_handler (callback) {
    return function handler (req, res, params) {
        req.params = params;
        callback(req, res);
    };
}

class App {
    constructor (opts) {
        opts = opts || {};
        opts.protocol = opts.protocol || 'http';

        this._middleware = [];
        this._router = {
            DELETE: httpHash(),
            GET: httpHash(),
            POST: httpHash(),
            PUT: httpHash(),
        };
        this._server = require(opts.protocol).createServer((req, res) => {
            this._run_middleware(req, res, () => {
                if (this._router[req.method]) {
                    const r = this._router[req.method].get(req.url);

                    if (r.handler) {
                        r.handler(req, res, r.params);
                    } else {
                        return_404(res);
                    }

                } else {
                    return_404(res);
                }
            });
        });
    }

    _run_middleware (req, res, callback) {
        if (!this._middleware.length) {
            return callback();
        }

        const loop = (i) => {
            if (this._middleware[i]) {
                this._middleware[i](req, res, function () {
                    loop(i + 1);
                });

            } else {
                callback();
            }
        };

        loop(0);
    }

    close () {
        this._server.close.apply(this._server, arguments);
    }

    delete (path, handler) {
        this._router.DELETE.set(path, make_handler(handler));
    }

    get (path, handler) {
        this._router.GET.set(path, make_handler(handler));
    }

    listen () {
        this._server.listen.apply(this._server, arguments);
    }

    post (path, handler) {
        this._router.POST.set(path, make_handler(handler));
    }

    put (path, handler) {
        this._router.PUT.set(path, make_handler(handler));
    }

    use (fn) {
        this._middleware.push(fn);
    }
}

module.exports = App;