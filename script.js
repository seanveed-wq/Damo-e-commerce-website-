import { db } from './Firebase-config.js';
import { collection, getDocs, addDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

let cart = [];
let currentCategory = "All";

const display = document.getElementById("product-display");

// Load products from Firebase
async function loadProducts() {
  const snap = await getDocs(collection(db,"Product"));
  display.innerHTML = "";
  snap.forEach(doc=>{
    const p = doc.data();
    if(currentCategory==="All" || p.category===currentCategory){
      display.innerHTML += `
      <div class="p-card" onclick="addToBag('${p.name}',${p.price})">
        <img src="${p.img}">
        <div class="p-info">
          <h4>${p.name}</h4>
          <strong>$${p.price}</strong>
          <small>${p.category}</small>
        </div>
      </div>`;
    }
  });
}

window.filterCategory = (cat) => {
  currentCategory = cat;
  loadProducts();
}

// Cart Logic
window.addToBag = function(name, price){
  cart.push({name, price});
  document.getElementById('cart-count').innerText = cart.length;
  updateSummary();
}

function updateSummary(){
  const list = document.getElementById('cart-items');
  let total = 0;
  list.innerHTML = "";
  cart.forEach(i=>{
    total += Number(i.price);
    list.innerHTML += `<p>⚡ ${i.name} - $${i.price}</p>`;
  });
  document.getElementById('grand-total').innerText = "$" + total;
}

// Simple order function (COD)
window.orderNow = function(){
  if(cart.length===0){ alert("Cart is empty!"); return; }
  alert("Order confirmed! COD");
  cart=[]; updateSummary(); document.getElementById('cart-count').innerText=0;
}

window.onload = loadProducts;
