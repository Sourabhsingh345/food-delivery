function showToast(message, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <span>${message}</span>
        <span style="margin-left: 15px; cursor: pointer; font-weight: bold; font-size: 20px; line-height: 1;" onclick="this.parentElement.remove()">&times;</span>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.3s ease forwards';
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3500);
}

// Override default window.alert with our premium toast notifications
window.alert = function(msg) {
    if (!msg) return;
    let type = 'success';
    let lower = String(msg).toLowerCase();
    if (lower.includes('error') || lower.includes('failed') || lower.includes('invalid') || lower.includes('wrong') || lower.includes('not found')) {
        type = 'error';
    } else if (lower.includes('button clicked') || lower.includes('sent') || lower.includes('requesting')) {
        type = 'info';
    }
    showToast(msg, type);
};
