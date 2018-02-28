'use strict';

const fs = require('fs');
const path = require('path');

const elnSchema = require('eln-graphql-schema');

const schema = fs.readFileSync(path.join(__dirname, './schema.gql'));

module.exports = `
${elnSchema}
${schema}
`;
