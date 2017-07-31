let express = require('express');
let path            = require('path');
let app = express();
let morgan = require('morgan');
let favicon = require('serve-favicon');
let CardModel = require('./libs/database.js').CardModel;
let bodyParser = require('./node_modules/body-parser');
let config          = require('./config');
require('./libs/auth/auth');
let oauth2          = require('./libs/auth/oauth2');
let passport = require('passport');
let UserModel           = require('./libs/database').UserModel;

//app.use(favicon())
app.use(morgan('combined'));
app.use(bodyParser());
app.use(express.static(path.join(__dirname, "public")));

app.route('/api')
    .get(function (req,res) {
        res.send('helloWolrd')
    })



app.use(passport.initialize());



app.route('/oauth/token').post(oauth2.token);

app.route('/api/reg')
    .post(function (req,res){
        let user = new UserModel({
            username: req.body.user.username,
            password: req.body.user.password
        })

        user.save(function (err) {
            if (!err) {
                return res.send({status: 'OK'});
            } else {
                console.log(err);
                if (err.name == 'ValidationError') {
                    res.statusCode = 400;
                    res.send({error: 'Validation error'});
                } else {
                    res.statusCode = 500;
                    res.send({error: 'Server error'});
                }
                //log.error('Internal error(%d): %s', res.statusCode, err.message);
            }
        });
    });

app.route('/login')
    .post(passport.authenticate('local', { successRedirect: '/',
        failureRedirect: '/api' }))

app.route('/logout')
    .get(function(req, res){
    req.logout();
    res.redirect('/');
});

app.route('/api/userInfo').get(
    passport.authenticate('bearer', { session: false }),
    function(req, res) {
        // req.authInfo is set using the `info` argument supplied by
        // `BearerStrategy`.  It is typically used to indicate scope of the token,
        // and used in access control checks.  For illustrative purposes, this
        // example simply returns the scope in the response.
        res.json({ user_id: req.user.userId, name: req.user.username, scope: req.authInfo.scope })
    }
);

app.route('/patients/:id')
    .get(function (req, res) {
        return CardModel.findOne({_id: req.params.id}, function(err, Card)
        {
            if (!Card)
            {
                res.statusCode = 404;
                return res.send({ error: 'Not found' });
            }

            if (!err)
            {
                return res.send({status: 'OK', Card:Card});
            }
            else
            {
                res.statusCode = 500;
                return res.send({ error: 'Server error' });
            }
        })
    })

app.route('/patients')
    .post(function (req,res){
            let card = new CardModel({
                name: req.body.card.name,
                diagnosis: req.body.card.diagnosis
            })

            card.save(function (err) {
                if (!err) {
                    //log.info("article created");
                    return res.send({status: 'OK', card: card});
                } else {
                    console.log(err);
                    if (err.name == 'ValidationError') {
                        res.statusCode = 400;
                        res.send({error: 'Validation error'});
                    } else {
                        res.statusCode = 500;
                        res.send({error: 'Server error'});
                    }
                    //log.error('Internal error(%d): %s', res.statusCode, err.message);
                }
            });
});



app.listen(config.get('port'), function () {
    console.log("Listening...");
})
