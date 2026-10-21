const API = "https://food-delivery-47zq.onrender.com";

const foodList = document.getElementById("food-list");
const searchInput = document.getElementById("search");
const sortSelect = document.getElementById("food-sort");
const categoryFilters = document.getElementById("category-filters");
const resultsSummary = document.getElementById("results-summary");
let foods = [];
let activeCategory = "All";

function notify(message, type = "success") {
    if (typeof showToast === "function") {
        showToast(message, type);
    } else {
        console[type === "error" ? "error" : "log"](message);
    }
}

function updateCartCount(count) {
    const countElement = document.getElementById("cart-count");
    const mobileCountElement = document.getElementById("mobile-cart-count");
    if (countElement) {
        countElement.textContent = String(count);
    }
    if (mobileCountElement) {
        mobileCountElement.textContent = String(count);
    }
}

async function loadCartCount() {
    try {
        const response = await fetch(`${API}/cart`);
        if (!response.ok) {
            throw new Error(`Cart request failed (${response.status})`);
        }

        const items = await response.json();
        updateCartCount(items.reduce((count, item) => count + (Number(item.quantity) || 1), 0));
    } catch (error) {
        console.error("Unable to load cart count:", error);
    }
}

async function addToCart(itemName, price) {
    const data = {
        userEmail: localStorage.getItem("email") || "sourabh@gmail.com",
        foodName: itemName,
        price: price,
        quantity: 1
    };

    try {
        const response = await fetch(`${API}/cart/add`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });
        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.message || `Request failed (${response.status})`);
        }

        const countElement = document.getElementById("cart-count");
        updateCartCount((Number(countElement.textContent) || 0) + 1);
        notify(`${itemName} added to your cart.`);
    } catch (error) {
        console.error("Unable to add item to cart:", error);
        notify(error.message || "Could not add this item to your cart. Please try again.", "error");
    }
}

function makeFoodCard(food) {
    const card = document.createElement("article");
    card.className = "food-card home-food-card";

    const image = document.createElement("img");
    image.src = food.image ? new URL(food.image, API).href : "";
    image.alt = food.name ? `${food.name} dish` : "Food dish";
    image.loading = "lazy";
    image.addEventListener("error", () => {
        image.hidden = true;
    }, { once: true });

    const content = document.createElement("div");
    content.className = "home-food-content";

    const category = document.createElement("span");
    category.className = "food-category";
    category.textContent = food.category || "Chef's pick";

    const name = document.createElement("h3");
    name.textContent = food.name || "Menu favourite";

    const description = document.createElement("p");
    description.className = "food-description";
    description.textContent = food.description || "A delicious pick from our kitchen.";

    const footer = document.createElement("div");
    footer.className = "food-card-footer";

    const price = document.createElement("span");
    price.className = "food-price";
    price.textContent = `₹${Number(food.price).toLocaleString("en-IN")}`;

    const button = document.createElement("button");
    button.type = "button";
    button.className = "add-to-cart-button";
    button.textContent = "Add to cart";
    button.addEventListener("click", () => addToCart(food.name, Number(food.price)));

    footer.append(price, button);
    content.append(category, name, description, footer);
    card.append(image, content);
    return card;
}

function renderFoods() {
    const query = searchInput.value.trim().toLowerCase();
    const filteredFoods = foods.filter(food => {
        const matchesCategory = activeCategory === "All" || food.category === activeCategory;
        const searchableText = `${food.name || ""} ${food.description || ""} ${food.category || ""}`.toLowerCase();
        return matchesCategory && searchableText.includes(query);
    });

    if (sortSelect.value === "price-low") {
        filteredFoods.sort((first, second) => Number(first.price) - Number(second.price));
    } else if (sortSelect.value === "price-high") {
        filteredFoods.sort((first, second) => Number(second.price) - Number(first.price));
    }

    resultsSummary.textContent = `${filteredFoods.length} ${filteredFoods.length === 1 ? "dish" : "dishes"} to explore`;
    foodList.replaceChildren();

    if (filteredFoods.length === 0) {
        const emptyState = document.createElement("div");
        emptyState.className = "menu-state empty-state";
        emptyState.textContent = "No dishes match those filters. Try another search or category.";
        foodList.append(emptyState);
        return;
    }

    foodList.append(...filteredFoods.map(makeFoodCard));
}

function renderCategoryFilters() {
    const categories = ["All", ...new Set(foods.map(food => food.category).filter(Boolean))];
    categoryFilters.replaceChildren();

    categories.forEach(category => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "category-chip";
        button.textContent = category;
        button.setAttribute("aria-pressed", String(activeCategory === category));
        button.addEventListener("click", () => {
            activeCategory = category;
            renderCategoryFilters();
            renderFoods();
        });
        categoryFilters.append(button);
    });
}

async function loadFoods() {
    foodList.innerHTML = '<p class="menu-state">Loading today\'s menu...</p>';
    resultsSummary.textContent = "";

    try {
        const response = await fetch(`${API}/foods`);
        if (!response.ok) {
            throw new Error(`Menu request failed (${response.status})`);
        }

        const data = await response.json();
        if (!Array.isArray(data)) {
            throw new Error("The menu response was not in the expected format.");
        }

        foods = data;
        renderCategoryFilters();
        renderFoods();
    } catch (error) {
        console.error("Unable to load menu:", error);
        foodList.innerHTML = "";
        const errorState = document.createElement("div");
        errorState.className = "menu-state error-state";

        const message = document.createElement("p");
        message.textContent = "We couldn't load the menu. Check your connection and try again.";
        const retryButton = document.createElement("button");
        retryButton.type = "button";
        retryButton.className = "add-to-cart-button";
        retryButton.textContent = "Try again";
        retryButton.addEventListener("click", loadFoods);
        errorState.append(message, retryButton);
        foodList.append(errorState);
    }
}

function setupProfileMenu() {
    const email = localStorage.getItem("email");
    const username = localStorage.getItem("username");
    const welcomeHeading = document.getElementById("welcome-heading");
    const profileMenu = document.getElementById("profile-menu");

    if (username) {
        welcomeHeading.textContent = `Hungry, ${username.split(" ")[0]}?`;
    }

    profileMenu.querySelector('option[value="profile.html"]').hidden = !email;
    profileMenu.querySelector('option[value="history.html"]').hidden = !email;
    profileMenu.querySelector('option[value="login.html"]').hidden = Boolean(email);
    profileMenu.querySelector('option[value="logout"]').hidden = !email;

    profileMenu.addEventListener("change", () => {
        if (profileMenu.value === "logout") {
            localStorage.removeItem("username");
            localStorage.removeItem("email");
            window.location.href = "index.html";
            return;
        }

        if (profileMenu.value) {
            window.location.href = profileMenu.value;
        }
    });
}

document.getElementById("food-search-form").addEventListener("submit", event => {
    event.preventDefault();
    renderFoods();
    document.getElementById("discover").scrollIntoView({ behavior: "smooth" });
});
searchInput.addEventListener("input", renderFoods);
sortSelect.addEventListener("change", renderFoods);

setupProfileMenu();
loadFoods();
loadCartCount();
