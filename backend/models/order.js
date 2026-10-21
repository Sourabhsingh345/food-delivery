const mongoose = require("mongoose");

const PAYMENT_METHODS = ["Cash On Delivery", "UPI", "Credit Card"];
const ORDER_STATUSES = ["Order Placed", "Preparing", "Out for Delivery", "Delivered"];

const OrderSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },

    phone: {
        type: String,
        required: true,
        trim: true,
        maxlength: 30
    },

    address: {
        type: String,
        required: true,
        trim: true,
        maxlength: 500
    },

    payment: {
        type: String,
        required: true,
        enum: PAYMENT_METHODS
    },

    total: {
        type: Number,
        required: true,
        min: 1,
        max: 1000000
    },

    status: {
        type: String,
        enum: ORDER_STATUSES,
        default: "Order Placed"
    },

    orderDate: {
        type: Date,
        default: Date.now
    }

});

OrderSchema.index({ orderDate: -1 });

module.exports = mongoose.model("Order", OrderSchema);