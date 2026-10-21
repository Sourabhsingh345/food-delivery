const mongoose = require("mongoose");

const CartSchema = new mongoose.Schema({

    userEmail: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        index: true
    },

    foodName: {
        type: String,
        required: true,
        trim: true,
        maxlength: 120
    },

    price: {
        type: Number,
        required: true,
        min: 0
    },

    image: {
        type: String,
        trim: true,
        maxlength: 500
    },

    quantity: {
        type: Number,
        default: 1,
        min: 1,
        max: 99
    }

});

module.exports = mongoose.model("Cart", CartSchema);
