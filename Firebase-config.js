// Firebase SDKs import karein
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// Aapka configuration data
const firebaseConfig = {
    apiKey: "AIzaSyBN8-fk1vNioM13QCYoHujzbD6Ax4Zb5-U",
    authDomain: "damo-e-commerce-website-6a685.firebaseapp.com",
    projectId: "damo-e-commerce-website-6a685",
    storageBucket: "damo-e-commerce-website-6a685.firebasestorage.app",
    messagingSenderId: "377864917220",
    appId: "1:377864917220:web:8ca3e87c37761bb0b4dcf1",
    measurementId: "G-6P0LN2NBQ5"
};

// Firebase ko initialize karein
const app = initializeApp(firebaseConfig);

// Auth ko export karein taake script.js ise use kar sake
export const auth = getAuth(app);
