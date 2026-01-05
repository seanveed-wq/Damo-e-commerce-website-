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
// --- Firebase Registration Logic ---

function handleSignUp(event) {
    event.preventDefault(); // Page refresh hone se rokta hai
    
    // Form se email aur password lena (Inki IDs login.html mein check karein)
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;

    firebase.auth().createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
        alert("Registration Successful! Welcome to the Squad.");
        window.location.href = "index.html"; // Home page par bhejna
    })
    .catch((error) => {
        alert("Error: " + error.message); // Agar koi ghalti ho (e.g. weak password)
    });
}

// --- Firebase Login Logic ---

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
    
