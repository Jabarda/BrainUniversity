let express = require('express');
let path            = require('path');
let app = express();
let morgan = require('morgan')
let favicon = require('serve-favicon')
let CardModel = require('./libs/database.js').CardModel
let bodyParser = require('./node_modules/body-parser')


//app.use(favicon())
app.use(morgan('combined'))
app.use(bodyParser());
app.use(express.static(path.join(__dirname, "public")));

app.route('/api')
    .get(function (req,res) {
        res.send('helloWolrd')
    })



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

app.listen(3000, function () {
    console.log("Listening...");
})
