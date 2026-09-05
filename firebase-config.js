import { initializeApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCo_vnOuL8nvp8h19kLOa7mwavfCZzMh4c",
    authDomain: "cybershield-e8a26.firebaseapp.com",
    databaseURL: "https://cybershield-e8a26-default-rtdb.firebaseio.com",
    projectId: "cybershield-e8a26",
    storageBucket: "cybershield-e8a26.firebasestorage.app",
    messagingSenderId: "1002371028740",
    appId: "1:1002371028740:web:5a25efcadfc34dccc16251",
    measurementId: "G-X15TERYW4F"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };