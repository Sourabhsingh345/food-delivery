let cart = [];

async function addToCart(itemName, price) {

    const data = {
        userEmail: "sourabh@gmail.com",
        foodName: itemName,
        price: price,
        quantity: 1
    };

    const response = await fetch("http://localhost:5000/cart/add", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });

    const result = await response.json();

    alert(result.message);

    document.getElementById("cart-count").innerText++;
}

function searchfood() {
    let input = document.getElementById("search").value.toLowerCase();
    let cards = document.querySelectorAll(".food-card");

    cards.forEach(card => {
        let name = card.querySelector("h3").innerText.toLowerCase();

        if (name.includes(input)) {
            card.style.display = "block";
        } else {
            card.style.display = "none";
        }
    });
}

fetch("http://localhost:5000/foods")
.then(res => res.json())
.then(data => {

    let output = "";

    data.forEach(food => {
        output += `
        <div class="food-card">
            <img src="${food.image}" alt="${food.name}">
            <h3>${food.name}</h3>
            <p>Price: ₹${food.price}</p>
            <button onclick="addToCart('${food.name}', ${food.price})">
                Add To Cart
            </button>
        </div>
        `;
    });

    document.getElementById("food-list").innerHTML = output;
})
.catch(err => console.log(err));