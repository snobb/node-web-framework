/*jshint mocha:true*/
'use strict';

/**
 * Tests for lib/body-middleware.js
 * @author George Borisov <git@gir.me.uk>
 */

const expect = require('chai').expect;
const client = require('../helpers/http-client.js');
const lib = require('../../index.js');

describe('lib/body-middleware.js', function () {
    const app = new lib.App();
    const port = 10001;
    const httpRequest = client(port);

    before(function (done) {
        app.listen(port, done);
    });

    after(function (done) {
        app.close(done);
    });

    it('register middleware', function () {
        app.use(lib.middleware.body());
    });

    it('creates req.body object that is a buffer if request has body', function (done) {
        app.post('/test', function (req, res) {
            res.end();
            expect(Buffer.isBuffer(req.body)).to.equal(true);
            expect(req.body.toString()).to.equal('foofoo');
            done();
        });

        httpRequest({ method: 'POST', path: '/test' }, 'foofoo');
    });

    it('does not create req.body if request has no body', function (done) {
        app.get('/test', function (req, res) {
            res.end();
            expect(req.body).to.equal(undefined);
            done();
        });

        httpRequest({ method: 'GET', path: '/test' });
    });
});