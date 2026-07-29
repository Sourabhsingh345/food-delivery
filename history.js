let historyDiv = document.getElementById("history");

fetch("http://localhost:5000/orders")
.then(res => res.json())
.then(data => {

    data.forEach(order => {

        const statusClass = (order.status || 'Order Placed').toLowerCase().replace(/\s+/g, '-');
        historyDiv.innerHTML += `
        <div class="food-card" style="width: 320px; display: inline-block; margin: 15px; text-align: left;">
            <h3>${order.name}</h3>
            <p><b>Phone:</b> ${order.phone}</p>
            <p><b>Address:</b> ${order.address}</p>
            <p><b>Payment:</b> ${order.payment}</p>
            <p><b>Total:</b> ₹${order.total}</p>
            <p><b>Status:</b> <span class="status-badge ${statusClass}">${order.status || 'Order Placed'}</span></p>
            <p><b>Date:</b> ${new Date(order.orderDate).toLocaleString()}</p>
            <button class="track-btn" onclick="window.location.href='track.html?id=${order._id}'" style="margin-top: 12px; width: 100%; padding: 10px; background: linear-gradient(135deg, #ff9800, #ff5722); color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; font-size: 14px; transition: transform 0.2s;">
                Track Order 🛵
            </button>
        </div>
        `;

    });

});

async function deleteAllHistory(){

    await fetch("http://localhost:5000/orders",{
        method:"DELETE"
    });

    alert("Order history cleared successfully!");

    location.reload();

}