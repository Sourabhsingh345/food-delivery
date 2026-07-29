// Global states
let orderId = null;
let currentStatus = "Order Placed";
const statuses = ["Order Placed", "Preparing", "Out for Delivery", "Delivered"];
let autoSimInterval = null;

// Initialize on window load
window.onload = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    orderId = urlParams.get('id');

    if (!orderId) {
        // Fallback: Fetch latest order if no ID specified in URL
        try {
            const response = await fetch("http://localhost:5000/orders");
            const orders = await response.json();
            if (orders && orders.length > 0) {
                // Get the latest order
                const latestOrder = orders[orders.length - 1];
                orderId = latestOrder._id;
                window.history.replaceState(null, null, `?id=${orderId}`);
            } else {
                showErrorMessage("No orders found to track. Please place an order first!");
                return;
            }
        } catch (err) {
            showErrorMessage("Error fetching orders. Make sure the backend server is running.");
            return;
        }
    }

    document.getElementById("tracking-order-id").innerText = orderId;
    await fetchOrderDetails();
    
    // Auto refresh status every 5 seconds from database
    setInterval(fetchOrderDetails, 5000);
};

// Fetch order details from server
async function fetchOrderDetails() {
    if (!orderId) return;

    try {
        const response = await fetch(`http://localhost:5000/order/${orderId}`);
        if (!response.ok) {
            throw new Error("Order not found");
        }
        const order = await response.json();

        // Populate summary
        document.getElementById("summary-name").innerText = order.name || "N/A";
        document.getElementById("summary-phone").innerText = order.phone || "N/A";
        document.getElementById("summary-address").innerText = order.address || "N/A";
        document.getElementById("summary-payment").innerText = order.payment || "COD";
        document.getElementById("summary-total").innerText = `₹${order.total || 0}`;

        // Update tracking status
        if (order.status) {
            currentStatus = order.status;
            updateTrackingUI(currentStatus);
        }
    } catch (err) {
        console.error("Error fetching order details:", err);
    }
}

// Update the tracking screen elements (timeline and simulation map)
function updateTrackingUI(status) {
    const statusIdx = statuses.indexOf(status);
    if (statusIdx === -1) return;

    // 1. Timeline Steps Updating
    const timelineSteps = ["step-placed", "step-preparing", "step-transit", "step-delivered"];
    
    timelineSteps.forEach((stepId, index) => {
        const element = document.getElementById(stepId);
        if (!element) return;

        // Reset classes
        element.classList.remove("active", "completed");
        const iconContainer = element.querySelector(".timeline-icon");
        
        if (index < statusIdx) {
            // Completed steps
            element.classList.add("completed");
            if (iconContainer) iconContainer.innerHTML = `<i class="fa-solid fa-check"></i>`;
        } else if (index === statusIdx) {
            // Active step
            element.classList.add("active");
            if (iconContainer) {
                if (status === "Delivered") {
                    iconContainer.innerHTML = `<i class="fa-solid fa-house-chimney"></i>`;
                } else if (status === "Out for Delivery") {
                    iconContainer.innerHTML = `<i class="fa-solid fa-motorcycle"></i>`;
                } else if (status === "Preparing") {
                    iconContainer.innerHTML = `<i class="fa-solid fa-fire-burner"></i>`;
                } else {
                    iconContainer.innerHTML = `<i class="fa-solid fa-receipt"></i>`;
                }
            }
        } else {
            // Pending steps
            if (iconContainer) iconContainer.innerHTML = `<i class="fa-solid fa-ellipsis"></i>`;
        }
    });

    // 2. Simulation Map Node Highlight
    const mapNodes = ["node-placed-map", "node-preparing-map", "node-transit-map", "node-delivered-map"];
    mapNodes.forEach((nodeId, index) => {
        const node = document.getElementById(nodeId);
        if (node) {
            if (index <= statusIdx) {
                node.classList.add("active");
            } else {
                node.classList.remove("active");
            }
        }
    });

    // 3. Move Delivery Boy Icon & Progress Line
    const deliveryBoy = document.getElementById("delivery-boy");
    const progressLine = document.getElementById("delivery-track-progress");

    let percentage = 0;
    if (statusIdx === 0) percentage = 0;
    else if (statusIdx === 1) percentage = 33;
    else if (statusIdx === 2) percentage = 66;
    else if (statusIdx === 3) percentage = 100;

    if (progressLine) {
        progressLine.style.width = `${percentage}%`;
    }

    if (deliveryBoy) {
        deliveryBoy.style.left = `calc(${percentage}% - 20px)`;
        // If delivered, change boy icon to house or check
        if (status === "Delivered") {
            deliveryBoy.innerHTML = `<i class="fa-solid fa-circle-check" style="color: #2ecc71;"></i>`;
        } else {
            deliveryBoy.innerHTML = `<i class="fa-solid fa-motorcycle"></i>`;
        }
    }

    // Hide or show delivery driver info card
    const driverCard = document.getElementById("driver-details");
    if (driverCard) {
        if (statusIdx >= 2) {
            // Out for delivery or delivered
            driverCard.style.display = "block";
            if (status === "Delivered") {
                document.getElementById("driver-name").innerText = "Ramesh Kumar (Order Delivered)";
            } else {
                document.getElementById("driver-name").innerText = "Ramesh Kumar (On the way)";
            }
        } else {
            driverCard.style.display = "none";
        }
    }
}

// Update state on backend (simulate)
async function updateSimulatedStatus(newStatus) {
    if (!orderId) return;

    try {
        const response = await fetch(`http://localhost:5000/order/${orderId}/status`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ status: newStatus })
        });
        const result = await response.json();
        if (result.success) {
            currentStatus = newStatus;
            updateTrackingUI(currentStatus);
            triggerToast(`Status updated to: ${newStatus}`);
        }
    } catch (err) {
        console.error("Error updating status:", err);
    }
}

// Auto Simulation toggle
function toggleAutoSimulation() {
    const btn = document.getElementById("auto-sim-btn");
    
    if (autoSimInterval) {
        // Stop
        clearInterval(autoSimInterval);
        autoSimInterval = null;
        btn.innerText = "🚀 Start Auto Simulation";
        btn.classList.remove("running");
        triggerToast("Auto simulation stopped");
    } else {
        // Start
        btn.innerText = "⏸️ Stop Auto Simulation";
        btn.classList.add("running");
        triggerToast("Auto simulation started (10s intervals)");

        autoSimInterval = setInterval(() => {
            let nextIndex = statuses.indexOf(currentStatus) + 1;
            if (nextIndex >= statuses.length) {
                nextIndex = 0; // Loop back
            }
            updateSimulatedStatus(statuses[nextIndex]);
        }, 10000);
    }
}

function showErrorMessage(msg) {
    const container = document.querySelector(".tracking-container");
    if (container) {
        container.innerHTML = `
            <div style="text-align: center; padding: 50px 20px;">
                <i class="fa-solid fa-triangle-exclamation" style="font-size: 48px; color: #e74c3c; margin-bottom: 20px;"></i>
                <h2>Oops!</h2>
                <p>${msg}</p>
                <button onclick="window.location.href='index.html'" style="margin-top: 20px; padding: 10px 20px; background: #ff9800; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold;">
                    Go to Home
                </button>
            </div>
        `;
    }
}

// Fallback toast helper
function triggerToast(message) {
    if (typeof showToast === 'function') {
        showToast(message);
    } else {
        alert(message);
    }
}
