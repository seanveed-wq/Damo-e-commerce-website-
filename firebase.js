// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA6GabKbTOKrF5do3O_KVqHi_S7lqq7nas",
  authDomain: "website-83fc1.firebaseapp.com",
  projectId: "website-83fc1",
  storageBucket: "website-83fc1.firebasestorage.app",
  messagingSenderId: "732646646510",
  appId: "1:732646646510:web:af311ae9f06b3d7e51c9ff",
  measurementId: "G-SGGWFY9EGW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
