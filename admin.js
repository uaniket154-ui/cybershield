// ======================================================
// CYBERSHIELD ADMIN DASHBOARD
// ======================================================

import { auth, db } from "./firebase-config.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";


// ======================================================
// GLOBAL DATA
// ======================================================

let allUsers = [];

let workshopMap = new Map();

let quizMap = new Map();


// ======================================================
// ELEMENTS
// ======================================================

const usersTable =
    document.getElementById("usersTable");

const userSearch =
    document.getElementById("userSearch");

const progressFilter =
    document.getElementById("progressFilter");

const dashboardStatus =
    document.getElementById("dashboardStatus");


// ======================================================
// FORMAT DATE
// ======================================================

function formatDate(value) {

    if (!value) {
        return "—";
    }

    try {

        if (
            typeof value.toDate ===
            "function"
        ) {

            return value
                .toDate()
                .toLocaleString();

        }


        const date =
            new Date(value);


        if (
            isNaN(
                date.getTime()
            )
        ) {

            return "—";

        }


        return date.toLocaleString();

    } catch {

        return "—";
    }
}


// ======================================================
// DATE FOR SORTING
// ======================================================

function dateNumber(value) {

    if (!value) {
        return 0;
    }

    try {

        if (
            typeof value.toDate ===
            "function"
        ) {

            return value
                .toDate()
                .getTime();

        }


        const date =
            new Date(value);


        return isNaN(
            date.getTime()
        )
            ? 0
            : date.getTime();

    } catch {

        return 0;
    }
}


// ======================================================
// SAFE HTML
// ======================================================

function safe(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );
}


// ======================================================
// FIND FIRST AVAILABLE FIELD
// ======================================================

function field(
    data,
    names,
    fallback = ""
) {

    for (
        const name of names
    ) {

        if (
            data[name] !==
                undefined &&
            data[name] !==
                null &&
            data[name] !== ""
        ) {

            return data[name];

        }

    }

    return fallback;
}


// ======================================================
// FIND ADMIN ACCOUNT
// ======================================================

async function findAdmin(
    firebaseUser
) {

    const snapshot =
        await getDocs(
            collection(
                db,
                "users"
            )
        );


    let admin = null;


    snapshot.forEach(
        userDoc => {

            const data =
                userDoc.data();


            if (
                data.uid ===
                firebaseUser.uid
            ) {

                admin = {
                    id: userDoc.id,
                    data: data
                };

            }

        }
    );


    return admin;
}


// ======================================================
// AUTH CHECK
// ======================================================

onAuthStateChanged(
    auth,
    async firebaseUser => {

        if (!firebaseUser) {

            window.location.href =
                "login.html";

            return;
        }


        try {

            dashboardStatus.textContent =
                "Checking administrator account...";


            const admin =
                await findAdmin(
                    firebaseUser
                );


            if (!admin) {

                alert(
                    "Admin account information was not found."
                );


                await signOut(auth);


                window.location.href =
                    "login.html";


                return;
            }


            // ------------------------------------------
            // ONLY ROLE ADMIN CAN ENTER
            // ------------------------------------------

            if (
                admin.data.role !==
                "admin"
            ) {

                alert(
                    "Access denied. Admin account required."
                );


                window.location.href =
                    "index.html";


                return;
            }


            // ------------------------------------------
            // SHOW ADMIN INFORMATION
            // ------------------------------------------

            document.getElementById(
                "adminName"
            ).textContent =
                admin.data.name ||
                "Administrator";


            document.getElementById(
                "adminEmail"
            ).textContent =
                admin.data.email ||
                admin.data.accountEmail ||
                firebaseUser.email ||
                "";


            // ------------------------------------------
            // LOAD DASHBOARD
            // ------------------------------------------

            await loadDashboard();

        } catch (error) {

            console.error(
                "ADMIN ERROR:",
                error
            );


            dashboardStatus.textContent =
                "Error loading dashboard. Check Firebase Security Rules.";

        }

    }
);


// ======================================================
// LOAD DASHBOARD
// ======================================================

async function loadDashboard() {

    dashboardStatus.textContent =
        "Loading users and progress...";


    try {

        // ------------------------------------------
        // USERS
        // ------------------------------------------

        const usersSnapshot =
            await getDocs(
                collection(
                    db,
                    "users"
                )
            );


        // ------------------------------------------
        // WORKSHOPS
        // ------------------------------------------

        const workshopSnapshot =
            await getDocs(
                collection(
                    db,
                    "workshops"
                )
            );


        // ------------------------------------------
        // QUIZZES
        // ------------------------------------------

        const quizSnapshot =
            await getDocs(
                collection(
                    db,
                    "quizResults"
                )
            );


        workshopMap.clear();

        quizMap.clear();


        // ------------------------------------------
        // WORKSHOP MAP
        // ------------------------------------------

        workshopSnapshot.forEach(
            workshopDoc => {

                const data =
                    workshopDoc.data();


                if (data.uid) {

                    workshopMap.set(
                        data.uid,
                        data
                    );

                }

            }
        );


        // ------------------------------------------
        // QUIZ MAP
        // ------------------------------------------

        quizSnapshot.forEach(
            quizDoc => {

                const data =
                    quizDoc.data();


                if (data.uid) {

                    quizMap.set(
                        data.uid,
                        data
                    );

                }

            }
        );


        // ------------------------------------------
        // NORMALIZE USERS
        // ------------------------------------------

        allUsers =
            usersSnapshot.docs
                .map(
                    userDoc =>
                        createUserObject(
                            userDoc
                        )
                )
                .sort(
                    (a, b) =>
                        dateNumber(
                            b.createdAt
                        ) -
                        dateNumber(
                            a.createdAt
                        )
                );


        // ------------------------------------------
        // UPDATE STATISTICS
        // ------------------------------------------

        updateStatistics(
            allUsers,
            workshopSnapshot.size
        );


        // ------------------------------------------
        // DISPLAY USERS
        // ------------------------------------------

        displayUsers(
            allUsers
        );


        dashboardStatus.textContent =
            `Dashboard loaded successfully • ${allUsers.length} users`;

    } catch (error) {

        console.error(
            "DASHBOARD LOAD ERROR:",
            error
        );


        dashboardStatus.textContent =
            "Unable to load data. Check Firestore Security Rules.";

    }

}


// ======================================================
// CREATE USER OBJECT
// ======================================================

function createUserObject(
    userDoc
) {

    const data =
        userDoc.data();


    const uid =
        data.uid ||
        userDoc.id;


    const quiz =
        quizMap.get(
            uid
        );


    const workshop =
        workshopMap.get(
            uid
        );


    // ------------------------------------------
    // USER INFORMATION
    // ------------------------------------------

    const name =
        field(
            data,
            [
                "name",
                "fullName",
                "displayName"
            ],
            "Unknown User"
        );


    const email =
        field(
            data,
            [
                "email",
                "accountEmail"
            ],
            "—"
        );


    const phone =
        field(
            data,
            [
                "phone",
                "mobile",
                "contact"
            ],
            "—"
        );


    const institution =
        field(
            data,
            [
                "institution",
                "college",
                "organization"
            ],
            "—"
        );


    const role =
        field(
            data,
            [
                "role"
            ],
            "user"
        );


    // ------------------------------------------
    // QUIZ
    // ------------------------------------------

    let score =
        data.quizScore;


    let total =
        data.quizTotal ||
        data.quizTotalQuestions;


    // If not stored in users,
    // get it from quizResults.

    if (
        score ===
            undefined &&
        quiz
    ) {

        score =
            quiz.score;

    }


    if (
        total ===
            undefined &&
        quiz
    ) {

        total =
            quiz.total;

    }


    // Your CyberShield quiz has 10 questions.

    if (!total) {

        total = 10;

    }


    // ------------------------------------------
    // QUIZ COMPLETED
    // ------------------------------------------

    let quizCompleted =
        data.quizCompleted === true ||
        data.quizCompleted === "true" ||
        quiz !== undefined;


    if (
        score !==
            undefined &&
        score !== null &&
        score !== ""
    ) {

        quizCompleted = true;

    }


    // ------------------------------------------
    // WORKSHOP
    // ------------------------------------------

    const workshopRegistered =
        data.workshopRegistered === true ||
        data.workshopRegistered === "true" ||
        workshop !== undefined;


    // ------------------------------------------
    // PROGRESS
    // ------------------------------------------

    let progress = 0;


    if (
        quizCompleted &&
        score !==
            undefined &&
        score !== null &&
        Number(total) > 0
    ) {

        progress =
            (
                Number(score) /
                Number(total)
            ) * 100;


        progress =
            Math.max(
                0,
                Math.min(
                    100,
                    progress
                )
            );

    }


    return {

        uid,

        name,

        email,

        phone,

        institution,

        role,

        score,

        total,

        progress,

        quizCompleted,

        workshopRegistered,

        createdAt:
            data.createdAt,

        lastLogin:
            data.lastLogin

    };

}


// ======================================================
// STATISTICS
// ======================================================

function updateStatistics(
    users,
    workshopCount
) {

    // Total users

    document.getElementById(
        "totalUsers"
    ).textContent =
        users.length;


    // Workshop registrations

    document.getElementById(
        "totalWorkshops"
    ).textContent =
        workshopCount;


    // Completed quizzes

    const completed =
        users.filter(
            user =>
                user.quizCompleted
        );


    document.getElementById(
        "totalQuizzes"
    ).textContent =
        completed.length;


    // Average score

    let average = 0;


    if (
        completed.length >
        0
    ) {

        const total =
            completed.reduce(
                (
                    sum,
                    user
                ) =>
                    sum +
                    user.progress,
                0
            );


        average =
            total /
            completed.length;

    }


    document.getElementById(
        "avgScore"
    ).textContent =
        Math.round(
            average
        ) + "%";

}


// ======================================================
// DISPLAY USERS
// ======================================================

function displayUsers(
    users
) {

    if (!users.length) {

        usersTable.innerHTML = `

            <tr>

                <td
                    colspan="9"
                    class="empty-cell"
                >
                    No users found.
                </td>

            </tr>

        `;

        return;
    }


    usersTable.innerHTML =
        users.map(
            user => {

                const progress =
                    Math.round(
                        user.progress
                    );


                // --------------------------------------
                // QUIZ STATUS
                // --------------------------------------

                const quizStatus =
                    user.quizCompleted

                        ? `
                            <span class="status-badge success">
                                Completed
                            </span>
                        `

                        : `
                            <span class="status-badge pending">
                                Pending
                            </span>
                        `;


                // --------------------------------------
                // WORKSHOP STATUS
                // --------------------------------------

                const workshopStatus =
                    user.workshopRegistered

                        ? `
                            <span class="status-badge success">
                                Registered
                            </span>
                        `

                        : `
                            <span class="status-badge pending">
                                Not Registered
                            </span>
                        `;


                // --------------------------------------
                // ROLE
                // --------------------------------------

                const roleClass =
                    user.role === "admin"
                        ? "admin-role"
                        : "user-role";


                // --------------------------------------
                // QUIZ SCORE
                // --------------------------------------

                const scoreText =
                    user.quizCompleted

                        ? `${safe(user.score ?? 0)}/${safe(user.total ?? 10)}`

                        : "Not attempted";


                return `

                    <tr>


                        <!-- USER -->

                        <td>

                            <div class="user-cell">

                                <div class="user-avatar">

                                    ${safe(
                                        user.name
                                            .charAt(0)
                                            .toUpperCase()
                                    )}

                                </div>


                                <div>

                                    <strong>
                                        ${safe(
                                            user.name
                                        )}
                                    </strong>


                                    <small>
                                        ${safe(
                                            user.uid
                                        )}
                                    </small>

                                </div>

                            </div>

                        </td>


                        <!-- CONTACT -->

                        <td>

                            <div class="contact-cell">

                                <span>
                                    ${safe(
                                        user.email
                                    )}
                                </span>


                                <small>
                                    ${safe(
                                        user.phone
                                    )}
                                </small>

                            </div>

                        </td>


                        <!-- INSTITUTION -->

                        <td>
                            ${safe(
                                user.institution
                            )}
                        </td>


                        <!-- QUIZ -->

                        <td>

                            <div class="progress-cell">

                                <div class="progress-info">

                                    ${quizStatus}

                                    <strong>
                                        ${progress}%
                                    </strong>

                                </div>


                                <div class="progress-track">

                                    <div
                                        class="progress-fill"
                                        style="width:${progress}%"
                                    ></div>

                                </div>


                                <small>
                                    Score: ${scoreText}
                                </small>

                            </div>

                        </td>


                        <!-- WORKSHOP -->

                        <td>
                            ${workshopStatus}
                        </td>


                        <!-- ROLE -->

                        <td>

                            <span
                                class="role-badge ${roleClass}"
                            >
                                ${safe(
                                    user.role
                                )}
                            </span>

                        </td>


                        <!-- CREATED -->

                        <td>
                            ${safe(
                                formatDate(
                                    user.createdAt
                                )
                            )}
                        </td>


                        <!-- LOGIN -->

                        <td>
                            ${safe(
                                formatDate(
                                    user.lastLogin
                                )
                            )}
                        </td>


                        <!-- VIEW -->

                        <td>

                            <button
                                class="view-btn"
                                data-uid="${safe(
                                    user.uid
                                )}"
                            >
                                View
                            </button>

                        </td>


                    </tr>

                `;

            }
        ).join("");


    // ------------------------------------------
    // VIEW BUTTONS
    // ------------------------------------------

    document
        .querySelectorAll(
            ".view-btn"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        showUserDetails(
                            button.dataset.uid
                        );

                    }
                );

            }
        );

}


// ======================================================
// SEARCH + FILTER
// ======================================================

userSearch.addEventListener(
    "input",
    filterUsers
);


progressFilter.addEventListener(
    "change",
    filterUsers
);


function filterUsers() {

    const search =
        userSearch
            .value
            .toLowerCase()
            .trim();


    const filter =
        progressFilter.value;


    const filtered =
        allUsers.filter(
            user => {

                const text = `

                    ${user.name}

                    ${user.email}

                    ${user.phone}

                    ${user.institution}

                `.toLowerCase();


                const matchesSearch =
                    text.includes(
                        search
                    );


                let matchesFilter =
                    true;


                if (
                    filter ===
                    "completed"
                ) {

                    matchesFilter =
                        user.quizCompleted;

                }


                if (
                    filter ===
                    "pending"
                ) {

                    matchesFilter =
                        !user.quizCompleted;

                }


                if (
                    filter ===
                    "workshop"
                ) {

                    matchesFilter =
                        user.workshopRegistered;

                }


                if (
                    filter ===
                    "no-workshop"
                ) {

                    matchesFilter =
                        !user.workshopRegistered;

                }


                return (
                    matchesSearch &&
                    matchesFilter
                );

            }
        );


    displayUsers(
        filtered
    );

}


// ======================================================
// USER DETAILS
// ======================================================

function showUserDetails(
    uid
) {

    const user =
        allUsers.find(
            item =>
                item.uid === uid
        );


    if (!user) {
        return;
    }


    document.getElementById(
        "modalUserName"
    ).textContent =
        user.name;


    document.getElementById(
        "modalEmail"
    ).textContent =
        user.email;


    document.getElementById(
        "modalPhone"
    ).textContent =
        user.phone;


    document.getElementById(
        "modalInstitution"
    ).textContent =
        user.institution;


    document.getElementById(
        "modalRole"
    ).textContent =
        user.role;


    document.getElementById(
        "modalQuizStatus"
    ).textContent =
        user.quizCompleted
            ? "Completed"
            : "Not Completed";


    document.getElementById(
        "modalQuizScore"
    ).textContent =
        user.quizCompleted

            ? `${user.score ?? 0}/${user.total ?? 10} (${Math.round(user.progress)}%)`

            : "Not attempted";


    document.getElementById(
        "modalWorkshop"
    ).textContent =
        user.workshopRegistered
            ? "Registered"
            : "Not Registered";


    document.getElementById(
        "modalCreated"
    ).textContent =
        formatDate(
            user.createdAt
        );


    document.getElementById(
        "modalLastLogin"
    ).textContent =
        formatDate(
            user.lastLogin
        );


    document.getElementById(
        "modalUid"
    ).textContent =
        user.uid;


    document.getElementById(
        "userModal"
    ).classList.add(
        "active"
    );

}


// ======================================================
// CLOSE MODAL
// ======================================================

document.getElementById(
    "closeUserModal"
).addEventListener(
    "click",
    closeModal
);


document.getElementById(
    "userModal"
).addEventListener(
    "click",
    event => {

        if (
            event.target.id ===
            "userModal"
        ) {

            closeModal();

        }

    }
);


function closeModal() {

    document.getElementById(
        "userModal"
    ).classList.remove(
        "active"
    );

}


// ======================================================
// REFRESH
// ======================================================

document.getElementById(
    "refreshButton"
).addEventListener(
    "click",
    async () => {

        const button =
            document.getElementById(
                "refreshButton"
            );


        button.disabled = true;

        button.textContent =
            "⏳ Loading...";


        await loadDashboard();


        button.disabled = false;

        button.textContent =
            "🔄 Refresh";

    }
);


// ======================================================
// LOGOUT
// ======================================================

document.getElementById(
    "adminLogout"
).addEventListener(
    "click",
    async () => {

        try {

            await signOut(
                auth
            );


            window.location.href =
                "login.html";

        } catch (error) {

            console.error(
                "Logout error:",
                error
            );


            alert(
                "Logout failed."
            );

        }

    }
);