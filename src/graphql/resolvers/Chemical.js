'use strict';

class Chemical {
  constructor(couchdbEntry) {
    this._entry = couchdbEntry;
    this._content = couchdbEntry.$content;
  }
  description() {
    return this._content.description;
  }
  uuid() {
    return this._entry._id;
  }
}

module.exports = Chemical;
