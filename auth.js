import { auth, db } from "./firebase-config.js";

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

import {
    collection,
    getDocs,
    doc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";


// ======================================================
// FIND USER FROM FIRESTORE
// ======================================================

async function findUserData(uid) {

    const snapshot = await getDocs(
        collection(db, "users")
    );

    for (const userDoc of snapshot.docs) {

        const data = userDoc.data();

        // Existing users
        // where UID is stored inside the document
        if (data.uid === uid) {

            return {
                id: userDoc.id,
                data: data
            };
        }

        // New users
        // where document ID is the UID
        if (userDoc.id === uid) {

            return {
                id: userDoc.id,
                data: data
            };
        }
    }

    return null;
}


// ======================================================
// FIREBASE ERROR
// ======================================================

function firebaseError(error) {

    console.error("Firebase Error:", error);

    switch (error.code) {

        case "auth/invalid-credential":
            return "Invalid email or password.";

        case "auth/user-not-found":
            return "Account not found.";

        case "auth/wrong-password":
            return "Incorrect password.";

        case "auth/email-already-in-use":
            return "This email is already registered.";

        case "auth/invalid-email":
            return "Please enter a valid email.";

        case "auth/weak-password":
            return "Password must be at least 6 characters.";

        default:
            return "Firebase Error: " + error.code;
    }
}


// ======================================================
// SIGN UP
// ======================================================

const signupForm =
    document.getElementById("signupForm");

if (signupForm) {

    signupForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            try {

                const name =
                    document.getElementById("signupName")?.value.trim()
                    ||
                    document.getElementById("name")?.value.trim()
                    ||
                    "";

                const email =
                    document.getElementById("signupEmail")?.value.trim()
                    ||
                    document.getElementById("email")?.value.trim()
                    ||
                    "";

                const password =
                    document.getElementById("signupPassword")?.value
                    ||
                    document.getElementById("password")?.value
                    ||
                    "";

                const phone =
                    document.getElementById("signupPhone")?.value.trim()
                    ||
                    document.getElementById("phone")?.value.trim()
                    ||
                    "";

                const institution =
                    document.getElementById("signupInstitution")?.value.trim()
                    ||
                    document.getElementById("institution")?.value.trim()
                    ||
                    "";


                if (!email || !password) {

                    alert(
                        "Please enter email and password."
                    );

                    return;
                }


                // Create Firebase account

                const credential =
                    await createUserWithEmailAndPassword(
                        auth,
                        email,
                        password
                    );

                const user =
                    credential.user;


                // ======================================
                // EVERY NEW ACCOUNT = USER
                // ======================================

                await setDoc(
                    doc(
                        db,
                        "users",
                        user.uid
                    ),
                    {

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
                    }
                );


                alert(
                    "Account created successfully!"
                );


                window.location.href =
                    "index.html";


            } catch (error) {

                alert(
                    firebaseError(error)
                );

            }

        }
    );
}


// ======================================================
// LOGIN
// ======================================================

const loginForm =
    document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            try {

                const email =
                    document.getElementById("loginEmail")?.value.trim()
                    ||
                    document.getElementById("email")?.value.trim()
                    ||
                    "";

                const password =
                    document.getElementById("loginPassword")?.value
                    ||
                    document.getElementById("password")?.value
                    ||
                    "";


                if (!email || !password) {

                    alert(
                        "Please enter email and password."
                    );

                    return;
                }


                // ======================================
                // FIREBASE AUTH LOGIN
                // ======================================

                const credential =
                    await signInWithEmailAndPassword(
                        auth,
                        email,
                        password
                    );


                const firebaseUser =
                    credential.user;


                console.log(
                    "Firebase UID:",
                    firebaseUser.uid
                );


                // ======================================
                // FIND FIRESTORE USER
                // ======================================

                const result =
                    await findUserData(
                        firebaseUser.uid
                    );


                if (!result) {

                    console.error(
                        "No Firestore user found for UID:",
                        firebaseUser.uid
                    );


                    alert(
                        "Your Firebase account exists, but its user profile was not found in Firestore."
                    );

                    return;
                }


                const userData =
                    result.data;


                console.log(
                    "Firestore User:",
                    userData
                );


                // ======================================
                // UPDATE LAST LOGIN
                // ======================================

                await setDoc(
                    doc(
                        db,
                        "users",
                        result.id
                    ),
                    {
                        lastLogin:
                            serverTimestamp()
                    },
                    {
                        merge: true
                    }
                );


                // ======================================
                // ADMIN
                // ======================================

                if (
                    userData.role === "admin"
                ) {

                    console.log(
                        "ADMIN LOGIN"
                    );


                    window.location.href =
                        "admin.html";


                    return;
                }


                // ======================================
                // NORMAL USER
                // ======================================

                console.log(
                    "NORMAL USER LOGIN"
                );


                window.location.href =
                    "index.html";


            } catch (error) {

                console.error(
                    error
                );


                alert(
                    firebaseError(error)
                );

            }

        }
    );
}


// ======================================================
// DISPLAY USER
// ======================================================

onAuthStateChanged(
    auth,
    async function (user) {

        const userArea =
            document.getElementById(
                "userArea"
            );


        if (!userArea) {
            return;
        }


        if (!user) {

            userArea.innerHTML = `
                <a href="login.html">
                    Login
                </a>

                <a href="signup.html">
                    Sign Up
                </a>
            `;

            return;
        }


        try {

            const result =
                await findUserData(
                    user.uid
                );


            const name =
                result?.data?.name
                ||
                user.email;


            userArea.innerHTML = `
                <span>
                    👤 ${name}
                </span>

                <button id="logoutButton">
                    Logout
                </button>
            `;


            const logoutButton =
                document.getElementById(
                    "logoutButton"
                );


            if (logoutButton) {

                logoutButton.addEventListener(
                    "click",
                    async function () {

                        await signOut(
                            auth
                        );

                        window.location.href =
                            "index.html";

                    }
                );

            }

        } catch (error) {

            console.error(
                error
            );

        }

    }
);


// ======================================================
// GLOBAL LOGOUT
// ======================================================

window.logoutUser =
    async function () {

        await signOut(auth);

        window.location.href =
            "index.html";

    };