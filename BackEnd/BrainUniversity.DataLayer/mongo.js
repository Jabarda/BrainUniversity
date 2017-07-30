/**
 * Created by Владислав on 17.07.2017.
 */
var mongoClient = require('mongodb').MongoClient;

var database;

function ConnectToDB(html) {
    mongoClient.connect(html, function (err, db) {
        if (err)
        {
            return console.log(err)
        }
        database = db;
    })
}

function Disconnect() {
    database.close();
}



