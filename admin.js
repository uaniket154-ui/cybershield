/* =========================================================
   CYBERSHIELD ADMIN DASHBOARD
   FIREBASE
========================================================= */

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";

import {
    getAuth,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

import {
    getFirestore,
    collection,
    getDocs
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

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);


/* =========================================================
   ADMIN EMAIL
=========================================================

   IMPORTANT:
   CHANGE THIS TO THE EMAIL ACCOUNT
   YOU WILL USE AS ADMIN.
========================================================= */

const ADMIN_EMAIL = "toxicganesh37@gmail.com";

/* =========================================================
   HTML ELEMENTS
========================================================= */

const dashboard =
    document.getElementById("dashboard");

const accessDenied =
    document.getElementById("accessDenied");

const logoutBtn =
    document.getElementById("logoutBtn");

const refreshBtn =
    document.getElementById("refreshBtn");

const searchInput =
    document.getElementById("searchInput");

const participantsTable =
    document.getElementById("participantsTable");

const totalParticipants =
    document.getElementById("totalParticipants");

const totalRegistrations =
    document.getElementById("totalRegistrations");

const quizParticipants =
    document.getElementById("quizParticipants");

const averageScore =
    document.getElementById("averageScore");


/* =========================================================
   PARTICIPANT DATA
========================================================= */

let participants = [];


/* =========================================================
   CHECK ADMIN LOGIN
========================================================= */

onAuthStateChanged(auth, async (user) => {

    if (!user) {

        dashboard.style.display = "none";

        accessDenied.style.display = "block";

        return;
    }


    console.log(
        "Logged in user:",
        user.email
    );


    /*
       Check administrator email.
    */

    if (
        user.email.toLowerCase() !==
        ADMIN_EMAIL.toLowerCase()
    ) {

        dashboard.style.display = "none";

        accessDenied.style.display = "block";

        return;
    }


    /*
       Admin confirmed.
    */

    accessDenied.style.display = "none";

    dashboard.style.display = "block";


    await loadParticipants();

});


/* =========================================================
   LOAD PARTICIPANTS
========================================================= */

async function loadParticipants() {

    participantsTable.innerHTML = `
        <tr>
            <td colspan="9" class="loading">
                Loading participant data...
            </td>
        </tr>
    `;


    try {

        /*
           Get users collection.
        */

        const usersSnapshot =
            await getDocs(
                collection(db, "users")
            );


        /*
           Get workshop registrations.
        */

        const registrationsSnapshot =
            await getDocs(
                collection(
                    db,
                    "workshopRegistrations"
                )
            );


        /*
           Convert registrations into Map.
        */

        const registrations = new Map();


        registrationsSnapshot.forEach((doc) => {

            registrations.set(
                doc.id,
                doc.data()
            );

        });


        /*
           Build participant list.
        */

        participants = [];


        usersSnapshot.forEach((doc) => {

            const data = doc.data();

            const registration =
                registrations.get(doc.id) || {};


            participants.push({

                uid: doc.id,

                name:
                    data.name ||
                    registration.name ||
                    "—",

                email:
                    data.email ||
                    data.accountEmail ||
                    registration.email ||
                    "—",

                phone:
                    data.phone ||
                    registration.phone ||
                    "—",

                type:
                    data.participantType ||
                    registration.role ||
                    "—",

                provider:
                    data.provider ||
                    "—",

                registered:
                    data.workshopRegistered === true ||
                    registration.status === "Registered",

                quizScore:
                    getQuizScore(data),

                registrationDate:
                    data.registrationDate ||
                    registration.submittedAt ||
                    null

            });

        });


        /*
           Update statistics.
        */

        updateStatistics();


        /*
           Display table.
        */

        renderParticipants(participants);

    }

    catch (error) {

        console.error(
            "Firebase loading error:",
            error
        );


        participantsTable.innerHTML = `
            <tr>
                <td colspan="9" class="empty">
                    ❌ Unable to load participant data.
                    <br><br>
                    Check your Firestore security rules.
                </td>
            </tr>
        `;

    }

}


/* =========================================================
   GET QUIZ SCORE
========================================================= */

function getQuizScore(data) {

    /*
       Your quiz may use different field names.
       We check several possibilities.
    */

    if (
        typeof data.quizScore === "number"
    ) {

        return data.quizScore;

    }


    if (
        typeof data.score === "number"
    ) {

        return data.score;

    }


    if (
        typeof data.quizResult === "number"
    ) {

        return data.quizResult;

    }


    return null;
}


/* =========================================================
   UPDATE STATISTICS
========================================================= */

function updateStatistics() {

    const total =
        participants.length;


    const registrations =
        participants.filter(
            participant =>
                participant.registered
        ).length;


    const quizUsers =
        participants.filter(
            participant =>
                participant.quizScore !== null
        );


    totalParticipants.textContent =
        total;


    totalRegistrations.textContent =
        registrations;


    quizParticipants.textContent =
        quizUsers.length;


    if (quizUsers.length === 0) {

        averageScore.textContent =
            "0";

        return;
    }


    const totalScore =
        quizUsers.reduce(
            (sum, participant) =>
                sum + participant.quizScore,
            0
        );


    const average =
        totalScore /
        quizUsers.length;


    averageScore.textContent =
        average.toFixed(1);

}


/* =========================================================
   DISPLAY PARTICIPANTS
========================================================= */

function renderParticipants(list) {

    if (list.length === 0) {

        participantsTable.innerHTML = `
            <tr>
                <td colspan="9" class="empty">
                    No participants found.
                </td>
            </tr>
        `;

        return;
    }


    participantsTable.innerHTML =
        list.map(
            (participant, index) => {

                return `

                <tr>

                    <td>
                        ${index + 1}
                    </td>

                    <td>
                        <strong>
                            ${escapeHtml(
                                participant.name
                            )}
                        </strong>
                    </td>

                    <td>
                        ${escapeHtml(
                            participant.email
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            participant.phone
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            participant.type
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            participant.provider
                        )}
                    </td>

                    <td>

                        ${
                            participant.registered

                            ?

                            `<span class="status registered">
                                ✓ Registered
                            </span>`

                            :

                            `<span class="status not-registered">
                                Not Registered
                            </span>`
                        }

                    </td>

                    <td>

                        ${
                            participant.quizScore !== null

                            ?

                            `<span class="score">
                                ${participant.quizScore}
                            </span>`

                            :

                            "—"
                        }

                    </td>

                    <td>
                        ${formatDate(
                            participant.registrationDate
                        )}
                    </td>

                </tr>

                `;

            }
        ).join("");

}


/* =========================================================
   SEARCH
========================================================= */

searchInput.addEventListener(
    "input",
    () => {

        const search =
            searchInput.value
                .toLowerCase()
                .trim();


        if (!search) {

            renderParticipants(
                participants
            );

            return;
        }


        const filtered =
            participants.filter(
                participant =>

                    participant.name
                        .toLowerCase()
                        .includes(search)

                    ||

                    participant.email
                        .toLowerCase()
                        .includes(search)

                    ||

                    participant.phone
                        .toLowerCase()
                        .includes(search)

                    ||

                    participant.type
                        .toLowerCase()
                        .includes(search)
            );


        renderParticipants(
            filtered
        );

    }
);


/* =========================================================
   REFRESH
========================================================= */

refreshBtn.addEventListener(
    "click",
    async () => {

        refreshBtn.textContent =
            "⏳ Loading...";

        await loadParticipants();

        refreshBtn.textContent =
            "🔄 Refresh";

    }
);


/* =========================================================
   LOGOUT
========================================================= */

logoutBtn.addEventListener(
    "click",
    async () => {

        try {

            await signOut(auth);

            window.location.href =
                "login.html";

        }

        catch (error) {

            console.error(
                "Logout error:",
                error
            );

        }

    }
);


/* =========================================================
   FORMAT DATE
========================================================= */

function formatDate(timestamp) {

    if (!timestamp) {
        return "—";
    }


    try {

        let date;


        if (
            typeof timestamp.toDate ===
            "function"
        ) {

            date =
                timestamp.toDate();

        }

        else {

            date =
                new Date(timestamp);

        }


        return date.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );

    }

    catch {

        return "—";

    }

}


/* =========================================================
   HTML SECURITY
========================================================= */

function escapeHtml(value) {

    if (value === null ||
        value === undefined) {

        return "";

    }


    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}