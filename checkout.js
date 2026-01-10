/* =============================================
   CHECKOUT.JS - Checkout Process Management
   ============================================= */

import { 
    auth, 
    db,
    onAuthStateChanged,
    doc,
    addDoc,
    collection,
    serverTimestamp
} from './firebase.js';
import { 
    getCart, 
    clearCart,
    calculateCartTotal,
    formatCurrency
} from './main.js';
import { showNotification, generateOrderId } from './firebase.js';

/* =============================================
   CHECKOUT PAGE INITIALIZATION
   ============================================= */
if (window.location.pathname.includes('checkout.html')) {
    initCheckoutPage();
}

function initCheckoutPage() {
    // Check authentication
    onAuthStateChanged(auth, (user) => {
        if (!user) {
            showNotification('Please login to continue', 'error');
            setTimeout(() => {
                window.location.href = 'login.html?redirect=checkout';
            }, 1500);
            return;
        }
        
        // Check if cart is empty
        const cart = getCart();
        if (cart.length === 0) {
            showNotification('Your cart is empty', 'error');
            setTimeout(() => {
                window.location.href = 'shop.html';
            }, 1500);
            return;
        }
        
        displayCheckoutSummary();
        initCheckoutSteps();
    });
}

/* =============================================
   DISPLAY CHECKOUT SUMMARY
   ============================================= */
function displayCheckoutSummary() {
    const cart = getCart();
    const totals = calculateCartTotal();
    const checkoutItems = document.getElementById('checkoutItems');
    
    if (checkoutItems) {
        checkoutItems.innerHTML = cart.map(item => `
            <div class="checkout-item">
                <div class="checkout-item-image">
                    <img src="${item.image}" alt="${item.name}" 
                         onerror="this.src='images/products/shoe1.jpg'">
                </div>
                <div class="checkout-item-info">
                    <h4>${item.name}</h4>
                    <p>Size: ${item.size} | Qty: ${item.quantity}</p>
                </div>
                <div class="checkout-item-price">
                    ${formatCurrency(item.price * item.quantity)}
                </div>
            </div>
        `).join('');
    }
    
    // Update totals
    document.getElementById('checkoutSubtotal').textContent = formatCurrency(totals.subtotal);
    document.getElementById('checkoutShipping').textContent = formatCurrency(totals.shipping);
    document.getElementById('checkoutTax').textContent = formatCurrency(totals.tax);
    document.getElementById('checkoutTotal').textContent = formatCurrency(totals.total);
}

/* =============================================
   CHECKOUT STEPS MANAGEMENT
   ============================================= */
let checkoutData = {
    shipping: {},
    payment: {},
    items: []
};

function initCheckoutSteps() {
    const shippingForm = document.getElementById('shippingForm');
    const paymentForm = document.getElementById('paymentForm');
    const backToShipping = document.getElementById('backToShipping');
    const backToPayment = document.getElementById('backToPayment');
    const placeOrderBtn = document.getElementById('placeOrder');
    
    // Pre-fill email if user is logged in
    const user = auth.currentUser;
    if (user && document.getElementById('email')) {
        document.getElementById('email').value = user.email;
    }
    
    // Shipping form submission
    if (shippingForm) {
        shippingForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Collect shipping data
            checkoutData.shipping = {
                firstName: document.getElementById('firstName').value,
                lastName: document.getElementById('lastName').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                address: document.getElementById('address').value,
                city: document.getElementById('city').value,
                state: document.getElementById('state').value,
                zip: document.getElementById('zip').value
            };
            
            // Move to payment step
            showStep('payment');
        });
    }
    
    // Payment form submission
    if (paymentForm) {
        paymentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Collect payment data (in production, use a payment gateway)
            const paymentMethod = document.querySelector('input[name="payment"]:checked').value;
            
            checkoutData.payment = {
                method: paymentMethod
            };
            
            if (paymentMethod === 'card') {
                checkoutData.payment.cardNumber = document.getElementById('cardNumber').value.slice(-4);
                checkoutData.payment.cardName = document.getElementById('cardName').value;
            }
            
            // Move to review step
            displayOrderReview();
            showStep('review');
        });
    }
    
    // Back buttons
    if (backToShipping) {
        backToShipping.addEventListener('click', () => {
            showStep('shipping');
        });
    }
    
    if (backToPayment) {
        backToPayment.addEventListener('click', () => {
            showStep('payment');
        });
    }
    
    // Place order button
    if (placeOrderBtn) {
        placeOrderBtn.addEventListener('click', async () => {
            placeOrderBtn.disabled = true;
            placeOrderBtn.textContent = 'Processing...';
            
            try {
                await placeOrder();
            } catch (error) {
                console.error('Error placing order:', error);
                showNotification('Error placing order. Please try again.', 'error');
                placeOrderBtn.disabled = false;
                placeOrderBtn.textContent = 'Place Order';
            }
        });
    }
}

/* =============================================
   SHOW CHECKOUT STEP
   ============================================= */
function showStep(stepName) {
    // Hide all steps
    document.getElementById('shippingStep').style.display = 'none';
    document.getElementById('paymentStep').style.display = 'none';
    document.getElementById('reviewStep').style.display = 'none';
    
    // Show selected step
    if (stepName === 'shipping') {
        document.getElementById('shippingStep').style.display = 'block';
        updateStepIndicators(1);
    } else if (stepName === 'payment') {
        document.getElementById('paymentStep').style.display = 'block';
        updateStepIndicators(2);
    } else if (stepName === 'review') {
        document.getElementById('reviewStep').style.display = 'block';
        updateStepIndicators(3);
    }
}

/* =============================================
   UPDATE STEP INDICATORS
   ============================================= */
function updateStepIndicators(activeStep) {
    const steps = document.querySelectorAll('.step');
    steps.forEach((step, index) => {
        if (index < activeStep) {
            step.classList.add('active');
        } else {
            step.classList.remove('active');
        }
    });
}

/* =============================================
   DISPLAY ORDER REVIEW
   ============================================= */
function displayOrderReview() {
    const reviewShipping = document.getElementById('reviewShipping');
    const reviewPayment = document.getElementById('reviewPayment');
    const reviewItems = document.getElementById('reviewItems');
    
    const cart = getCart();
    
    // Display shipping information
    if (reviewShipping) {
        const s = checkoutData.shipping;
        reviewShipping.innerHTML = `
            <p><strong>${s.firstName} ${s.lastName}</strong></p>
            <p>${s.address}</p>
            <p>${s.city}, ${s.state} ${s.zip}</p>
            <p>Email: ${s.email}</p>
            <p>Phone: ${s.phone}</p>
        `;
    }
    
    // Display payment information
    if (reviewPayment) {
        const p = checkoutData.payment;
        if (p.method === 'card') {
            reviewPayment.innerHTML = `
                <p>Credit/Debit Card</p>
                <p>Card ending in ****${p.cardNumber}</p>
                <p>Name: ${p.cardName}</p>
            `;
        } else {
            reviewPayment.innerHTML = `<p>PayPal</p>`;
        }
    }
    
    // Display order items
    if (reviewItems) {
        reviewItems.innerHTML = cart.map(item => `
            <div class="checkout-item">
                <div class="checkout-item-image">
                    <img src="${item.image}" alt="${item.name}" 
                         onerror="this.src='images/products/shoe1.jpg'">
                </div>
                <div class="checkout-item-info">
                    <h4>${item.name}</h4>
                    <p>Size: ${item.size} | Quantity: ${item.quantity}</p>
                </div>
                <div class="checkout-item-price">
                    ${formatCurrency(item.price * item.quantity)}
                </div>
            </div>
        `).join('');
    }
}

/* =============================================
   PLACE ORDER
   ============================================= */
async function placeOrder() {
    const user = auth.currentUser;
    if (!user) {
        showNotification('Please login to place order', 'error');
        return;
    }
    
    const cart = getCart();
    const totals = calculateCartTotal();
    const orderId = generateOrderId();
    
    const orderData = {
        orderId: orderId,
        userId: user.uid,
        userEmail: user.email,
        shipping: checkoutData.shipping,
        payment: {
            method: checkoutData.payment.method
        },
        items: cart,
        subtotal: parseFloat(totals.subtotal),
        shipping: parseFloat(totals.shipping),
        tax: parseFloat(totals.tax),
        total: parseFloat(totals.total),
        status: 'pending',
        createdAt: serverTimestamp()
    };
    
    try {
        // Save order to Firestore
        await addDoc(collection(db, 'orders'), orderData);
        
        // Clear cart
        clearCart();
        
        // Show success modal
        showOrderConfirmation(orderId);
        
    } catch (error) {
        console.error('Error saving order:', error);
        throw error;
    }
}

/* =============================================
   SHOW ORDER CONFIRMATION
   ============================================= */
function showOrderConfirmation(orderId) {
    const modal = document.getElementById('confirmationModal');
    const orderNumber = document.getElementById('orderNumber');
    
    if (orderNumber) {
        orderNumber.textContent = orderId;
    }
    
    if (modal) {
        modal.classList.add('active');
        
        // Send confirmation email (in production, use a backend service)
        sendOrderConfirmationEmail(orderId);
    }
}

/* =============================================
   SEND ORDER CONFIRMATION EMAIL
   ============================================= */
function sendOrderConfirmationEmail(orderId) {
    // In production, this would trigger a backend function
    // to send an actual email using a service like SendGrid, Mailgun, etc.
    console.log(`Order confirmation email sent for order: ${orderId}`);
}

/* =============================================
   CARD NUMBER FORMATTING
   ============================================= */
const cardNumberInput = document.getElementById('cardNumber');
if (cardNumberInput) {
    cardNumberInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\s/g, '');
        let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
        e.target.value = formattedValue;
    });
}

/* =============================================
   EXPIRY DATE FORMATTING
   ============================================= */
const expiryInput = document.getElementById('expiry');
if (expiryInput) {
    expiryInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length >= 2) {
            value = value.slice(0, 2) + '/' + value.slice(2, 4);
        }
        e.target.value = value;
    });
}

/* =============================================
   CVV FORMATTING
   ============================================= */
const cvvInput = document.getElementById('cvv');
if (cvvInput) {
    cvvInput.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/\D/g, '').slice(0, 3);
    });
}

console.log('Checkout.js loaded successfully');
