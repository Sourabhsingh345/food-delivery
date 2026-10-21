require("dotenv").config({ path: require("node:path").join(__dirname, ".env") });

const mongoose = require("mongoose");
const Food = require("./models/food");

const foods = [
    {
        name: "Pizza",
        price: 299,
        category: "Fast Food",
        description: "Cheesy Veg Pizza",
        image: "/images/pizza.jpg"
    },
    {
        name: "Burger",
        price: 149,
        category: "Fast Food",
        description: "Crispy Veg Burger",
        image: "/images/burger.jpg"
    },
    {
        name: "Pasta",
        price: 199,
        category: "Italian",
        description: "White Sauce Pasta",
        image: "/images/pasta.jpg"
    },
    {
        name: "Sandwich",
        price: 99,
        category: "Snacks",
        description: "Grilled Cheese Sandwich",
        image: "/images/sandwich.jpg"
    },
    {
        name: "Hakka Noodles",
        price: 179,
        category: "Chinese",
        description: "Spicy Veg Hakka Noodles",
        image: "/images/noodles.jpg"
    },
    {
        name: "Chicken Biryani",
        price: 249,
        category: "Main Course",
        description: "Aromatic Hyderabadi Biryani",
        image: "/images/biryani.jpg"
    },
    {
        name: "French Fries",
        price: 89,
        category: "Snacks",
        description: "Crispy Golden French Fries",
        image: "/images/fries.jpg"
    },
    {
        name: "Paneer Tikka",
        price: 229,
        category: "Starter",
        description: "Grilled Spiced Paneer Tikka",
        image: "/images/paneer_tikka.jpg"
    },
    {
        name: "Masala Dosa",
        price: 159,
        category: "South Indian",
        description: "Crispy dosa filled with spiced potato, served with chutney and sambar",
        image: "/images/dosa.jpg"
    },
    {
        name: "Butter Chicken",
        price: 279,
        category: "Main Course",
        description: "Tender chicken in a creamy tomato and butter sauce",
        image: "/images/butter_chicken.jpg"
    },
    {
        name: "Veg Momos",
        price: 129,
        category: "Chinese",
        description: "Steamed vegetable dumplings served with spicy chutney",
        image: "/images/momos.jpg"
    },
    {
        name: "Chicken Wings",
        price: 219,
        category: "Starters",
        description: "Juicy glazed chicken wings with a creamy dip",
        image: "/images/chicken_wings.jpg"
    },
    {
        name: "Chocolate Brownie",
        price: 119,
        category: "Desserts",
        description: "Rich, fudgy chocolate brownie",
        image: "/images/brownie.jpg"
    },
    {
        name: "Blueberry Cheesecake",
        price: 189,
        category: "Desserts",
        description: "Creamy cheesecake topped with blueberries",
        image: "/images/chocolate_cake.jpg"
    },
    {
        name: "Masala Chai",
        price: 49,
        category: "Beverages",
        description: "Warm Indian tea brewed with aromatic spices",
        image: "/images/masala_chai.jpg"
    }
];

async function seedFoods() {
    if (!process.env.MONGODB_URI) {
        throw new Error("MONGODB_URI is required. Configure it in backend/.env or the host environment.");
    }

    await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 10000
    });

    const result = await Food.bulkWrite(foods.map(item => ({
        updateOne: {
            filter: { name: item.name },
            update: { $set: item },
            upsert: true
        }
    })));

    console.log(`Food seed complete: ${result.upsertedCount} added, ${result.modifiedCount} updated.`);
}

if (require.main === module) {
    seedFoods()
        .catch(error => {
            console.error("Food seed failed:", error.message);
            process.exitCode = 1;
        })
        .finally(async () => {
            await mongoose.disconnect();
        });
}

module.exports = { foods, seedFoods };
