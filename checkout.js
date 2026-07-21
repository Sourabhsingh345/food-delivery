async function placeOrder() {

    alert("Button Clicked");

    const data = {
        name: document.getElementById("name").value,
        phone: document.getElementById("phone").value,
        address: document.getElementById("address").value,
        payment: document.getElementById("payment").value,
        total: 0
    };

    try {

        const response = await fetch("http://localhost:5000/order", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        const text = await response.text();
        alert(text);
        console.log(text);     

    } catch (err) {

        alert(err);

    }

}