/**
 * Created by Владислав on 31.07.2017.
 */
let libs = process.cwd();
let oauth2orize         = require('oauth2orize');
let passport            = require('passport');
let crypto              = require('crypto');
let config              = require(libs +'/config');
let UserModel           = require('../database').UserModel;
let ClientModel         = require('../database').ClientModel;
let AccessTokenModel    = require('../database').AccessTokenModel;
let RefreshTokenModel   = require('../database').RefreshTokenModel;

// create OAuth 2.0 server
let server = oauth2orize.createServer();

// Exchange username & password for access token.
server.exchange(oauth2orize.exchange.password(function(client, username, password, scope, done) {
    UserModel.findOne({ username: username }, function(err, user) {
        if (err) { return done(err); }
        if (!user) { return done(null, false); }
        if (!user.checkPassword(password)) { return done(null, false); }

        RefreshTokenModel.remove({ userId: user.userId, clientId: client.clientId }, function (err) {
            if (err) return done(err);
        });
        AccessTokenModel.remove({ userId: user.userId, clientId: client.clientId }, function (err) {
            if (err) return done(err);
        });

        let tokenValue = crypto.randomBytes(32).toString('base64');
        let refreshTokenValue = crypto.randomBytes(32).toString('base64');
        let token = new AccessTokenModel({ token: tokenValue, clientId: client.clientId, userId: user.userId });
        let refreshToken = new RefreshTokenModel({ token: refreshTokenValue, clientId: client.clientId, userId: user.userId });
        refreshToken.save(function (err) {
            if (err) { return done(err); }
        });
        let info = { scope: '*' }
        token.save(function (err, token) {
            if (err) { return done(err); }
            done(null, tokenValue, refreshTokenValue, { 'expires_in': config.get('security:tokenLife') });
        });
    });
}));

// Exchange refreshToken for access token.
server.exchange(oauth2orize.exchange.refreshToken(function(client, refreshToken, scope, done) {
    RefreshTokenModel.findOne({ token: refreshToken }, function(err, token) {
        if (err) { return done(err); }
        if (!token) { return done(null, false); }
        if (!token) { return done(null, false); }

        UserModel.findById(token.userId, function(err, user) {
            if (err) { return done(err); }
            if (!user) { return done(null, false); }

            RefreshTokenModel.remove({ userId: user.userId, clientId: client.clientId }, function (err) {
                if (err) return done(err);
            });
            AccessTokenModel.remove({ userId: user.userId, clientId: client.clientId }, function (err) {
                if (err) return done(err);
            });

            let tokenValue = crypto.randomBytes(32).toString('base64');
            let refreshTokenValue = crypto.randomBytes(32).toString('base64');
            let token = new AccessTokenModel({ token: tokenValue, clientId: client.clientId, userId: user.userId });
            let refreshToken = new RefreshTokenModel({ token: refreshTokenValue, clientId: client.clientId, userId: user.userId });
            refreshToken.save(function (err) {
                if (err) { return done(err); }
            });
            let info = { scope: '*' }
            token.save(function (err, token) {
                if (err) { return done(err); }
                done(null, tokenValue, refreshTokenValue, { 'expires_in': config.get('security:tokenLife') });
            });
        });
    });
}));


// token endpoint
exports.token = [
    passport.authenticate(['basic', 'oauth2-client-password'], { session: false }),
    server.token(),
    server.errorHandler()
]