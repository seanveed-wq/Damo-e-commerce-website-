<script type="module">
  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-analytics.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyBN8-fk1vNioM13QCYoHujzbD6Ax4Zb5-U",
    authDomain: "damo-e-commerce-website-6a685.firebaseapp.com",
    projectId: "damo-e-commerce-website-6a685",
    storageBucket: "damo-e-commerce-website-6a685.firebasestorage.app",
    messagingSenderId: "377864917220",
    appId: "1:377864917220:web:8ca3e87c37761bb0b4dcf1",
    measurementId: "G-6P0LN2NBQ5"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);
</script>
