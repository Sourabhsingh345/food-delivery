let cart = [];

function addToCart(itemName, price) {
    cart.push({ name: itemName, price: price });

    document.getElementById("cart-count").innerText = cart.length;

    localStorage.setItem("cart", JSON.stringify(cart));

    alert(itemName + " added to cart!");
}
function searchFood() {
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

fetch("http://localhost:5000/Foods")
.then(res => res.json())
.then(data => {

    let output = "";

    data.forEach(Food => {
        output += `
        <div class="Food-card">
            <h3>${Food.name}</h3>
            <p>₹${Food.price}</p>
        </div>
        `;
    });

    document.getElementById("Food-list").innerHTML = output;
})
.catch(err => console.log(err));