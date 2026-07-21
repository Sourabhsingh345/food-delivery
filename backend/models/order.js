const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({

    name: String,

    phone: String,

    address: String,

    payment: String,

    total: Number,

    orderDate: {
        type: Date,
        default: Date.now
    }

});

module.exports = mongoose.model("Order", OrderSchema);