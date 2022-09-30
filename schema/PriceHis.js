const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const DataSchema = new Schema(
    {
        item: String,
        date: Number,
        // store: {name:String, id:String},
        price: Number
}
);


module.exports = mongoose.model("PriceHis", DataSchema);