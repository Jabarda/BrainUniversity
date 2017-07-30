/**
 * Created by Владислав on 17.07.2017.
 */

    let mongoose    = require('../node_modules/mongoose');

    mongoose.connect('mongodb://localhost/test1');
    let db = mongoose.connection;


    let Schema = mongoose.Schema;

    let Card = new Schema({
        name: {type: String, required:true},
        diagnosis: {type:String, required:true}
    });

    let CardModel = mongoose.model('Card', Card);

    module.exports.CardModel = CardModel;





