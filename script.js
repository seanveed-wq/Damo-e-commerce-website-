let cart = [];
const cartCount = document.getElementById('cart-count');
const cartSidebar = document.getElementById('cart-sidebar');
const cartItemsContainer = document.getElementById('cart-items');
const totalPriceDisplay = document.getElementById('total-price');

// Toggle Cart Sidebar
function toggleCart() {
    cartSidebar.classList.toggle('active');
}

// Add to Cart Logic
document.querySelectorAll('.add-to-cart').forEach(button => {
    button.addEventListener('click', () => {
        const card = button.parentElement;
        const id = card.getAttribute('data-id');
        const name = card.getAttribute('data-name');
        const price = parseInt(card.getAttribute('data-price'));

        cart.push({ id, name, price });
        updateCartUI();
    });
});

function updateCartUI() {
    cartCount.innerText = cart.length;
    cartItemsContainer.innerHTML = '';
    let total = 0;

    cart.forEach((item, index) => {
        total += item.price;
        const itemDiv = document.createElement('div');
        itemDiv.style.padding = "10px 0";
        itemDiv.style.borderBottom = "1px solid #222";
        itemDiv.innerHTML = `
            <span>${item.name}</span> - <strong>$${item.price}</strong>
            <button onclick="removeItem(${index})" style="float:right; background:none; border:none; color:red; cursor:pointer">Remove</button>
        `;
        cartItemsContainer.appendChild(itemDiv);
    });

    totalPriceDisplay.innerText = total;
}

function removeItem(index) {
    cart.splice(index, 1);
    updateCartUI();
}

// Cash on Delivery Process
function processPayment() {
    if(cart.length === 0) {
        alert("Your cart is empty!");
        return;
    }
    
    alert("ORDER SUCCESSFUL!\n\nMethod: Cash on Delivery\nTotal Amount: $" + totalPriceDisplay.innerText + "\n\nThank you for shopping at KOBE ELITE!");
    cart = [];
    updateCartUI();
    toggleCart();
                   }
              
