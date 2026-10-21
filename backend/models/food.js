const mongoose = require("mongoose");

const FoodSchema = new mongoose.Schema({

    name:{
        type:String,
        required:true,
        trim:true,
        maxlength:120
    },

    price:{
        type:Number,
        required:true,
        min:0
    },

    category:{
        type:String,
        required:true,
        trim:true,
        maxlength:80
    },

    description:{
        type:String,
        trim:true,
        maxlength:500
    },

    image:{
        type:String,
        trim:true,
        maxlength:500
    }

});

module.exports = mongoose.model("food", FoodSchema);