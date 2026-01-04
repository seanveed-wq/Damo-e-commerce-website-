// Start Firebase
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();

// Signup Function
function signup() {
    const email = document.getElementById("email").value;
    const pass  = document.getElementById("password").value;

    auth.createUserWithEmailAndPassword(email, pass)
    .then(() => {
        document.getElementById("result").innerText = "Signup successful!";
    })
    .catch((error) => {
        document.getElementById("result").innerText = error.message;
    });
}

// Login Function
function login() {
    const email = document.getElementById("email").value;
    const pass  = document.getElementById("password").value;

    auth.signInWithEmailAndPassword(email, pass)
    .then(() => {
        document.getElementById("result").innerText = "Login successful!";
    })
    .catch((error) => {
        document.getElementById("result").innerText = error.message;
    });
}
