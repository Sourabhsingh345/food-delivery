require("dotenv").config({ path: require("path").join(__dirname, ".env") });

const crypto = require("node:crypto");
const { promisify } = require("node:util");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("node:path");
const Food = require("./models/food");
const User = require("./models/user");
const Cart = require("./models/cart");
const Order = require("./models/order");

const app = express();
const scrypt = promisify(crypto.scrypt);
const ORDER_STATUSES = ["Order Placed", "Preparing", "Out for Delivery", "Delivered"];
const PAYMENT_METHODS = ["Cash On Delivery", "UPI", "Credit Card"];
const allowedOrigins = (process.env.CORS_ORIGINS || "")
    .split(",")
    .map(origin => origin.trim())
    .filter(Boolean);

class ApiError extends Error {
    constructor(status, message) {
        super(message);
        this.status = status;
    }
}

function requiredString(value, field, maxLength = 500) {
    if (typeof value !== "string") {
        throw new ApiError(400, `${field} is required`);
    }

    const normalized = value.trim();
    if (!normalized || normalized.length > maxLength) {
        throw new ApiError(400, `${field} must be between 1 and ${maxLength} characters`);
    }

    return normalized;
}

function validEmail(value) {
    const email = requiredString(value, "Email", 254).toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new ApiError(400, "Enter a valid email address");
    }
    return email;
}

function requiredPassword(value) {
    if (typeof value !== "string" || !value.trim() || value.length > 128) {
        throw new ApiError(400, "Password is required and must be at most 128 characters");
    }
    return value;
}

function validId(value) {
    if (!mongoose.isValidObjectId(value)) {
        throw new ApiError(400, "Invalid ID");
    }
    return value;
}

async function hashPassword(password) {
    const salt = crypto.randomBytes(16).toString("hex");
    const derivedKey = await scrypt(password, salt, 64);
    return `scrypt$${salt}$${derivedKey.toString("hex")}`;
}

async function verifyPassword(password, storedPassword) {
    if (typeof storedPassword !== "string") {
        return false;
    }
    if (!storedPassword.startsWith("scrypt$")) {
        return password === storedPassword;
    }

    const [, salt, storedKeyHex] = storedPassword.split("$");
    if (!salt || !storedKeyHex || !/^[a-f0-9]{128}$/i.test(storedKeyHex)) {
        return false;
    }

    const candidateKey = await scrypt(password, salt, 64);
    const storedKey = Buffer.from(storedKeyHex, "hex");
    return crypto.timingSafeEqual(candidateKey, storedKey);
}

function publicUser(user) {
    const safeUser = user.toObject();
    delete safeUser.password;
    delete safeUser.__v;
    return safeUser;
}

app.disable("x-powered-by");
app.use(cors({
    origin(origin, callback) {
        callback(null, !origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin));
    },
    optionsSuccessStatus: 204
}));
app.use(express.json({ limit: "20kb" }));
app.use((req, res, next) => {
    if (["POST", "PUT", "PATCH"].includes(req.method)
        && (!req.body || typeof req.body !== "object" || Array.isArray(req.body))) {
        return next(new ApiError(400, "Request body must be a JSON object"));
    }
    next();
});
app.use("/images", express.static(path.resolve(__dirname, "../frontend/images")));

app.get("/health", (req, res) => {
    const ready = mongoose.connection.readyState === 1;
    res.status(ready ? 200 : 503).json({
        success: ready,
        status: ready ? "ok" : "database-unavailable",
        database: mongoose.connection.readyState
    });
});

app.get("/foods", async (req, res) => {
    const foods = await Food.find().lean();
    res.json(foods);
});

app.post("/register", async (req, res) => {
    const name = requiredString(req.body.name, "Name", 100);
    const email = validEmail(req.body.email);
    const password = requiredPassword(req.body.password);
    const phone = requiredString(req.body.phone, "Phone", 30);

    const existingUser = await User.exists({ email });
    if (existingUser) {
        throw new ApiError(409, "Email already registered");
    }

    const user = await User.create({
        name,
        email,
        password: await hashPassword(password),
        phone
    });

    res.status(201).json({
        success: true,
        message: "Registration Successful",
        user: publicUser(user)
    });
});

app.post("/login", async (req, res) => {
    const email = validEmail(req.body.email);
    const password = requiredPassword(req.body.password);
    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await verifyPassword(password, user.password))) {
        throw new ApiError(401, "Invalid email or password");
    }

    if (!user.password.startsWith("scrypt$")) {
        user.password = await hashPassword(password);
        await user.save();
    }

    res.json({
        success: true,
        message: "Login Successful",
        user: publicUser(user)
    });
});

app.post("/cart/add", async (req, res) => {
    const userEmail = validEmail(req.body.userEmail);
    const foodName = requiredString(req.body.foodName, "Food name", 120);
    const quantity = req.body.quantity === undefined ? 1 : Number(req.body.quantity);

    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
        throw new ApiError(400, "Quantity must be a whole number between 1 and 99");
    }

    const selectedFood = await Food.findOne({ name: foodName }).lean();
    if (!selectedFood) {
        throw new ApiError(404, "Food item not found");
    }

    const cartItem = await Cart.create({
        userEmail,
        foodName: selectedFood.name,
        price: selectedFood.price,
        image: selectedFood.image,
        quantity
    });

    res.status(201).json({
        success: true,
        message: "Item Added To Cart",
        item: cartItem
    });
});

app.get("/cart", async (req, res) => {
    const cartItems = await Cart.find().lean();
    res.json(cartItems);
});

app.delete("/cart/:id", async (req, res) => {
    const cartItem = await Cart.findByIdAndDelete(validId(req.params.id));
    if (!cartItem) {
        throw new ApiError(404, "Cart item not found");
    }

    res.json({ success: true, message: "Item Removed From Cart" });
});

app.post("/order", async (req, res) => {
    const name = requiredString(req.body.name, "Name", 100);
    const phone = requiredString(req.body.phone, "Phone", 30);
    const address = requiredString(req.body.address, "Address", 500);
    const payment = requiredString(req.body.payment, "Payment method", 40);
    const total = Number(req.body.total);

    if (!PAYMENT_METHODS.includes(payment)) {
        throw new ApiError(400, "Select a valid payment method");
    }
    if (!Number.isFinite(total) || total <= 0 || total > 1000000) {
        throw new ApiError(400, "Order total must be between ₹1 and ₹10,00,000");
    }

    const order = await Order.create({ name, phone, address, payment, total });
    res.status(201).json({
        success: true,
        message: "Order Placed Successfully",
        order
    });
});

app.get("/order/:id", async (req, res) => {
    const order = await Order.findById(validId(req.params.id)).lean();
    if (!order) {
        throw new ApiError(404, "Order not found");
    }
    res.json(order);
});

app.put("/order/:id/status", async (req, res) => {
    const status = requiredString(req.body.status, "Status", 40);
    if (!ORDER_STATUSES.includes(status)) {
        throw new ApiError(400, "Invalid order status");
    }

    const order = await Order.findByIdAndUpdate(
        validId(req.params.id),
        { status },
        { new: true, runValidators: true }
    );
    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    res.json({ success: true, message: "Status updated successfully", order });
});

app.get("/orders", async (req, res) => {
    const orders = await Order.find().sort({ orderDate: 1 }).lean();
    res.json(orders);
});

app.delete("/orders", async (req, res) => {
    const result = await Order.deleteMany({});
    res.json({
        success: true,
        message: "Order history cleared successfully",
        deletedCount: result.deletedCount
    });
});

app.use((req, res) => {
    res.status(404).json({ success: false, message: "Route not found" });
});

app.use((error, req, res, next) => {
    if (res.headersSent) {
        return next(error);
    }

    if (error instanceof ApiError) {
        return res.status(error.status).json({ success: false, message: error.message });
    }
    if (error.type === "entity.parse.failed") {
        return res.status(400).json({ success: false, message: "Request body must be valid JSON" });
    }
    if (error.type === "entity.too.large") {
        return res.status(413).json({ success: false, message: "Request body is too large" });
    }
    if (error.name === "ValidationError") {
        const message = Object.values(error.errors).map(item => item.message).join(", ");
        return res.status(400).json({ success: false, message });
    }
    if (error.code === 11000) {
        return res.status(409).json({ success: false, message: "A record with that value already exists" });
    }

    console.error("Unhandled API error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
});

async function startServer() {
    if (!process.env.MONGODB_URI) {
        throw new Error("MONGODB_URI is required. Configure it in backend/.env or the host environment.");
    }

    await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 10000
    });

    const port = Number(process.env.PORT) || 5000;
    const server = await new Promise((resolve, reject) => {
        const listener = app.listen(port, () => resolve(listener));
        listener.once("error", reject);
    });

    console.log(`API ready on port ${port}; MongoDB connected`);
    return server;
}

if (require.main === module) {
    startServer().catch(error => {
        console.error("API startup failed:", error.message);
        process.exitCode = 1;
    });
}

module.exports = {
    app,
    startServer,
    hashPassword,
    verifyPassword,
    requiredString,
    requiredPassword,
    validEmail,
    validId
};
