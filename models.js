const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const StockLikesSchema = new Schema({
  symbol: { type: String, unique: true, required: true },
  likes: [ { type: String } ]
});

const StockLikes = mongoose.model("StockLikes", StockLikesSchema);

exports.StockLikes = StockLikes