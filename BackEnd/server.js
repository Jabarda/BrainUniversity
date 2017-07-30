var express = require('express');
var path            = require('path');
var app = express();
var morgan = require('morgan')
var favicon = require('serve-favicon')

//app.use(favicon())
app.use(morgan('combined'))
app.use(express.static(path.join(__dirname, "public")));

app.route('/api')
    .get(function (req,res) {
        res.send('helloWolrd')
    })

app.listen(3000, function () {
    console.log("Listening...");
})