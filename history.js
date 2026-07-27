let historyDiv = document.getElementById("history");

fetch("http://localhost:5000/orders")
.then(res => res.json())
.then(data => {

    data.forEach(order => {

        historyDiv.innerHTML += `
        <div class="food-card">
            <h3>${order.name}</h3>
            <p><b>Phone:</b> ${order.phone}</p>
            <p><b>Address:</b> ${order.address}</p>
            <p><b>Payment:</b> ${order.payment}</p>
            <p><b>Total:</b> ₹${order.total}</p>
            <p><b>Date:</b> ${new Date(order.orderDate).toLocaleString()}</p>
        </div>
        `;

    });

});

async function deleteAllHistory(){

    alert("Button Clicked");

    await fetch("http://localhost:5000/orders",{
        method:"DELETE"
    });

    alert("Delete Request Sent");

    location.reload();

}