const mongoose = require("mongoose");

const FoodSchema = new mongoose.Schema({

    name:{
        type:String,
        required:true
    },

    price:{
        type:Number,
        required:true
    },

    category:{
        type:String,
        required:true
    },

    description:{
        type:String
    },

    image:{
        type:String
    }

});

module.exports = mongoose.model("food", FoodSchema);