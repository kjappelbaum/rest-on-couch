'use strict';

const Chemical = require('./Chemical');

module.exports = {
  async chemical(_, args, ctx) {
    const entry = await ctx.couch.getEntryWithRights(
      args.uuid,
      ctx.userEmail,
      args.rights
    );
    return new Chemical(entry);
  },
  async chemicals(_, args, ctx) {
    const entries = await ctx.couch.queryViewByUser(
      ctx.userEmail,
      'entryByKind',
      {
        limit: args.limit,
        skip: args.offset
      },
      args.rights
    );
    const chemicals = entries.map((entry) => new Chemical(entry));
    return {
      total: 0,
      samples: chemicals
    };
  }
};
