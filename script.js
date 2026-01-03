let cart = [];

function addToCart(name, price) {
    // 1. Add item to cart
    cart.push({ name, price });
    
    // 2. Update UI
    document.getElementById('cart-count').innerText = cart.length;
    updateOrderSummary();

    // 3. AUTO-REDIRECT to Payment Section
    const checkoutSection = document.getElementById('checkout');
    checkoutSection.scrollIntoView({ behavior: 'smooth' });
}

function updateOrderSummary() {
    const summaryBox = document.getElementById('order-summary');
    let total = 0;
    
    if (cart.length === 0) {
        summaryBox.innerHTML = "<p>Your cart is empty.</p>";
        return;
    }

    let html = "<ul>";
    cart.forEach(item => {
        html += `<li style="display:flex; justify-content:space-between; margin-bottom:10px;">
                    <span>${item.name}</span>
                    <span>$${item.price}</span>
                 </li>`;
        total += item.price;
    });
    html += `</ul><hr style="border:0; border-top:1px solid #333; margin:10px 0;">`;
    html += `<div style="display:flex; justify-content:space-between; font-weight:900;">
                <span>Total</span>
                <span>$${total}.00</span>
             </div>`;
    
    summaryBox.innerHTML = html;
}

function completeOrder() {
    if (cart.length === 0) {
        alert("Please add a shoe to your cart first!");
        return;
    }
    alert("🚀 ORDER PLACED!\nPayment: Cash on Delivery\nThank you for choosing Kobe Elite.");
    cart = [];
    document.getElementById('cart-count').innerText = "0";
    updateOrderSummary();
    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
