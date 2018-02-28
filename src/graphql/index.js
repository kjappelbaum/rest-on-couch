'use strict';

const { makeExecutableSchema } = require('graphql-tools');

const schemaString = require('./schema');

const resolveFunctions = require('./resolvers/query');

const schema = makeExecutableSchema({
  typeDefs: schemaString,
  resolvers: {
    Query: resolveFunctions
  }
});

module.exports = schema;
