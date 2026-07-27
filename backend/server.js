console.log("Server file Started");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const food = require("./models/food");
const User = require("./models/User");
const Cart = require("./models/Cart");
const Order = require("./models/Order");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/images", express.static(path.resolve(__dirname, "../frontend/images")));

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
    await food.insertMany([
        {
            name: "Pizza",
            price: 299,
            category:"Fast Food",
            description:"Chees Veg Pizza",
            image: "/images/pizza.jpg"
        },
        {
            name: "Burger",
            price: 149,
            category:"Fast Food",
            description:"Veg Burger",
            image: "/images/burger.jpg"
        },
        {
            name: "Pasta",
            price: 199,
            category:"Italian",
            description:"White Sauce Pasta",
            image: "/images/pasta.jpg"
        },
        {
            name: "Sandwich",
            price: 99,
            category:"Snacks",
            description:"Grilled Sandwich",
            image: "/images/sandwich.jpg"
        }
    ]);

    res.send("Foods Added Successfully");
});

app.get("/delete-all", async (req, res) => {
    await food.deleteMany({});
    res.send("All Foods Deleted");
});

app.post("/register", async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();

        res.json({
            message: "User Registered Successfully"
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
});

app.post("/login", async (req, res) => {

    try {

        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                message: "User Not Found"
            });
        }

        if (user.password !== password) {
            return res.status(401).json({
                message: "Wrong Password"
            });
        }

        res.json({
            success: true,
            message: "Login Successful",
            user: user
        });

    } catch (err) {

        res.status(500).json({
            success: false,
            message: err.message
        });

    }

});

app.post("/cart/add", async (req, res) => {

    try {

        const cart = new Cart(req.body);

        await cart.save();

        res.json({
            success: true,
            message: "Item Added To Cart"
        });

    } catch (err) {

        res.status(500).json({
            success: false,
            message: err.message
        });

    }

});

app.get("/cart", async (req, res) => {
    
    console.log("Cart API Called");
    const cartItems = await Cart.find();

    res.json(cartItems);

});

app.delete("/cart/:id", async (req, res) => {

    await Cart.findByIdAndDelete(req.params.id);

    res.json({
        success: true,
        message: "Item Removed From Cart"
    });

});

app.post("/order", async (req, res) => {

    try {

        const order = new Order(req.body);

        await order.save();

        res.json({
            success: true,
            message: "Order Placed Successfully"
        });

    } catch (err) {

        res.status(500).json({
            success: false,
            message: err.message
        });

    }

});

app.get("/orders", async (req, res) => {

    try {

        const orders = await Order.find();

        res.json(orders);

    } catch (err) {

        res.status(500).json({
            success: false,
            message: err.message
        });

    }

}); 

app.get("/foods", async (req, res) => {

    try {

        const foods = await food.find();

        res.json(foods);

    } catch (err) {

        res.status(500).json({
            success: false,
            message: err.message
        });

    }

});

app.delete("/orders", async (req, res) => {

    await Order.deleteMany({});

    res.json({
        success: true,
        message: "All History Deleted"
    });

});

app.listen(5000, () => {
    console.log("🚀 Server Running On Port 5000");
});
