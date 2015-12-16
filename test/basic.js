'use strict';

const Couch = require('..');
const data = require('./data/data');

describe('basic initialization tests', function () {
    let couch;
    beforeEach(function () {
        couch = new Couch({database: 'test'});
    });
    it('should init', function () {
        return couch._init();
    });
});

describe('basic tests on existing database', function () {
    before(data);
    it('should grant read access to read-group member', function() {
        return couch.getDocumentById('A', 'a@a.com').then(doc => {
            doc.should.be.an.instanceOf(Object);
        });
    });

    it('should not grant read access to owner', function() {
        return couch.getDocumentById('A', 'b@b.com').then(doc => {
            doc.should.be.an.instanceOf(Object);
        });
    });

    // todo allow to personalize default rights
    it.skip('should not grant read access to inexistant user', function() {
        return couch.getDocumentById('A', 'z@z.com').then(doc => {
            (doc === null).should.be.true();
        });
    });

    it.skip('should not grant read access to non-owner non-read-group member', function() {
        return couch.getDocumentById('A', 'z@z.com').then(doc => {
            (doc === null).should.be.true();
        });
    });
});
