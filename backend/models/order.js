const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({

    name: String,

    phone: String,

    address: String,

    payment: String,

    total: Number,

    status: {
        type: String,
        default: "Order Placed"
    },

    orderDate: {
        type: Date,
        default: Date.now
    }

});

module.exports = mongoose.model("Order", OrderSchema);