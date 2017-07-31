/**
 * Created by Владислав on 17.07.2017.
 */

    let config      = require('../node_modules/nconf');
    let mongoose    = require('../node_modules/mongoose');

    mongoose.connect("mongodb://localhost:27017/test1");
    let db = mongoose.connection;


    let Schema = mongoose.Schema;

    let Card = new Schema({
        name: {type: String, required:true},
        diagnosis: {type:String, required:true}
    });

    let CardModel = mongoose.model('Card', Card);

let crypto      = require('crypto');

// User
let User = new Schema({
    username: {
        type: String,
        unique: true,
        required: true
    },
    hashedPassword: {
        type: String,
        required: true
    },
    salt: {
        type: String,
        required: true
    },
    created: {
        type: Date,
        default: Date.now
    }
});

User.methods.encryptPassword = function(password) {
    return crypto.createHmac('sha1', this.salt).update(password).digest('hex');
    //more secure - return crypto.pbkdf2Sync(password, this.salt, 10000, 512);
};

User.virtual('userId')
    .get(function () {
        return this.id;
    });

User.virtual('password')
    .set(function(password) {
        this._plainPassword = password;
        this.salt = crypto.randomBytes(32).toString('base64');
        //more secure - this.salt = crypto.randomBytes(128).toString('base64');
        this.hashedPassword = this.encryptPassword(password);
    })
    .get(function() { return this._plainPassword; });


User.methods.checkPassword = function(password) {
    return this.encryptPassword(password) === this.hashedPassword;
};

let UserModel = mongoose.model('User', User);

// Client
let Client = new Schema({
    name: {
        type: String,
        unique: true,
        required: true
    },
    clientId: {
        type: String,
        unique: true,
        required: true
    },
    clientSecret: {
        type: String,
        required: true
    }
});

let ClientModel = mongoose.model('Client', Client);

// AccessToken
let AccessToken = new Schema({
    userId: {
        type: String,
        required: true
    },
    clientId: {
        type: String,
        required: true
    },
    token: {
        type: String,
        unique: true,
        required: true
    },
    created: {
        type: Date,
        default: Date.now
    }
});

let AccessTokenModel = mongoose.model('AccessToken', AccessToken);

// RefreshToken
let RefreshToken = new Schema({
    userId: {
        type: String,
        required: true
    },
    clientId: {
        type: String,
        required: true
    },
    token: {
        type: String,
        unique: true,
        required: true
    },
    created: {
        type: Date,
        default: Date.now
    }
});

let RefreshTokenModel = mongoose.model('RefreshToken', RefreshToken);

module.exports.UserModel = UserModel;
module.exports.ClientModel = ClientModel;
module.exports.AccessTokenModel = AccessTokenModel;
module.exports.RefreshTokenModel = RefreshTokenModel;
module.exports.CardModel = CardModel;





