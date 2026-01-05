let cart = [];

function loadItems() {
    const display = document.getElementById('product-display');
    if(!display) return;
    products.forEach(p => {
        display.innerHTML += `
            <div class="p-card" onclick="addToBag(${p.id})">
                <img src="${p.img}">
                <div class="p-info">
                    <h4>${p.name}</h4>
                    <p>${p.category}</p>
                    <strong>$${p.price}</strong>
                </div>
            </div>`;
    });
}

function addToBag(id) {
    const item = products.find(x => x.id === id);
    cart.push(item);
    document.getElementById('cart-count').innerText = cart.length;
    updateSummary();
}

function updateSummary() {
    const list = document.getElementById('cart-items');
    let total = 0;
    list.innerHTML = "";
    cart.forEach(i => {
        total += i.price;
        list.innerHTML += `<p>⚡ ${i.name} - $${i.price}</p>`;
    });
    document.getElementById('grand-total').innerText = "$" + total;
}

function handleSignUp(event) {
    event.preventDefault();
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    firebase.auth().createUserWithEmailAndPassword(email, password)
    .then(() => { alert("Success! Welcome to Kobe Elite."); window.location.href="index.html"; })
    .catch(err => alert(err.message));
}

window.onload = loadItems;
