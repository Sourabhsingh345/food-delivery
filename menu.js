let menu = document.getElementById("menu");

fetch("http://localhost:5000/foods")

.then(res => res.json())

.then(data => {

    data.forEach(food => {

        menu.innerHTML += `

        <div class="food-card">

        <img src="http://localhost:5000${food.image}" width="200">

        <h2>${food.name}</h2>

        <p>${food.description}</p>

        <h3>₹${food.price}</h3>

        <button onclick="addToCart('${food.name}',${food.price},'${food.image}')">

        Add To Cart

        </button>

        </div>

        `;

    });

});

async function addToCart(name, price,image){

    const item={

        userEmail:"sourabh@gmail.com",
        foodName:name,
        price:price,
        image: image,
        quantity:1

    };

    const response=await fetch("http://localhost:5000/cart/add",{

        method:"POST",

        headers:{
            "Content-Type":"application/json"
        },

        body:JSON.stringify(item)

    });

    const result=await response.json();

    alert(result.message);

}