const API = "https://food-delivery-47zq.onrender.com";

async function placeOrder() {

    const data = {
        name: document.getElementById("name").value,
        phone: document.getElementById("phone").value,
        address: document.getElementById("address").value,
        payment: document.getElementById("payment").value,
        total: Number(localStorage.getItem("totalPrice"))
    };

    try {

        const response = await fetch(`${API}/order`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        alert(result.message);

        if (result.order && result.order._id) {
            window.location.href = `track.html?id=${result.order._id}`;
        } else {
            window.location.href = "history.html";
        }

    } catch (err) {

        alert(err);

    }
}