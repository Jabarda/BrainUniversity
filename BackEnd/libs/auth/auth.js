/**
 * Created by Владислав on 31.07.2017.
 */
let libs = process.cwd();
let config                  = require(libs + '/config');
let passport                = require('passport');
let BasicStrategy           = require('passport-http').BasicStrategy;
let LocalStrategy           = require('passport-local')
let ClientPasswordStrategy  = require('passport-oauth2-client-password').Strategy;
let BearerStrategy          = require('passport-http-bearer').Strategy;
let UserModel               = require('../database').UserModel;
let ClientModel             = require('../database').ClientModel;
let AccessTokenModel        = require('../database').AccessTokenModel;
let RefreshTokenModel       = require('../database').RefreshTokenModel;

passport.use(new LocalStrategy(
    function(username, password, done) {
        UserModel.findOne({ username: username }, function(err, user) {
            if (err) { return done(err); }
            if (!user) { return done(null, false, { message: 'Incorrect username.' }); }
            if (!user.checkPassword(password)) { return done(null, false, { message: 'Incorrect password.' }); }

            return done(null, user);
        });
    }
));

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    UserModel.findOne(id, function(err, user) {
        done(err, user);
    });
});

passport.use(new BasicStrategy(
    function(username, password, done) {
        ClientModel.findOne({ clientId: username }, function(err, client) {
            if (err) { return done(err); }
            if (!client) { return done(null, false, { message: 'Incorrect username.' }); }
            if (client.clientSecret != password) { return done(null, false, { message: 'Incorrect password.' }); }

            return done(null, client);
        });
    }
));

passport.use(new ClientPasswordStrategy(
    function(clientId, clientSecret, done) {
        ClientModel.findOne({ clientId: clientId }, function(err, client) {
            if (err) { return done(err); }
            if (!client) { return done(null, false); }
            if (client.clientSecret != clientSecret) { return done(null, false); }

            return done(null, client);
        });
    }
));

passport.use(new BearerStrategy(
    function(accessToken, done) {
        AccessTokenModel.findOne({ token: accessToken }, function(err, token) {
            if (err) { return done(err); }
            if (!token) { return done(null, false); }

            if( Math.round((Date.now()-token.created)/1000) > config.get('security:tokenLife') ) {
                AccessTokenModel.remove({ token: accessToken }, function (err) {
                    if (err) return done(err);
                });
                return done(null, false, { message: 'Token expired' });
            }

            UserModel.findById(token.userId, function(err, user) {
                if (err) { return done(err); }
                if (!user) { return done(null, false, { message: 'Unknown user' }); }

                let info = { scope: '*' }
                done(null, user, info);
            });
        });
    }
));

ClientModel.remove({}, function(err) {
    var client = new ClientModel({ name: "OurService iOS client v1", clientId: "mobileV1", clientSecret:"abc123456" });
    client.save(function(err, client) {
    });
});