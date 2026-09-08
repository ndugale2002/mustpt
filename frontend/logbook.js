/*const RECORDS_KEY = "mustIPTRecords";

const STUDENT_PASSWORD = "student123";


const loginSection =
    document.getElementById("studentLoginSection");

const dashboard =
    document.getElementById("studentDashboard");

const studentLoginForm =
    document.getElementById("studentLoginForm");

const loginRegNo =
    document.getElementById("loginRegNo");

const studentPassword =
    document.getElementById("studentPassword");

const loginMessage =
    document.getElementById("loginMessage");

const regNo =
    document.getElementById("regNo");

const fullName =
    document.getElementById("fullName");

const course =
    document.getElementById("course");

const weekButtons =
    document.getElementById("weekButtons");

const weeklyForm =
    document.getElementById("weeklyForm");

const weekTitle =
    document.getElementById("weekTitle");

const daysContainer =
    document.getElementById("daysContainer");

const weeklySummary =
    document.getElementById("weeklySummary");

const studentMessage =
    document.getElementById("studentMessage");

const studentRecordsBody =
    document.getElementById("studentRecordsBody");

const submitBtn =
    document.getElementById("submitBtn");


let selectedWeek = null;

let editingId = null;


// GET RECORDS

function getRecords() {

    return JSON.parse(
        localStorage.getItem(RECORDS_KEY)
    ) || [];

}


// SAVE RECORDS

function saveRecords(records) {

    localStorage.setItem(
        RECORDS_KEY,
        JSON.stringify(records)
    );

}


// MESSAGE

function showMessage(element, text, type) {

    element.textContent = text;

    element.className =
        `message show ${type}`;

    setTimeout(() => {

        element.className =
            "message";

    }, 3500);

}


// LOGIN

studentLoginForm.addEventListener(
    "submit",
    function(e) {

        e.preventDefault();


        const username =
            loginRegNo.value.trim();

        const password =
            studentPassword.value.trim();


        if (!username) {

            showMessage(
                loginMessage,
                "Please enter registration number.",
                "error"
            );

            return;
        }


        if (password !== STUDENT_PASSWORD) {

            showMessage(
                loginMessage,
                "Wrong student password.",
                "error"
            );

            return;
        }


        sessionStorage.setItem(
            "studentLoggedIn",
            "true"
        );

        sessionStorage.setItem(
            "studentRegNo",
            username
        );


        openStudentDashboard();

    }
);


// OPEN DASHBOARD

function openStudentDashboard() {

    const loggedIn =
        sessionStorage.getItem(
            "studentLoggedIn"
        );

    const studentRegNo =
        sessionStorage.getItem(
            "studentRegNo"
        );


    if (
        loggedIn !== "true" ||
        !studentRegNo
    ) {
        return;
    }


    loginSection.classList.add(
        "hidden"
    );

    dashboard.classList.remove(
        "hidden"
    );


    regNo.value =
        studentRegNo;


    document.getElementById(
        "welcomeStudent"
    ).textContent =
        `Logged in as: ${studentRegNo}`;


    renderWeekButtons();

    renderStudentRecords();

}


// LOGOUT

document.getElementById(
    "studentLogoutBtn"
).addEventListener(
    "click",
    function() {

        sessionStorage.removeItem(
            "studentLoggedIn"
        );

        sessionStorage.removeItem(
            "studentRegNo"
        );

        location.reload();

    }
);


// CREATE WEEK BUTTONS

function renderWeekButtons() {

    weekButtons.innerHTML = "";


    for (
        let week = 1;
        week <= 5;
        week++
    ) {

        const button =
            document.createElement("button");


        button.type =
            "button";


        button.className =
            "week-btn";


        button.textContent =
            `Week ${week}`;


        button.dataset.week =
            week;


        button.addEventListener(
            "click",
            function() {

                editingId = null;

                submitBtn.textContent =
                    "Submit Week";


                openWeekForm(week);

            }
        );


        weekButtons.appendChild(
            button
        );

    }

}


// OPEN WEEK FORM

function openWeekForm(
    week,
    existingRecord = null
) {

    selectedWeek =
        Number(week);


    weeklyForm.classList.remove(
        "hidden"
    );


    weekTitle.textContent =
        `Week ${selectedWeek} - Daily Activities`;


    weeklySummary.value =
        existingRecord
            ? existingRecord.summary
            : "";


    document
        .querySelectorAll(".week-btn")
        .forEach(btn => {

            btn.classList.toggle(
                "active",
                Number(btn.dataset.week)
                === selectedWeek
            );

        });


    daysContainer.innerHTML =
        "";


    for (
        let i = 1;
        i <= 5;
        i++
    ) {

        const oldDay =
            existingRecord?.days?.[i - 1]
            || {};


        const row =
            document.createElement("div");


        row.className =
            "day-row";


        row.innerHTML = `

            <div>

                <label>
                    <strong>
                        Day ${i} Date
                    </strong>
                </label>

                <input
                    type="date"
                    id="date${i}"
                    value="${oldDay.date || ""}"
                    required
                >

            </div>


            <div>

                <label>
                    <strong>
                        Day ${i} Activity
                    </strong>
                </label>

                <textarea
                    id="activity${i}"
                    placeholder="Write activity for day ${i}..."
                    required>${oldDay.activity || ""}</textarea>

            </div>

        `;


        daysContainer.appendChild(
            row
        );

    }


    weeklyForm.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

}


// SUBMIT / UPDATE

weeklyForm.addEventListener(
    "submit",
    function(e) {

        e.preventDefault();


        if (
            !fullName.value.trim() ||
            !course.value.trim()
        ) {

            showMessage(
                studentMessage,
                "Please fill Full Name and Course.",
                "error"
            );

            return;
        }


        if (!selectedWeek) {

            showMessage(
                studentMessage,
                "Please select week.",
                "error"
            );

            return;
        }


        const days = [];


        for (
            let i = 1;
            i <= 5;
            i++
        ) {

            const date =
                document.getElementById(
                    `date${i}`
                ).value;


            const activity =
                document.getElementById(
                    `activity${i}`
                ).value.trim();


            if (
                !date ||
                !activity
            ) {

                showMessage(
                    studentMessage,
                    `Complete Day ${i} details.`,
                    "error"
                );

                return;
            }


            days.push({
                day: i,
                date: date,
                activity: activity
            });

        }


        const summary =
            weeklySummary.value.trim();


        if (!summary) {

            showMessage(
                studentMessage,
                "Please write weekly summary.",
                "error"
            );

            return;
        }


        const records =
            getRecords();


        const recordData = {

            regNo:
                regNo.value.trim(),

            fullName:
                fullName.value.trim(),

            course:
                course.value.trim(),

            week:
                selectedWeek,

            days:
                days,

            summary:
                summary,

            submittedAt:
                new Date().toLocaleString()

        };


        // UPDATE

        if (editingId) {

            const index =
                records.findIndex(
                    record =>
                        record.id === editingId
                );


            if (index !== -1) {

                records[index] = {

                    ...records[index],

                    ...recordData,

                    updatedAt:
                        new Date()
                        .toLocaleString()

                };

            }


            editingId = null;


            submitBtn.textContent =
                "Submit Week";


            showMessage(
                studentMessage,
                "Record updated successfully.",
                "ok"
            );

        }

        // NEW RECORD

        else {

            const alreadyExists =
                records.some(
                    record =>
                        record.regNo
                        === recordData.regNo
                        &&
                        record.week
                        === recordData.week
                );


            if (alreadyExists) {

                showMessage(
                    studentMessage,
                    `Week ${recordData.week} already exists. Use Edit to update it.`,
                    "error"
                );

                return;
            }


            recordData.id =
                Date.now();


            records.push(
                recordData
            );


            showMessage(
                studentMessage,
                "Week submitted successfully.",
                "ok"
            );

        }


        saveRecords(records);

        resetWeekForm();

        renderStudentRecords();

    }
);


// CANCEL

document.getElementById(
    "cancelBtn"
).addEventListener(
    "click",
    function() {

        resetWeekForm();

    }
);


// RESET

function resetWeekForm() {

    editingId = null;

    selectedWeek = null;

    submitBtn.textContent =
        "Submit Week";

    weeklyForm.reset();

    weeklyForm.classList.add(
        "hidden"
    );


    document
        .querySelectorAll(".week-btn")
        .forEach(btn => {

            btn.classList.remove(
                "active"
            );

        });

}


// SHOW STUDENT RECORDS

function renderStudentRecords() {

    const currentRegNo =
        sessionStorage.getItem(
            "studentRegNo"
        );


    const records =
        getRecords()
        .filter(
            record =>
                record.regNo
                === currentRegNo
        )
        .sort(
            (a, b) =>
                a.week - b.week
        );


    studentRecordsBody.innerHTML =
        "";


    if (
        records.length === 0
    ) {

        studentRecordsBody.innerHTML = `

            <tr>

                <td
                    colspan="7"
                    class="empty">

                    No IPT records submitted yet.

                </td>

            </tr>

        `;

        return;
    }


    records.forEach(
        record => {

            const row =
                document.createElement("tr");


            row.innerHTML = `

                <td>
                    Week ${record.week}
                </td>

                <td>
                    ${escapeHTML(record.regNo)}
                </td>

                <td>
                    ${escapeHTML(record.fullName)}
                </td>

                <td>
                    ${escapeHTML(record.course)}
                </td>

                <td>
                    ${escapeHTML(record.summary)}
                </td>

                <td>
                    ${escapeHTML(record.submittedAt)}
                </td>

                <td>

                    <button
                        class="small-btn primary"
                        onclick="viewRecord(${record.id})">

                        Read

                    </button>


                    <button
                        class="small-btn warning"
                        onclick="editRecord(${record.id})">

                        Edit

                    </button>


                    <button
                        class="small-btn danger"
                        onclick="deleteRecord(${record.id})">

                        Delete

                    </button>

                </td>

            `;


            studentRecordsBody.appendChild(
                row
            );

        }
    );

}


// READ

window.viewRecord =
function(id) {

    const record =
        getRecords()
        .find(
            item =>
                item.id === id
        );


    if (!record) return;


    const dayHTML =
        record.days.map(
            day => `

                <div class="detail-box">

                    <strong>
                        Day ${day.day}
                        -
                        ${escapeHTML(day.date)}
                    </strong>

                    <p>
                        ${escapeHTML(day.activity)}
                    </p>

                </div>

            `
        ).join("");


    document.getElementById(
        "viewContent"
    ).innerHTML = `

        <p>
            <strong>Reg No:</strong>
            ${escapeHTML(record.regNo)}
        </p>

        <p>
            <strong>Full Name:</strong>
            ${escapeHTML(record.fullName)}
        </p>

        <p>
            <strong>Course:</strong>
            ${escapeHTML(record.course)}
        </p>

        <p>
            <strong>Week:</strong>
            ${record.week}
        </p>

        <hr style="margin:14px 0;">

        ${dayHTML}

        <div class="detail-box">

            <strong>
                Weekly Summary
            </strong>

            <p>
                ${escapeHTML(record.summary)}
            </p>

        </div>

    `;


    document.getElementById(
        "viewModal"
    ).classList.remove(
        "hidden"
    );

};


// EDIT

window.editRecord =
function(id) {

    const record =
        getRecords()
        .find(
            item =>
                item.id === id
        );


    if (!record) return;


    editingId = id;


    fullName.value =
        record.fullName;


    course.value =
        record.course;


    submitBtn.textContent =
        "Update Record";


    openWeekForm(
        record.week,
        record
    );

};


// DELETE

window.deleteRecord =
function(id) {

    if (
        !confirm(
            "Are you sure you want to delete this record?"
        )
    ) {
        return;
    }


    let records =
        getRecords();


    records =
        records.filter(
            record =>
                record.id !== id
        );


    saveRecords(records);

    renderStudentRecords();


    showMessage(
        studentMessage,
        "Record deleted successfully.",
        "ok"
    );

};


// CLOSE MODAL

document.getElementById(
    "closeModalBtn"
).addEventListener(
    "click",
    function() {

        document.getElementById(
            "viewModal"
        ).classList.add(
            "hidden"
        );

    }
);


// SECURITY

function escapeHTML(value) {

    return String(value ?? "")

        .replaceAll("&", "&amp;")

        .replaceAll("<", "&lt;")

        .replaceAll(">", "&gt;")

        .replaceAll('"', "&quot;")

        .replaceAll(
            "'",
            "&#039;"
        );

}


// START

openStudentDashboard(); */






//hii inatumia api za backend
const API_URL = "http://localhost:4000/api";

const loginSection =
    document.getElementById("studentLoginSection");

const dashboard =
    document.getElementById("studentDashboard");

const studentLoginForm =
    document.getElementById("studentLoginForm");

const loginRegNo =
    document.getElementById("loginRegNo");

const studentPassword =
    document.getElementById("studentPassword");

const loginMessage =
    document.getElementById("loginMessage");

const regNo =
    document.getElementById("regNo");

const fullName =
    document.getElementById("fullName");

const course =
    document.getElementById("course");

const weekButtons =
    document.getElementById("weekButtons");

const weeklyForm =
    document.getElementById("weeklyForm");

const weekTitle =
    document.getElementById("weekTitle");

const daysContainer =
    document.getElementById("daysContainer");

const weeklySummary =
    document.getElementById("weeklySummary");

const studentMessage =
    document.getElementById("studentMessage");

const studentRecordsBody =
    document.getElementById("studentRecordsBody");

const submitBtn =
    document.getElementById("submitBtn");


let selectedWeek = null;
let editingId = null;


/* =========================
   API HELPER
========================= */

async function apiRequest(endpoint, options = {}) {

    try {

        const response = await fetch(
            `${API_URL}${endpoint}`,
            {
                ...options,

                headers: {
                    "Content-Type": "application/json",

                    ...(options.headers || {})
                }
            }
        );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Something went wrong"
            );

        }


        return data;

    } catch (error) {

        console.error(
            "API ERROR:",
            error
        );

        throw error;
    }
}



/* =========================
   MESSAGE
========================= */

function showMessage(
    element,
    text,
    type
) {

    element.textContent = text;

    element.className =
        `message show ${type}`;


    setTimeout(() => {

        element.className =
            "message";

    }, 3500);

}



/* =========================
   LOGIN
========================= */

studentLoginForm.addEventListener(
    "submit",
    async function(e) {

        e.preventDefault();


        const username =
            loginRegNo.value.trim();

        const password =
            studentPassword.value.trim();


        if (!username) {

            showMessage(
                loginMessage,
                "Please enter registration number.",
                "error"
            );

            return;
        }


        if (!password) {

            showMessage(
                loginMessage,
                "Please enter password.",
                "error"
            );

            return;
        }


        try {

            /*
             * LOGIN API
             */

           /* const data =
                await apiRequest(
                    "/auth/login",
                    {
                        method: "POST",

                        body: JSON.stringify({

                            email: username,

                            password: password

                        })
                    }
                );*/

                const data = await apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify({
        username: loginRegNo.value.trim(),
        password: studentPassword.value
    })
});


            /*
             * SAVE LOGIN SESSION
             */

            sessionStorage.setItem(
                "studentLoggedIn",
                "true"
            );


            sessionStorage.setItem(
                "studentRegNo",
                username
            );


            /*
             * SAVE TOKEN
             */

            if (data.token) {

                sessionStorage.setItem(
                    "studentToken",
                    data.token
                );

            }


            /*
             * SAVE USER
             */

            if (data.user) {

                sessionStorage.setItem(
                    "studentUser",
                    JSON.stringify(data.user)
                );

            }


            openStudentDashboard();


        } catch (error) {

            showMessage(
                loginMessage,
                error.message ||
                "Login failed.",
                "error"
            );

        }

    }
);



/* =========================
   OPEN DASHBOARD
========================= */

async function openStudentDashboard() {

    const loggedIn =
        sessionStorage.getItem(
            "studentLoggedIn"
        );


    const studentRegNo =
        sessionStorage.getItem(
            "studentRegNo"
        );


    if (
        loggedIn !== "true" ||
        !studentRegNo
    ) {

        return;

    }


    loginSection.classList.add(
        "hidden"
    );


    dashboard.classList.remove(
        "hidden"
    );


    regNo.value =
        studentRegNo;


    document.getElementById(
        "welcomeStudent"
    ).textContent =
        `Logged in as: ${studentRegNo}`;


    renderWeekButtons();


    /*
     * LOAD RECORDS FROM API
     */

    await renderStudentRecords();

}



/* =========================
   LOGOUT
========================= */

document.getElementById(
    "studentLogoutBtn"
).addEventListener(
    "click",
    function() {


        sessionStorage.removeItem(
            "studentLoggedIn"
        );


        sessionStorage.removeItem(
            "studentRegNo"
        );


        sessionStorage.removeItem(
            "studentToken"
        );


        sessionStorage.removeItem(
            "studentUser"
        );


        location.reload();

    }
);



/* =========================
   CREATE WEEK BUTTONS
========================= */

function renderWeekButtons() {

    weekButtons.innerHTML = "";


    for (
        let week = 1;
        week <= 5;
        week++
    ) {

        const button =
            document.createElement(
                "button"
            );


        button.type =
            "button";


        button.className =
            "week-btn";


        button.textContent =
            `Week ${week}`;


        button.dataset.week =
            week;


        button.addEventListener(
            "click",
            function() {

                editingId = null;


                submitBtn.textContent =
                    "Submit Week";


                openWeekForm(week);

            }
        );


        weekButtons.appendChild(
            button
        );

    }

}



/* =========================
   OPEN WEEK FORM
========================= */

function openWeekForm(
    week,
    existingRecord = null
) {

    selectedWeek =
        Number(week);


    weeklyForm.classList.remove(
        "hidden"
    );


    weekTitle.textContent =
        `Week ${selectedWeek} - Daily Activities`;


    weeklySummary.value =
        existingRecord
            ? existingRecord.summary
            : "";


    document
        .querySelectorAll(".week-btn")
        .forEach(btn => {

            btn.classList.toggle(
                "active",

                Number(
                    btn.dataset.week
                ) === selectedWeek
            );

        });


    daysContainer.innerHTML =
        "";


    for (
        let i = 1;
        i <= 5;
        i++
    ) {

        const oldDay =
            existingRecord?.days?.[i - 1]
            || {};


        const row =
            document.createElement(
                "div"
            );


        row.className =
            "day-row";


        row.innerHTML = `

            <div>

                <label>
                    <strong>
                        Day ${i} Date
                    </strong>
                </label>

                <input
                    type="date"
                    id="date${i}"
                    value="${escapeHTML(
                        oldDay.date || ""
                    )}"
                    required
                >

            </div>


            <div>

                <label>
                    <strong>
                        Day ${i} Activity
                    </strong>
                </label>

                <textarea
                    id="activity${i}"
                    placeholder="Write activity for day ${i}..."
                    required>${escapeHTML(
                        oldDay.activity || ""
                    )}</textarea>

            </div>

        `;


        daysContainer.appendChild(
            row
        );

    }


    weeklyForm.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

}



/* =========================
   SUBMIT / UPDATE
========================= */

weeklyForm.addEventListener(
    "submit",
    async function(e) {

        e.preventDefault();


        if (
            !fullName.value.trim() ||
            !course.value.trim()
        ) {

            showMessage(
                studentMessage,
                "Please fill Full Name and Course.",
                "error"
            );

            return;

        }


        if (!selectedWeek) {

            showMessage(
                studentMessage,
                "Please select week.",
                "error"
            );

            return;

        }


        const days = [];


        for (
            let i = 1;
            i <= 5;
            i++
        ) {

            const date =
                document.getElementById(
                    `date${i}`
                ).value;


            const activity =
                document.getElementById(
                    `activity${i}`
                ).value.trim();


            if (
                !date ||
                !activity
            ) {

                showMessage(
                    studentMessage,
                    `Complete Day ${i} details.`,
                    "error"
                );

                return;

            }


            days.push({

                day: i,

                date: date,

                activity: activity

            });

        }


        const summary =
            weeklySummary.value.trim();


        if (!summary) {

            showMessage(
                studentMessage,
                "Please write weekly summary.",
                "error"
            );

            return;

        }


        const recordData = {

            regNo:
                regNo.value.trim(),

            fullName:
                fullName.value.trim(),

            course:
                course.value.trim(),

            week:
                selectedWeek,

            days:
                days,

            summary:
                summary

        };


        try {

            /*
             * UPDATE
             */

            if (editingId) {

                await apiRequest(
                    `/records/${editingId}`,
                    {

                        method: "PUT",

                        body:
                            JSON.stringify(
                                recordData
                            )

                    }
                );


                editingId = null;


                submitBtn.textContent =
                    "Submit Week";


                showMessage(
                    studentMessage,
                    "Record updated successfully.",
                    "ok"
                );

            }


            /*
             * NEW RECORD
             */

            else {

                await apiRequest(
                    "/records",
                    {

                        method: "POST",

                        body:
                            JSON.stringify(
                                recordData
                            )

                    }
                );


                showMessage(
                    studentMessage,
                    "Week submitted successfully.",
                    "ok"
                );

            }


            resetWeekForm();


            /*
             * RELOAD FROM DATABASE
             */

            await renderStudentRecords();


        } catch (error) {

            showMessage(
                studentMessage,
                error.message ||
                "Failed to save record.",
                "error"
            );

        }

    }
);



/* =========================
   CANCEL
========================= */

document.getElementById(
    "cancelBtn"
).addEventListener(
    "click",
    function() {

        resetWeekForm();

    }
);



/* =========================
   RESET
========================= */

function resetWeekForm() {

    editingId = null;

    selectedWeek = null;


    submitBtn.textContent =
        "Submit Week";


    weeklyForm.reset();


    weeklyForm.classList.add(
        "hidden"
    );


    document
        .querySelectorAll(".week-btn")
        .forEach(btn => {

            btn.classList.remove(
                "active"
            );

        });

}



/* =========================
   GET STUDENT RECORDS
========================= */

async function renderStudentRecords() {

    const currentRegNo =
        sessionStorage.getItem(
            "studentRegNo"
        );


    if (!currentRegNo) {
        return;
    }


    try {

        /*
         * GET FROM API
         */

        const data =
            await apiRequest(
                `/records/student/${encodeURIComponent(
                    currentRegNo
                )}`
            );


        /*
         * Depending on your API response
         */

        const records =
            Array.isArray(data)
                ? data
                : data.records || [];


        records.sort(
            (a, b) =>
                a.week - b.week
        );


        studentRecordsBody.innerHTML =
            "";


        if (
            records.length === 0
        ) {

            studentRecordsBody.innerHTML = `

                <tr>

                    <td
                        colspan="7"
                        class="empty"
                    >

                        No IPT records submitted yet.

                    </td>

                </tr>

            `;

            return;

        }


        records.forEach(
            record => {

                const row =
                    document.createElement(
                        "tr"
                    );


                row.innerHTML = `

                    <td>
                        Week ${record.week}
                    </td>

                    <td>
                        ${escapeHTML(
                            record.regNo
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            record.fullName
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            record.course
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            record.summary
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            record.submittedAt ||
                            record.created_at ||
                            ""
                        )}
                    </td>

                    <td>

                        <button
                            class="small-btn primary"
                            onclick="viewRecord(${record.id})"
                        >

                            Read

                        </button>


                        <button
                            class="small-btn warning"
                            onclick="editRecord(${record.id})"
                        >

                            Edit

                        </button>


                        <button
                            class="small-btn danger"
                            onclick="deleteRecord(${record.id})"
                        >

                            Delete

                        </button>

                    </td>

                `;


                studentRecordsBody.appendChild(
                    row
                );

            }
        );


    } catch (error) {

        console.error(
            error
        );


        studentRecordsBody.innerHTML = `

            <tr>

                <td
                    colspan="7"
                    class="empty"
                >

                    Failed to load records from server.

                </td>

            </tr>

        `;

    }

}



/* =========================
   READ RECORD
========================= */

window.viewRecord =
async function(id) {

    try {

        const data =
            await apiRequest(
                `/records/${id}`
            );


        const record =
            data.record || data;


        if (!record) {
            return;
        }


        const dayHTML =
            record.days
                .map(
                    day => `

                        <div class="detail-box">

                            <strong>
                                Day ${day.day}
                                -
                                ${escapeHTML(
                                    day.date
                                )}
                            </strong>

                            <p>
                                ${escapeHTML(
                                    day.activity
                                )}
                            </p>

                        </div>

                    `
                )
                .join("");


        document.getElementById(
            "viewContent"
        ).innerHTML = `

            <p>

                <strong>
                    Reg No:
                </strong>

                ${escapeHTML(
                    record.regNo
                )}

            </p>


            <p>

                <strong>
                    Full Name:
                </strong>

                ${escapeHTML(
                    record.fullName
                )}

            </p>


            <p>

                <strong>
                    Course:
                </strong>

                ${escapeHTML(
                    record.course
                )}

            </p>


            <p>

                <strong>
                    Week:
                </strong>

                ${record.week}

            </p>


            <hr style="margin:14px 0;">


            ${dayHTML}


            <div class="detail-box">

                <strong>
                    Weekly Summary
                </strong>

                <p>
                    ${escapeHTML(
                        record.summary
                    )}
                </p>

            </div>

        `;


        document.getElementById(
            "viewModal"
        ).classList.remove(
            "hidden"
        );


    } catch (error) {

        showMessage(
            studentMessage,
            error.message ||
            "Failed to load record.",
            "error"
        );

    }

};



/* =========================
   EDIT RECORD
========================= */

window.editRecord =
async function(id) {

    try {

        const data =
            await apiRequest(
                `/records/${id}`
            );


        const record =
            data.record || data;


        if (!record) {
            return;
        }


        editingId =
            record.id;


        fullName.value =
            record.fullName;


        course.value =
            record.course;


        submitBtn.textContent =
            "Update Record";


        openWeekForm(
            record.week,
            record
        );


    } catch (error) {

        showMessage(
            studentMessage,
            error.message ||
            "Failed to load record.",
            "error"
        );

    }

};



/* =========================
   DELETE RECORD
========================= */

window.deleteRecord =
async function(id) {

    if (
        !confirm(
            "Are you sure you want to delete this record?"
        )
    ) {

        return;

    }


    try {

        await apiRequest(
            `/records/${id}`,
            {
                method: "DELETE"
            }
        );


        await renderStudentRecords();


        showMessage(
            studentMessage,
            "Record deleted successfully.",
            "ok"
        );


    } catch (error) {

        showMessage(
            studentMessage,
            error.message ||
            "Failed to delete record.",
            "error"
        );

    }

};



/* =========================
   CLOSE MODAL
========================= */

document.getElementById(
    "closeModalBtn"
).addEventListener(
    "click",
    function() {

        document.getElementById(
            "viewModal"
        ).classList.add(
            "hidden"
        );

    }
);



/* =========================
   SECURITY
========================= */

function escapeHTML(value) {

    return String(
        value ?? ""
    )

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "'",
            "&#039;"
        );

}



/* =========================
   START
========================= */

openStudentDashboard();