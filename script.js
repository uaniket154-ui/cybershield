import { auth, db } from "./firebase-config.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

import {
    collection,
    addDoc,
    doc,
    getDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";


// ======================================
// WAIT FOR PAGE
// ======================================

document.addEventListener("DOMContentLoaded", () => {


// ======================================
// MOBILE MENU
// ======================================

const menuButton =
    document.getElementById("menuButton");

const mainNav =
    document.getElementById("mainNav");


if (menuButton && mainNav) {

    menuButton.addEventListener("click", () => {

        mainNav.classList.toggle("active");

        menuButton.textContent =
            mainNav.classList.contains("active")
                ? "✕"
                : "☰";

    });

}


// ======================================
// QUIZ
// ======================================

const questions = [

    {
        question:
            "What should you do if you receive a suspicious link?",

        answers: [
            "Click it immediately",
            "Ignore or verify it first",
            "Forward it to everyone",
            "Enter your password"
        ],

        correct: 1,

        explanation:
            "Do not click suspicious links. Verify the sender and destination first."
    },


    {
        question:
            "Which password is strongest?",

        answers: [
            "12345678",
            "password",
            "MyName123",
            "A long unique password"
        ],

        correct: 3,

        explanation:
            "Use long, unique passwords and avoid easily guessed information."
    },


    {
        question:
            "What is phishing?",

        answers: [
            "A type of computer hardware",
            "A fraudulent attempt to obtain sensitive information",
            "A backup method",
            "A programming language"
        ],

        correct: 1,

        explanation:
            "Phishing uses deceptive messages or websites to trick people into revealing information."
    },


    {
        question:
            "Why is two-factor authentication useful?",

        answers: [
            "It makes passwords shorter",
            "It adds an additional security layer",
            "It removes the need for accounts",
            "It makes websites faster"
        ],

        correct: 1,

        explanation:
            "2FA provides another verification step even if a password is compromised."
    },


    {
        question:
            "What should you do with a suspicious email attachment?",

        answers: [
            "Open it immediately",
            "Download it",
            "Verify it before opening",
            "Send it to friends"
        ],

        correct: 2,

        explanation:
            "Unexpected attachments can contain malicious content. Verify the source first."
    },


    {
        question:
            "What does HTTPS indicate?",

        answers: [
            "The website is always trustworthy",
            "The connection uses encryption",
            "The website cannot contain scams",
            "The website is government-owned"
        ],

        correct: 1,

        explanation:
            "HTTPS encrypts communication between your browser and the website."
    },


    {
        question:
            "Which information should you avoid sharing publicly?",

        answers: [
            "Favorite color",
            "Password or OTP",
            "Favorite movie",
            "General hobby"
        ],

        correct: 1,

        explanation:
            "Never share passwords, OTPs or other sensitive authentication information."
    },


    {
        question:
            "What is ransomware?",

        answers: [
            "A video game",
            "A type of printer",
            "Malware that can lock or encrypt data",
            "A search engine"
        ],

        correct: 2,

        explanation:
            "Ransomware can prevent access to files and demand payment."
    },


    {
        question:
            "What is a safe way to protect your accounts?",

        answers: [
            "Use the same password everywhere",
            "Share passwords with friends",
            "Use unique passwords and 2FA",
            "Write passwords publicly"
        ],

        correct: 2,

        explanation:
            "Unique passwords and multi-factor authentication significantly improve account security."
    },


    {
        question:
            "If you think your account was compromised, what should you do?",

        answers: [
            "Ignore it",
            "Change the password and secure the account",
            "Share the password online",
            "Delete your computer"
        ],

        correct: 1,

        explanation:
            "Change the password, secure the account and report suspicious activity."
    }

];


let currentQuestion = 0;

let score = 0;

let answered = false;


const questionElement =
    document.getElementById("question");

const answersElement =
    document.getElementById("answers");

const nextButton =
    document.getElementById("nextButton");

const explanationElement =
    document.getElementById("quizExplanation");

const quizProgress =
    document.getElementById("quizProgress");

const quizScore =
    document.getElementById("quizScore");

const progressBar =
    document.getElementById("quizProgressBar");

const quizResult =
    document.getElementById("quizResult");


function loadQuestion() {

    if (!questionElement) return;


    const item =
        questions[currentQuestion];


    questionElement.textContent =
        item.question;


    if (quizProgress) {

        quizProgress.textContent =
            `QUESTION ${currentQuestion + 1} / ${questions.length}`;

    }


    if (quizScore) {

        quizScore.textContent =
            `Score: ${score}`;

    }


    if (progressBar) {

        progressBar.style.width =
            `${((currentQuestion + 1) / questions.length) * 100}%`;

    }


    answersElement.innerHTML = "";

    explanationElement.classList.remove("show");

    explanationElement.textContent = "";

    nextButton.style.display = "none";

    answered = false;


    item.answers.forEach((answer, index) => {

        const button =
            document.createElement("button");

        button.className =
            "answer-button";

        button.textContent =
            answer;

        button.addEventListener(
            "click",
            () => selectAnswer(index)
        );

        answersElement.appendChild(button);

    });

}


function selectAnswer(selectedIndex) {

    if (answered) return;

    answered = true;


    const item =
        questions[currentQuestion];


    const buttons =
        answersElement.querySelectorAll(
            ".answer-button"
        );


    buttons.forEach((button, index) => {

        button.disabled = true;


        if (index === item.correct) {

            button.classList.add("correct");

        }


        if (
            index === selectedIndex &&
            selectedIndex !== item.correct
        ) {

            button.classList.add("wrong");

        }

    });


    if (selectedIndex === item.correct) {

        score++;

    }


    quizScore.textContent =
        `Score: ${score}`;


    explanationElement.textContent =
        item.explanation;

    explanationElement.classList.add("show");


    nextButton.style.display =
        "inline-flex";

}


if (questionElement) {

    loadQuestion();

}


if (nextButton) {

    nextButton.addEventListener(
        "click",
        () => {

            currentQuestion++;


            if (
                currentQuestion >=
                questions.length
            ) {

                showFinalResult();

            } else {

                loadQuestion();

            }

        }
    );

}


async function showFinalResult() {

    questionElement.textContent =
        "Quiz Completed! 🎉";


    answersElement.innerHTML = "";


    explanationElement.classList.remove(
        "show"
    );


    nextButton.style.display =
        "none";


    const percentage =
        Math.round(
            (score / questions.length) * 100
        );


    quizResult.innerHTML = `

        <div class="final-score">

            <h3>
                Your Score
            </h3>

            <strong>
                ${score} / ${questions.length}
            </strong>

            <p>
                ${percentage}% correct
            </p>

            <button
                id="restartQuiz"
                class="primary-button"
            >
                Restart Quiz
            </button>

        </div>

    `;


    await saveQuizResult();


    const restart =
        document.getElementById(
            "restartQuiz"
        );


    if (restart) {

        restart.addEventListener(
            "click",
            () => {

                currentQuestion = 0;

                score = 0;

                quizResult.innerHTML = "";

                loadQuestion();

            }
        );

    }

}


// ======================================
// SAVE QUIZ RESULT
// ======================================

async function saveQuizResult() {

    const user =
        auth.currentUser;


    if (!user) {

        console.log(
            "Quiz result not saved because user is not logged in."
        );

        return;

    }


    try {

        const userDoc =
            await getDoc(
                doc(db, "users", user.uid)
            );


        const userData =
            userDoc.exists()
                ? userDoc.data()
                : {};


        await addDoc(
            collection(db, "quizResults"),
            {
                uid: user.uid,
                name:
                    userData.name ||
                    user.email,

                email:
                    user.email,

                score:
                    score,

                total:
                    questions.length,

                createdAt:
                    serverTimestamp()
            }
        );


    } catch (error) {

        console.error(
            "Quiz save error:",
            error
        );

    }

}


// ======================================
// WORKSHOP FORM
// ======================================

const workshopForm =
    document.getElementById(
        "workshopForm"
    );


if (workshopForm) {

    workshopForm.addEventListener(
        "submit",
        async (e) => {

            e.preventDefault();


            const user =
                auth.currentUser;


            if (!user) {

                alert(
                    "Please login before registering for the workshop."
                );

                window.location.href =
                    "login.html";

                return;

            }


            const name =
                document.getElementById(
                    "name"
                ).value.trim();


            const email =
                document.getElementById(
                    "email"
                ).value.trim();


            const phone =
                document.getElementById(
                    "phone"
                ).value.trim();


            const institution =
                document.getElementById(
                    "institution"
                ).value.trim();


            const topic =
                document.getElementById(
                    "topic"
                ).value;


            const agree =
                document.getElementById(
                    "agree"
                );


            if (!agree.checked) {

                alert(
                    "Please accept the terms."
                );

                return;

            }


            try {

                await addDoc(
                    collection(
                        db,
                        "workshops"
                    ),
                    {
                        uid: user.uid,
                        name: name,
                        email: email,
                        phone: phone,
                        institution: institution,
                        topic: topic,
                        createdAt:
                            serverTimestamp()
                    }
                );


                const modal =
                    document.getElementById(
                        "successModal"
                    );


                document.getElementById(
                    "summaryName"
                ).textContent = name;


                document.getElementById(
                    "summaryTopic"
                ).textContent = topic;


                modal.classList.add("show");


                workshopForm.reset();


            } catch (error) {

                console.error(error);

                alert(
                    "Registration failed. Please try again."
                );

            }

        }
    );

}


// ======================================
// MODAL
// ======================================

const closeModal =
    document.getElementById(
        "closeModal"
    );

const doneButton =
    document.getElementById(
        "doneButton"
    );

const successModal =
    document.getElementById(
        "successModal"
    );


function closeSuccessModal() {

    if (successModal) {

        successModal.classList.remove(
            "show"
        );

    }

}


if (closeModal) {

    closeModal.addEventListener(
        "click",
        closeSuccessModal
    );

}


if (doneButton) {

    doneButton.addEventListener(
        "click",
        closeSuccessModal
    );

}


if (successModal) {

    successModal.addEventListener(
        "click",
        (e) => {

            if (e.target === successModal) {

                closeSuccessModal();

            }

        }
    );

}


// ======================================
// FAQ
// ======================================

document
    .querySelectorAll(".faq-question")
    .forEach(question => {

        question.addEventListener(
            "click",
            () => {

                const item =
                    question.parentElement;


                document
                    .querySelectorAll(".faq-item")
                    .forEach(other => {

                        if (other !== item) {

                            other.classList.remove(
                                "active"
                            );

                        }

                    });


                item.classList.toggle(
                    "active"
                );

            }
        );

    });


// ======================================
// SCROLL ANIMATION
// ======================================

const observer =
    new IntersectionObserver(
        entries => {

            entries.forEach(entry => {

                if (entry.isIntersecting) {

                    entry.target.classList.add(
                        "visible"
                    );

                }

            });

        },
        {
            threshold: 0.1
        }
    );


document
    .querySelectorAll(
        ".threat-card, .prevention-card, .process-step, .redflag-card, .faq-item"
    )
    .forEach(element => {

        observer.observe(element);

    });


});