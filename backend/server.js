console.log("Server file Started");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const food = require("./models/food");

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect("mongodb://127.0.0.1:27017/fooddelivery")
.then(() => {
    console.log("✅ MongoDB Connected");
})
.catch((err) => {
    console.log(err);
});

app.get("/foods", async (req, res) => {
    const foods = await food.find();
    res.json(foods);
});

app.get("/add-food", async (req, res) => {
    await food.create({
        name: "Pizza",
        price: 299
    });

    res.send("food Added");
});

app.listen(5000, () => {
    console.log("🚀 Server Running On Port 5000");
});