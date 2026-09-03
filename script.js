/* =========================================================
   CYBERSHIELD
   FIREBASE WEBSITE SYSTEM
   ========================================================= */


/* =========================================================
   FIREBASE IMPORTS
   ========================================================= */

import { initializeApp }
    from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";

import {
    getAuth,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

import {
    getFirestore,
    doc,
    getDoc,
    setDoc,
    updateDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";


/* =========================================================
   FIREBASE CONFIGURATION
   ========================================================= */

const firebaseConfig = {

    apiKey:
        "AIzaSyCo_vnOuL8nvp8h19kLOa7mwavfCZzMh4c",

    authDomain:
        "cybershield-e8a26.firebaseapp.com",

    databaseURL:
        "https://cybershield-e8a26-default-rtdb.firebaseio.com",

    projectId:
        "cybershield-e8a26",

    storageBucket:
        "cybershield-e8a26.firebasestorage.app",

    messagingSenderId:
        "1002371028740",

    appId:
        "1:1002371028740:web:5a25efcadfc34dccc16251",

    measurementId:
        "G-X15TERYW4F"

};


/* =========================================================
   INITIALIZE FIREBASE
   ========================================================= */

const app =
    initializeApp(firebaseConfig);

const auth =
    getAuth(app);

const db =
    getFirestore(app);


/* =========================================================
   AUTHENTICATION PROTECTION
   =========================================================

   If the participant is NOT logged in:
   index.html -> login.html

   If logged in:
   allow website to open.
   ========================================================= */

onAuthStateChanged(
    auth,
    async (user) => {

        if (!user) {

            window.location.replace(
                "login.html"
            );

            return;
        }


        console.log(
            "CyberShield user logged in:",
            user.email
        );


        /*
         Update last login time
        */

        try {

            const userRef =
                doc(
                    db,
                    "users",
                    user.uid
                );


            await setDoc(
                userRef,
                {

                    uid:
                        user.uid,

                    email:
                        user.email || "",

                    name:
                        user.displayName ||
                        "CyberShield User",

                    photoURL:
                        user.photoURL || "",

                    lastLogin:
                        serverTimestamp()

                },
                {
                    merge: true
                }
            );


        } catch (error) {

            console.error(
                "Could not update user:",
                error
            );

        }

    }
);


/* =========================================================
   MOBILE NAVIGATION
   ========================================================= */

const menuButton =
    document.getElementById(
        "menuButton"
    );

const navLinks =
    document.getElementById(
        "navLinks"
    );


if (menuButton && navLinks) {

    menuButton.addEventListener(
        "click",
        () => {

            navLinks.classList.toggle(
                "active"
            );

        }
    );


    document
        .querySelectorAll(".nav-links a")
        .forEach(
            link => {

                link.addEventListener(
                    "click",
                    () => {

                        navLinks.classList.remove(
                            "active"
                        );

                    }
                );

            }
        );

}


/* =========================================================
   SCROLL REVEAL
   ========================================================= */

const revealElements =
    document.querySelectorAll(
        ".reveal"
    );


function revealOnScroll() {

    const windowHeight =
        window.innerHeight;


    revealElements.forEach(
        element => {

            const elementTop =
                element
                    .getBoundingClientRect()
                    .top;


            if (
                elementTop <
                windowHeight - 80
            ) {

                element.classList.add(
                    "active"
                );

            }

        }
    );

}


window.addEventListener(
    "scroll",
    revealOnScroll
);

revealOnScroll();


/* =========================================================
   QUIZ DATA
   ========================================================= */

const quizQuestions = [

    {
        question:
            "You receive an unexpected message asking you to click a link and verify your bank account. What should you do?",

        options: [

            "Click immediately",

            "Send your password",

            "Verify the message and sender independently",

            "Forward it to friends"

        ],

        answer: 2
    },


    {
        question:
            "Which password is generally the strongest?",

        options: [

            "password123",

            "aniket2005",

            "12345678",

            "A long, unique password"

        ],

        answer: 3
    },


    {
        question:
            "What is the main benefit of Multi-Factor Authentication?",

        options: [

            "It provides an additional verification layer",

            "It increases internet speed",

            "It removes all malware",

            "It gives free cloud storage"

        ],

        answer: 0
    },


    {
        question:
            "What should you do if you suspect that your online account has been compromised?",

        options: [

            "Ignore the problem",

            "Change the password and secure the account",

            "Share the password with a friend",

            "Delete all evidence"

        ],

        answer: 1
    },


    {
        question:
            "What is India's cybercrime helpline number?",

        options: [

            "100",

            "101",

            "1930",

            "108"

        ],

        answer: 2
    }

];


let currentQuestion = 0;

let quizScore = 0;


/* =========================================================
   QUIZ ELEMENTS
   ========================================================= */

const quizQuestion =
    document.getElementById(
        "quizQuestion"
    );

const quizOptions =
    document.getElementById(
        "quizOptions"
    );

const questionCounter =
    document.getElementById(
        "questionCounter"
    );

const quizScoreElement =
    document.getElementById(
        "quizScore"
    );

const quizProgressBar =
    document.getElementById(
        "quizProgressBar"
    );

const quizArea =
    document.getElementById(
        "quizArea"
    );

const quizResult =
    document.getElementById(
        "quizResult"
    );

const finalScore =
    document.getElementById(
        "finalScore"
    );

const resultMessage =
    document.getElementById(
        "resultMessage"
    );

const restartQuiz =
    document.getElementById(
        "restartQuiz"
    );


/* =========================================================
   LOAD QUIZ QUESTION
   ========================================================= */

function loadQuestion() {

    if (!quizQuestion) {
        return;
    }


    const question =
        quizQuestions[currentQuestion];


    questionCounter.textContent =
        `QUESTION ${currentQuestion + 1} / ${quizQuestions.length}`;


    quizScoreElement.textContent =
        `SCORE: ${quizScore}`;


    const progress =
        (
            (currentQuestion + 1)
            /
            quizQuestions.length
        ) * 100;


    quizProgressBar.style.width =
        `${progress}%`;


    quizQuestion.textContent =
        question.question;


    quizOptions.innerHTML =
        "";


    question.options.forEach(
        (option, index) => {

            const button =
                document.createElement(
                    "button"
                );


            button.className =
                "quiz-option";


            button.textContent =
                option;


            button.addEventListener(
                "click",
                () => {

                    selectAnswer(
                        index,
                        button
                    );

                }
            );


            quizOptions.appendChild(
                button
            );

        }
    );

}


/* =========================================================
   SAVE QUIZ PROGRESS TO FIRESTORE
   ========================================================= */

async function saveQuizProgress(
    score,
    completed
) {

    const user =
        auth.currentUser;


    if (!user) {

        console.log(
            "No logged-in user."
        );

        return;

    }


    try {

        const userRef =
            doc(
                db,
                "users",
                user.uid
            );


        await setDoc(
            userRef,
            {

                uid:
                    user.uid,

                email:
                    user.email || "",

                name:
                    user.displayName ||
                    "CyberShield User",

                quizScore:
                    score,

                quizTotal:
                    quizQuestions.length,

                quizCompleted:
                    completed,

                quizProgress:
                    Math.round(
                        (
                            score /
                            quizQuestions.length
                        ) * 100
                    ),

                lastQuizUpdate:
                    serverTimestamp()

            },
            {
                merge: true
            }
        );


        console.log(
            "Quiz progress saved to Firestore."
        );


    } catch (error) {

        console.error(
            "Quiz save error:",
            error
        );

    }

}


/* =========================================================
   SELECT ANSWER
   ========================================================= */

function selectAnswer(
    selectedAnswer,
    selectedButton
) {

    const question =
        quizQuestions[currentQuestion];


    const buttons =
        document.querySelectorAll(
            ".quiz-option"
        );


    buttons.forEach(
        button => {

            button.disabled =
                true;

        }
    );


    if (
        selectedAnswer ===
        question.answer
    ) {

        selectedButton.classList.add(
            "correct"
        );

        quizScore++;

    } else {

        selectedButton.classList.add(
            "wrong"
        );


        if (
            buttons[
                question.answer
            ]
        ) {

            buttons[
                question.answer
            ].classList.add(
                "correct"
            );

        }

    }


    quizScoreElement.textContent =
        `SCORE: ${quizScore}`;


    setTimeout(
        () => {

            currentQuestion++;


            if (
                currentQuestion <
                quizQuestions.length
            ) {

                loadQuestion();

            } else {

                showQuizResult();

            }

        },
        900
    );

}


/* =========================================================
   SHOW QUIZ RESULT
   ========================================================= */

async function showQuizResult() {

    quizArea.style.display =
        "none";


    quizResult.style.display =
        "block";


    finalScore.textContent =
        `You Scored ${quizScore}/${quizQuestions.length}`;


    if (quizScore === 5) {

        resultMessage.textContent =
            "Excellent! You are highly cyber-aware.";

    }

    else if (quizScore >= 3) {

        resultMessage.textContent =
            "Great work! Keep improving your cyber-safety habits.";

    }

    else {

        resultMessage.textContent =
            "Good start! Review the prevention tips and try again.";

    }


    /*
       SAVE RESULT
    */

    await saveQuizProgress(
        quizScore,
        true
    );

}


/* =========================================================
   RESTART QUIZ
   ========================================================= */

if (restartQuiz) {

    restartQuiz.addEventListener(
        "click",
        async () => {

            currentQuestion =
                0;

            quizScore =
                0;


            quizArea.style.display =
                "block";


            quizResult.style.display =
                "none";


            await saveQuizProgress(
                0,
                false
            );


            loadQuestion();

        }
    );

}


/* =========================================================
   START QUIZ
   ========================================================= */

loadQuestion();


/* =========================================================
   REGISTRATION FORM
   ========================================================= */

const registrationForm =
    document.getElementById(
        "registrationForm"
    );

const formMessage =
    document.getElementById(
        "formMessage"
    );


if (registrationForm) {

    registrationForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            const user =
                auth.currentUser;


            /*
               Safety check
            */

            if (!user) {

                showFormMessage(
                    "Please login before registering.",
                    "error"
                );


                setTimeout(
                    () => {

                        window.location.href =
                            "login.html";

                    },
                    1200
                );


                return;

            }


            const name =
                document
                    .getElementById("name")
                    .value
                    .trim();


            const email =
                document
                    .getElementById("email")
                    .value
                    .trim();


            const phone =
                document
                    .getElementById("phone")
                    .value
                    .trim();


            const role =
                document
                    .getElementById("role")
                    .value;


            const message =
                document
                    .getElementById("message")
                    .value
                    .trim();


            const agreement =
                document
                    .getElementById("agreement")
                    .checked;


            if (
                !name ||
                !email ||
                !phone ||
                !role
            ) {

                showFormMessage(
                    "Please complete all required fields.",
                    "error"
                );

                return;

            }


            if (!agreement) {

                showFormMessage(
                    "Please accept the participation agreement.",
                    "error"
                );

                return;

            }


            const submitButton =
                registrationForm.querySelector(
                    ".submit-button"
                );


            if (submitButton) {

                submitButton.disabled =
                    true;

                submitButton.textContent =
                    "Submitting...";

            }


            try {

                /*
                   Save registration
                   inside the participant's
                   Firebase document.
                */

                const userRef =
                    doc(
                        db,
                        "users",
                        user.uid
                    );


                await setDoc(
                    userRef,
                    {

                        uid:
                            user.uid,

                        accountEmail:
                            user.email || "",

                        name:
                            name,

                        email:
                            email,

                        phone:
                            phone,

                        participantType:
                            role,

                        learningInterest:
                            message,

                        workshopRegistered:
                            true,

                        registrationDate:
                            serverTimestamp(),

                        registrationStatus:
                            "Registered"

                    },
                    {
                        merge: true
                    }
                );


                /*
                   Also create a separate
                   registration document.
                */

                const registrationRef =
                    doc(
                        db,
                        "workshopRegistrations",
                        user.uid
                    );


                await setDoc(
                    registrationRef,
                    {

                        userId:
                            user.uid,

                        name:
                            name,

                        email:
                            email,

                        phone:
                            phone,

                        role:
                            role,

                        message:
                            message,

                        status:
                            "Registered",

                        submittedAt:
                            serverTimestamp()

                    },
                    {
                        merge: true
                    }
                );


                showFormMessage(
                    `✅ Thank you, ${name}! Your workshop registration has been saved successfully.`,
                    "success"
                );


                registrationForm.reset();


            } catch (error) {

                console.error(
                    "Registration error:",
                    error
                );


                showFormMessage(
                    "Unable to save registration. Please try again.",
                    "error"
                );

            }


            if (submitButton) {

                submitButton.disabled =
                    false;

                submitButton.innerHTML =
                    "<span>🛡️</span> Submit Registration";

            }

        }
    );

}


/* =========================================================
   FORM MESSAGE
   ========================================================= */

function showFormMessage(
    message,
    type
) {

    if (!formMessage) {
        return;
    }


    formMessage.style.display =
        "block";


    formMessage.textContent =
        message;


    if (type === "error") {

        formMessage.style.color =
            "#fda4af";

        formMessage.style.background =
            "rgba(251, 65, 104, 0.08)";

        formMessage.style.borderColor =
            "rgba(251, 65, 104, 0.25)";

    }

    else {

        formMessage.style.color =
            "#86efac";

        formMessage.style.background =
            "rgba(34, 197, 94, 0.08)";

        formMessage.style.borderColor =
            "rgba(34, 197, 94, 0.25)";

    }


    setTimeout(
        () => {

            formMessage.style.display =
                "none";

        },
        5000
    );

}


/* =========================================================
   CURRENT YEAR
   ========================================================= */

const currentYear =
    document.getElementById(
        "currentYear"
    );


if (currentYear) {

    currentYear.textContent =
        new Date().getFullYear();

}


/* =========================================================
   NAVBAR BACKGROUND ON SCROLL
   ========================================================= */

const navbar =
    document.querySelector(
        ".navbar"
    );


if (navbar) {

    window.addEventListener(
        "scroll",
        () => {

            if (
                window.scrollY > 50
            ) {

                navbar.style.background =
                    "rgba(5, 0, 15, 0.94)";

            }

            else {

                navbar.style.background =
                    "rgba(5, 0, 15, 0.78)";

            }

        }
    );

}


/* =========================================================
   PHONE VALIDATION
   ========================================================= */

const phoneInput =
    document.getElementById(
        "phone"
    );


if (phoneInput) {

    phoneInput.addEventListener(
        "input",
        () => {

            phoneInput.value =
                phoneInput.value.replace(
                    /[^0-9+\-\s]/g,
                    ""
                );

        }
    );

}


/* =========================================================
   EMAIL VALIDATION
   ========================================================= */

const emailInput =
    document.getElementById(
        "email"
    );


if (emailInput) {

    emailInput.addEventListener(
        "blur",
        () => {

            const emailPattern =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


            if (
                emailInput.value &&
                !emailPattern.test(
                    emailInput.value
                )
            ) {

                emailInput.style.borderColor =
                    "#fb4168";

            }

            else {

                emailInput.style.borderColor =
                    "";

            }

        }
    );

}


/* =========================================================
   CONSOLE
   ========================================================= */

console.log(
    "%cCYBERSHIELD",
    "color:#22d3ee;font-size:24px;font-weight:bold;"
);

console.log(
    "%cFirebase participant tracking active.",
    "color:#a855f7;font-size:14px;"
);