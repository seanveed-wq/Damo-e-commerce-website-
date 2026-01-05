import { db, auth } from './Firebase-config.js';
import { collection, getDocs, addDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

let cart = [];

// 1. Database se Products dikhane ka function
async function loadProductsFromDB() {
    const display = document.getElementById('product-display');
    if(!display) return;
    
    display.innerHTML = "<p style='color:white; text-align:center;'>Loading Spotlight...</p>";

    try {
        const querySnapshot = await getDocs(collection(db, "Product"));
        display.innerHTML = ""; 
        
        querySnapshot.forEach((doc) => {
            const p = doc.data();
            display.innerHTML += `
                <div class="p-card" onclick="addToBag('${p.name}', ${p.price})">
                    <img src="${p.img}" alt="${p.name}">
                    <div class="p-info">
                        <h4>${p.name}</h4>
                        <p>${p.category || 'Basketball'}</p>
                        <strong>$${p.price}</strong>
                    </div>
                </div>
            `;
        });
    } catch (error) {
        console.error("Error: ", error);
    }
}

// 2. Cart mein cheezain add karna
window.addToBag = function(name, price) {
    cart.push({ name, price });
    document.getElementById('cart-count').innerText = cart.length;
    updateSummary();
    document.getElementById('checkout').scrollIntoView({behavior: 'smooth'});
}

function updateSummary() {
    const list = document.getElementById('cart-items');
    let total = 0;
    list.innerHTML = "";
    cart.forEach(i => {
        total += Number(i.price);
        list.innerHTML += `<p>⚡ ${i.name} - $${i.price}</p>`;
    });
    document.getElementById('grand-total').innerText = "$" + total;
}

// 3. Order confirm karke Database mein save karna
window.orderNow = async function() {
    const user = auth.currentUser;
    if (!user) {
        alert("Please Sign In first!");
        window.location.href = "login.html";
        return;
    }
    if (cart.length === 0) return alert("Bag is empty!");

    try {
        await addDoc(collection(db, "Orders"), {
            email: user.email,
            items: cart,
            total: document.getElementById('grand-total').innerText,
            date: new Date()
        });
        alert("Order Placed!");
        cart = [];
        updateSummary();
        document.getElementById('cart-count').innerText = "0";
    } catch (e) { alert("Error placing order."); }
}

window.onload = loadProductsFromDB;
                             
