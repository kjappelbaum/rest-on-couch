'use strict';

// Doc: https://github.com/vesse/passport-ldapauth#readme
const LdapStrategy = require('passport-ldapauth');

const auth = require('../../middleware/auth');
const util = require('../../middleware/util');

exports.init = function (passport, router, config) {
    passport.use(new LdapStrategy(
        config,
        function (user, done) {
            done(null, {
                provider: 'ldap',
                email: user.mail
            });
        }
    ));

    router.post('/login/ldap', util.parseBody(), passport.authenticate('ldapauth', {
        successRedirect: '/auth/login',
        failureRedirect: '/auth/login'
    }));
};
