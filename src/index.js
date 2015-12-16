'use strict';

const debug = require('debug')('couch:rest');
const nano = require('nano');

const constants = require('../src/constants');
const designDoc = require('../src/design/app');
const nanoPromise = require('./util/nanoPromise');
const isEmail = require('./util/isEmail');

class Couch {
    constructor(options) {
        options = options || {};

        const database = options.database || process.env.REST_COUCH_DATABASE;
        if (!database) {
            throw new Error('database option is mandatory');
        }

        this._databaseName = database;

        this._couchOptions = {
            url: options.url || process.env.REST_COUCH_URL || 'http://localhost:5984',
            database,
            user: options.user || process.env.REST_COUCH_USER,
            password: options.password || process.env.REST_COUCH_PASSWORD
        };
        this._nano = nano(this._couchOptions.url);
        this._db = null;
        this._lastAuth = 0;
        this._currentAuth = null;
        this._initPromise = null;
        this._init();
    }

    _init() {
        if (this._initPromise) {
            return this._initPromise;
        }
        debug('initialize');
        return this._initPromise = this._authenticate()
            .then(() => nanoPromise.getDatabase(this._nano, this._couchOptions.database))
            .then(db => {
                if (!db) {
                    debug('db not found -> create');
                    return nanoPromise.createDatabase(this._nano, this._couchOptions.database);
                }
            })
            .then(() => checkDesignDoc(this._db))
            .then(() => checkRightsDoc(this._db))
    }

    _authenticate() {
        if (this._currentAuth) {
            return this._currentAuth;
        }
        let prom = Promise.resolve();
        if (this._couchOptions.user) {
            debug('authenticate to CouchDB');
            prom = nanoPromise.authenticate(
                this._nano,
                this._couchOptions.user,
                this._couchOptions.password
            ).then(cookie => {
                this._nano = nano({
                    url: this._couchOptions.url,
                    cookie
                });
            });
        } else {
            debug('no user provided, continue assuming admin party');
        }
        return this._currentAuth = prom.then(() => {
            this._db = this._nano.db.use(this._couchOptions.database);
        });
    }

    getDocumentById(id, user) {
        debug('getDocumentById', id, user);
        return this._init()
            .then(() => getOwnersById(this._db, id))
            .then(owners => {
                if (owners.length === 0) {
                    debug('document not found');
                    return null;
                }
                debug('check rights');
                // TODO handle more than one result
                return validateRight(this._db, owners[0].value, user, 'read')
                    .then(ok => {
                        if (ok) {
                            debug('user has access');
                            return nanoPromise.getDocument(this._db, owners[0].id);
                        }
                        debug('user has no access');
                        return null;
                    });
            });
    }
}

module.exports = Couch;

function checkDesignDoc(db) {
    debug('check design doc');
    return nanoPromise.getDocument(db, constants.DESIGN_DOC_ID)
        .then(doc => {
            if (doc === null) {
                debug('design doc missing');
                return createDesignDoc(db);
            }
            if (doc.version !== designDoc.version) {
                debug('design doc needs update');
                return createDesignDoc(db, doc._rev);
            }
        });
}

function createDesignDoc(db, revID) {
    debug('create design doc');
    if (revID) {
        designDoc._rev = revID;
    } else {
        delete designDoc._rev;
    }
    return nanoPromise.insertDocument(db, designDoc);
}

function getOwnersById(db, id) {
    return nanoPromise.queryView(db, 'ownersById', {key: id});
}

function validateRight(db, owners, user, right) {
    var groups = [];
    for (var i = 0; i < owners.length; i++) {
        if (owners[i] === user) {
            return Promise.resolve(true);
        }
        if (isEmail(owners[i])) {
            continue;
        }
        groups.push(getGroup(db, owners[i]));
    }
    if (groups.length > 0) {
        return Promise.all(groups).then(function (result) {
            for (var i = 0; i < result.length; i++) {
                var group = result[i];
                // check that this group has the requested right
                if (group.rights.indexOf(right) === -1) continue;
                // check that the user is in this group
                for (var j = 0; j < result[i].length; j++) {
                    if (result[i][j] === user) {
                        return true;
                    }
                }
            }
            return false;
        });
    }
    return Promise.resolve(false);
}

function getGroup(db, name) {
    debug('get group');
    return nanoPromise.queryView(db, 'groupByName', {key: name})
        .then(groups => {
            console.log(groups)
            if(groups.rows.length === 0) {
                debug('group does not exist');
                return null;
            }
            if(groups.rows.length > 1) {
                debug('Getting more than one result for a group name')
            }
            debug('group exists');
            return groups.rows[0];
        });
}


function checkRightsDoc(db) {
    debug('create rights doc');
    return nanoPromise.getDocument(db, constants.RIGHTS_DOC_ID)
        .then(doc => {
            if(doc === null) {
                debug('create rights doc');
                return createRightsDoc(db);
            }
        });
}

function createRightsDoc(db) {
    debug('create rights doc');
    const rightsDoc = {
        _id: constants.RIGHTS_DOC_ID,
        '$type': 'db',
        create: ['anonymous'],
        write: ['anonymous'],
        delete: ['anonymous']
    };
    return nanoPromise.insertDocument(db, rightsDoc);
}