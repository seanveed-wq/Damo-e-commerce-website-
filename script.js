// --- 1. Cart & Product Logic ---
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
    const checkoutSection = document.getElementById('checkout');
    if(checkoutSection) checkoutSection.scrollIntoView({behavior: 'smooth'});
}

function updateSummary() {
    const list = document.getElementById('cart-items');
    let total = 0;
    if(!list) return;
    
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

// --- 2. Firebase Auth Logic ---

// Registration Function
function handleSignUp(event) {
    event.preventDefault(); 
    
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;

    firebase.auth().createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
        alert("Registration Successful! Welcome to the Squad.");
        window.location.href = "index.html"; 
    })
    .catch((error) => {
        alert("Error: " + error.message);
    });
}

// Login Function
function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    firebase.auth().signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
        alert("Logged In Successfully!");
        window.location.href = "index.html";
    })
    .catch((error) => {
        alert("Login Failed: " + error.message);
    });
}

// Load products when page opens
window.onload = loadItems;
                                                       
