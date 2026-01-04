// Cart logic
let cart = [];

function loadItems() {
    const display = document.getElementById('product-display');
    if(!display) return;
    
    products.forEach(p => {
        display.innerHTML += `
            <div class="p-card" onclick="addToBag(${p.id})">
                <img src="${p.img}">
                <div style="padding:10px">
                    <h4>${p.name}</h4>
                    <p style="color:#777">${p.category}</p>
                    <strong>$${p.price}</strong>
                </div>
            </div>
        `;
    });
}

function addToBag(id) {
    const item = products.find(x => x.id === id);
    cart.push(item);
    document.getElementById('cart-count').innerText = cart.length;
    updateSummary();
    // Scroll to checkout automatically
    document.getElementById('checkout').scrollIntoView({behavior: 'smooth'});
}

function updateSummary() {
    const list = document.getElementById('cart-items');
    let total = 0;
    list.innerHTML = "";
    cart.forEach(i => {
        total += i.price;
        list.innerHTML += `<p>${i.name} - $${i.price}</p>`;
    });
    document.getElementById('grand-total').innerText = total;
}

function orderNow() {
    if(cart.length === 0) return alert("Bag is empty");
    alert("Success! Your Cash on Delivery order is placed.");
    cart = [];
    location.reload();
}

window.onload = loadItems;
