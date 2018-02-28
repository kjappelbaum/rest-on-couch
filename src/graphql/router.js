'use strict';
const { graphqlKoa, graphiqlKoa } = require('apollo-server-koa');
const Router = require('koa-router');
const koaBody = require('koa-body');

const { setupCouch } = require('../server/middleware/couch');

const schema = require('./index.js');

const router = new Router();

const graphqlOptions = (ctx) => {
  const context = ctx.state;
  return {
    schema,
    context
  };
};

const graphiqlOptions = (ctx) => {
  return {
    endpointURL: `/${ctx.params.dbname}/graphql`
  };
};

router.post(
  '/:dbname/graphql',
  koaBody(),
  setupCouch,
  graphqlKoa(graphqlOptions)
);

router.get('/:dbname/graphiql', graphiqlKoa(graphiqlOptions));

module.exports = router;
