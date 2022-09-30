const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const DataSchema = new Schema(
    {
    	item: String,
        email: String,
        desired_price: Number
}
);

module.exports = mongoose.model("Subscription", DataSchema);
