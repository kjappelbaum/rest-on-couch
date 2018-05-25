'use strict';

const nunjucks = require('nunjucks');

const debug = require('../util/debug')('nunjucks');

module.exports = function (app, opts) {
  debug(`initialize with root ${opts.root} and ext ${opts.ext}`);
  const ext = `.${opts.ext || 'html'}`;
  const env = new nunjucks.Environment(
    new nunjucks.FileSystemLoader(opts.root)
  );

  app.context.render = function (name) {
    debug.trace(`rendering ${name + ext}`);
    return new Promise((resolve, reject) => {
      env.render(name + ext, this.state, (err, res) => {
        if (err) {
          reject(err);
        } else {
          this.body = res;
          resolve();
        }
      });
    });
  };
};
