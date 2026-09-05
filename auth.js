import { auth, db } from "./firebase-config.js";

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

import {
    doc,
    getDoc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";


// ===============================
// FIND USER DATA
// ===============================

async function findUserData(uid) {

    const userRef = doc(db, "users", uid);
    const snapshot = await getDoc(userRef);

    if (snapshot.exists()) {
        return {
            id: snapshot.id,
            data: snapshot.data()
        };
    }

    return null;
}


// ===============================
// FIREBASE ERROR MESSAGE
// ===============================

function firebaseError(error) {

    switch (error.code) {

        case "auth/email-already-in-use":
            return "This email is already registered.";

        case "auth/invalid-email":
            return "Please enter a valid email.";

        case "auth/weak-password":
            return "Password should be at least 6 characters.";

        case "auth/invalid-credential":
        case "auth/wrong-password":
        case "auth/user-not-found":
            return "Invalid email or password.";

        default:
            return error.message;
    }
}


// ===============================
// SIGN UP
// ===============================

const signupForm = document.getElementById("signupForm");

if (signupForm) {

    signupForm.addEventListener("submit", async (e) => {

        e.preventDefault();

        const name =
            document.getElementById("signupName")?.value.trim() ||
            document.getElementById("name")?.value.trim();

        const email =
            document.getElementById("signupEmail")?.value.trim() ||
            document.getElementById("email")?.value.trim();

        const password =
            document.getElementById("signupPassword")?.value ||
            document.getElementById("password")?.value;

        const phone =
            document.getElementById("signupPhone")?.value.trim() ||
            document.getElementById("phone")?.value.trim() ||
            "";

        const institution =
            document.getElementById("signupInstitution")?.value.trim() ||
            document.getElementById("institution")?.value.trim() ||
            "";

        try {

            const userCredential =
                await createUserWithEmailAndPassword(
                    auth,
                    email,
                    password
                );

            const user = userCredential.user;

            await setDoc(doc(db, "users", user.uid), {

                uid: user.uid,
                name: name || "User",
                email: user.email,
                accountEmail: user.email,
                phone: phone,
                institution: institution,

                role: "user",

                provider: "password",

                quizCompleted: false,
                quizScore: 0,
                workshopRegistered: false,

                createdAt: serverTimestamp(),
                lastLogin: serverTimestamp()

            });

            alert("Account created successfully!");

            window.location.href = "index.html";

        } catch (error) {

            alert(firebaseError(error));

        }

    });
}


// ===============================
// LOGIN
// ===============================

const loginForm = document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", async (e) => {

        e.preventDefault();

        const email =
            document.getElementById("loginEmail")?.value.trim() ||
            document.getElementById("email")?.value.trim();

        const password =
            document.getElementById("loginPassword")?.value ||
            document.getElementById("password")?.value;

        try {

            const userCredential =
                await signInWithEmailAndPassword(
                    auth,
                    email,
                    password
                );

            const user = userCredential.user;

            const userData = await findUserData(user.uid);

            if (userData) {

                await setDoc(
                    doc(db, "users", user.uid),
                    {
                        lastLogin: serverTimestamp()
                    },
                    { merge: true }
                );

                if (userData.data.role === "admin") {

                    window.location.href = "admin.html";

                } else {

                    window.location.href = "index.html";

                }

            } else {

                alert("User profile not found.");

            }

        } catch (error) {

            alert(firebaseError(error));

        }

    });
}


// ===============================
// SHOW USER IN NAVBAR
// ===============================

onAuthStateChanged(auth, async (user) => {

    const userArea = document.getElementById("userArea");

    if (!userArea) return;


    // USER IS LOGGED IN
    if (user) {

        try {

            const userData = await findUserData(user.uid);

            const name =
                userData?.data?.name ||
                user.displayName ||
                user.email.split("@")[0];


            userArea.innerHTML = `

                <a href="profile.html" class="profile-link">
                    <span class="profile-icon">👤</span>
                    <span>${name}</span>
                </a>

                <button id="logoutButton">
                    Logout
                </button>

            `;


            // LOGOUT
            const logoutButton =
                document.getElementById("logoutButton");

            if (logoutButton) {

                logoutButton.addEventListener("click", async () => {

                    try {

                        await signOut(auth);

                        window.location.href = "index.html";

                    } catch (error) {

                        console.error("Logout error:", error);

                    }

                });

            }

        } catch (error) {

            console.error(
                "Error loading user profile:",
                error
            );

        }

    }

    // USER IS NOT LOGGED IN
    else {

        userArea.innerHTML = `

            <a href="login.html" class="auth-link">
                Login
            </a>

            <a href="signup.html" class="auth-link">
                Sign Up
            </a>

        `;

    }

});


// ===============================
// GLOBAL LOGOUT FUNCTION
// ===============================

window.logoutUser = async function () {

    try {

        await signOut(auth);

        window.location.href = "index.html";

    } catch (error) {

        console.error(error);

    }

};
