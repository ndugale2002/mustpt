/*const RECORDS_KEY =
    "mustIPTRecords";


const DEPARTMENT_PASSWORD =
    "lecturer123";


const departmentLoginSection =
    document.getElementById(
        "departmentLoginSection"
    );


const departmentDashboard =
    document.getElementById(
        "departmentDashboard"
    );


const departmentLoginForm =
    document.getElementById(
        "departmentLoginForm"
    );


const lecturerId =
    document.getElementById(
        "lecturerId"
    );


const departmentPassword =
    document.getElementById(
        "departmentPassword"
    );


const departmentLoginMessage =
    document.getElementById(
        "departmentLoginMessage"
    );


const departmentRecordsBody =
    document.getElementById(
        "departmentRecordsBody"
    );


const searchStudent =
    document.getElementById(
        "searchStudent"
    );


const filterWeek =
    document.getElementById(
        "filterWeek"
    );


// GET RECORDS

function getRecords() {

    return JSON.parse(
        localStorage.getItem(
            RECORDS_KEY
        )
    ) || [];

}


// MESSAGE

function showMessage(
    element,
    text,
    type
) {

    element.textContent =
        text;

    element.className =
        `message show ${type}`;


    setTimeout(
        () => {

            element.className =
                "message";

        },
        3500
    );

}


// LOGIN

departmentLoginForm.addEventListener(
    "submit",
    function(e) {

        e.preventDefault();


        const id =
            lecturerId.value.trim();


        const password =
            departmentPassword.value.trim();


        if (!id) {

            showMessage(
                departmentLoginMessage,
                "Please enter Lecturer ID.",
                "error"
            );

            return;
        }


        if (
            password !==
            DEPARTMENT_PASSWORD
        ) {

            showMessage(
                departmentLoginMessage,
                "Wrong department password.",
                "error"
            );

            return;
        }


        sessionStorage.setItem(
            "departmentLoggedIn",
            "true"
        );


        sessionStorage.setItem(
            "lecturerId",
            id
        );


        openDepartmentDashboard();

    }
);


// OPEN DASHBOARD

function openDepartmentDashboard() {

    const loggedIn =
        sessionStorage.getItem(
            "departmentLoggedIn"
        );


    const id =
        sessionStorage.getItem(
            "lecturerId"
        );


    if (
        loggedIn !== "true" ||
        !id
    ) {

        return;

    }


    departmentLoginSection
        .classList
        .add("hidden");


    departmentDashboard
        .classList
        .remove("hidden");


    document.getElementById(
        "welcomeLecturer"
    ).textContent =
        `Logged in as Lecturer: ${id}`;


    renderDepartmentRecords();

}


// LOGOUT

document.getElementById(
    "departmentLogoutBtn"
).addEventListener(
    "click",
    function() {

        sessionStorage.removeItem(
            "departmentLoggedIn"
        );


        sessionStorage.removeItem(
            "lecturerId"
        );


        location.reload();

    }
);


// DISPLAY RECORDS

function renderDepartmentRecords() {

    let records =
        getRecords();


    const searchValue =
        searchStudent
            .value
            .trim()
            .toLowerCase();


    const weekValue =
        filterWeek.value;


    if (searchValue) {

        records =
            records.filter(
                record =>

                    record.regNo
                        .toLowerCase()
                        .includes(searchValue)

                    ||

                    record.fullName
                        .toLowerCase()
                        .includes(searchValue)
            );

    }


    if (weekValue) {

        records =
            records.filter(
                record =>
                    String(record.week)
                    === weekValue
            );

    }


    records.sort(
        (a, b) =>
            b.id - a.id
    );


    departmentRecordsBody.innerHTML =
        "";


    if (
        records.length === 0
    ) {

        departmentRecordsBody.innerHTML = `

            <tr>

                <td
                    colspan="7"
                    class="empty">

                    No student submissions found.

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
                    ${escapeHTML(record.regNo)}
                </td>

                <td>
                    ${escapeHTML(record.fullName)}
                </td>

                <td>
                    ${escapeHTML(record.course)}
                </td>

                <td>
                    Week ${record.week}
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
                        onclick="departmentViewRecord(${record.id})">

                        Read

                    </button>

                </td>

            `;


            departmentRecordsBody.appendChild(
                row
            );

        }
    );

}


// SEARCH

searchStudent.addEventListener(
    "input",
    renderDepartmentRecords
);


// FILTER

filterWeek.addEventListener(
    "change",
    renderDepartmentRecords
);


// READ

window.departmentViewRecord =
function(id) {

    const record =
        getRecords()
        .find(
            item =>
                item.id === id
        );


    if (!record) return;


    const daysHTML =
        record.days
        .map(
            day => `

                <div class="detail-box">

                    <strong>

                        Day ${day.day}
                        -
                        ${escapeHTML(day.date)}

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
        "departmentViewContent"
    ).innerHTML = `

        <p>

            <strong>
                Registration Number:
            </strong>

            ${escapeHTML(record.regNo)}

        </p>


        <p>

            <strong>
                Student Name:
            </strong>

            ${escapeHTML(record.fullName)}

        </p>


        <p>

            <strong>
                Course:
            </strong>

            ${escapeHTML(record.course)}

        </p>


        <p>

            <strong>
                IPT Week:
            </strong>

            Week ${record.week}

        </p>


        <hr style="margin:14px 0;">


        ${daysHTML}


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
        "departmentViewModal"
    )
    .classList
    .remove("hidden");

};


// CLOSE MODAL

document.getElementById(
    "departmentCloseModalBtn"
).addEventListener(
    "click",
    function() {

        document.getElementById(
            "departmentViewModal"
        )
        .classList
        .add("hidden");

    }
);


// SECURITY

function escapeHTML(value) {

    return String(value ?? "")

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


// START

openDepartmentDashboard();*/




//hii inatumia backend
// ==========================================
// API CONFIG
// ==========================================

const API_URL = "http://localhost:4000/api";


// ==========================================
// DOM ELEMENTS
// ==========================================

const departmentLoginSection =
    document.getElementById("departmentLoginSection");

const departmentDashboard =
    document.getElementById("departmentDashboard");

const departmentLoginForm =
    document.getElementById("departmentLoginForm");

const lecturerId =
    document.getElementById("lecturerId");

const departmentPassword =
    document.getElementById("departmentPassword");

const departmentLoginMessage =
    document.getElementById("departmentLoginMessage");

const departmentRecordsBody =
    document.getElementById("departmentRecordsBody");

const searchStudent =
    document.getElementById("searchStudent");

const filterWeek =
    document.getElementById("filterWeek");


// ==========================================
// API REQUEST FUNCTION
// ==========================================

async function apiRequest(endpoint, options = {}) {

    const token =
        sessionStorage.getItem("departmentToken");

    const response = await fetch(
        `${API_URL}${endpoint}`,
        {
            ...options,

            headers: {
                "Content-Type": "application/json",

                ...(token
                    ? {
                        "Authorization":
                            `Bearer ${token}`
                    }
                    : {}),

                ...(options.headers || {})
            }
        }
    );

    const data =
        await response.json().catch(() => ({}));

    if (!response.ok) {

        throw new Error(
            data.message ||
            "Request failed"
        );

    }

    return data;
}


// ==========================================
// MESSAGE
// ==========================================

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


// ==========================================
// LOGIN
// ==========================================

departmentLoginForm.addEventListener(
    "submit",
    async function(e) {

        e.preventDefault();

        const username =
            lecturerId.value.trim();

        const password =
            departmentPassword.value.trim();


        if (!username) {

            showMessage(
                departmentLoginMessage,
                "Please enter username.",
                "error"
            );

            return;
        }


        if (!password) {

            showMessage(
                departmentLoginMessage,
                "Please enter password.",
                "error"
            );

            return;
        }


        try {

            showMessage(
                departmentLoginMessage,
                "Logging in...",
                "success"
            );


            const data =
                await apiRequest(
                    "/auth/login",
                    {
                        method: "POST",

                        body: JSON.stringify({

                            username: username,

                            password: password

                        })
                    }
                );


            // SAVE TOKEN

            if (data.token) {

                sessionStorage.setItem(
                    "departmentToken",
                    data.token
                );

            }


            // SAVE USER

            if (data.user) {

                sessionStorage.setItem(
                    "departmentUser",
                    JSON.stringify(data.user)
                );

            }


            sessionStorage.setItem(
                "departmentLoggedIn",
                "true"
            );


            sessionStorage.setItem(
                "lecturerId",
                username
            );


            showMessage(
                departmentLoginMessage,
                "Login successful.",
                "success"
            );


            setTimeout(() => {

                openDepartmentDashboard();

            }, 500);


        } catch (error) {

            console.error(
                "Department login error:",
                error
            );


            showMessage(
                departmentLoginMessage,
                error.message ||
                "Login failed.",
                "error"
            );

        }

    }
);


// ==========================================
// OPEN DASHBOARD
// ==========================================

async function openDepartmentDashboard() {

    const loggedIn =
        sessionStorage.getItem(
            "departmentLoggedIn"
        );

    const token =
        sessionStorage.getItem(
            "departmentToken"
        );

    const id =
        sessionStorage.getItem(
            "lecturerId"
        );


    if (
        loggedIn !== "true" ||
        !token ||
        !id
    ) {

        return;

    }


    departmentLoginSection
        .classList
        .add("hidden");


    departmentDashboard
        .classList
        .remove("hidden");


    const welcomeLecturer =
        document.getElementById(
            "welcomeLecturer"
        );


    if (welcomeLecturer) {

        welcomeLecturer.textContent =
            `Logged in as Lecturer: ${id}`;

    }


    await renderDepartmentRecords();

}


// ==========================================
// GET RECORDS FROM BACKEND
// ==========================================

async function getRecords() {

    try {

        const data =
            await apiRequest(
                "/records"
            );


        // Backend inaweza kurudisha:
        // { records: [...] }

        if (Array.isArray(data)) {

            return data;

        }


        if (Array.isArray(data.records)) {

            return data.records;

        }


        return [];

    } catch (error) {

        console.error(
            "Failed to get records:",
            error
        );


        return [];

    }

}


// ==========================================
// DISPLAY RECORDS
// ==========================================

async function renderDepartmentRecords() {

    let records =
        await getRecords();


    const searchValue =
        searchStudent
            .value
            .trim()
            .toLowerCase();


    const weekValue =
        filterWeek.value;


    // SEARCH

    if (searchValue) {

        records =
            records.filter(record => {

                const regNo =
                    String(
                        record.regNo ??
                        record.reg_no ??
                        ""
                    ).toLowerCase();


                const fullName =
                    String(
                        record.fullName ??
                        record.full_name ??
                        ""
                    ).toLowerCase();


                return (
                    regNo.includes(searchValue) ||
                    fullName.includes(searchValue)
                );

            });

    }


    // FILTER WEEK

    if (weekValue) {

        records =
            records.filter(record => {

                return String(
                    record.week
                ) === weekValue;

            });

    }


    // SORT

    records.sort(
        (a, b) =>
            Number(b.id) -
            Number(a.id)
    );


    departmentRecordsBody.innerHTML =
        "";


    // NO RECORDS

    if (records.length === 0) {

        departmentRecordsBody.innerHTML = `

            <tr>

                <td
                    colspan="7"
                    class="empty">

                    No student submissions found.

                </td>

            </tr>

        `;

        return;

    }


    // DISPLAY

    records.forEach(record => {

        const row =
            document.createElement("tr");


        const regNo =
            record.regNo ??
            record.reg_no ??
            "";


        const fullName =
            record.fullName ??
            record.full_name ??
            "";


        const course =
            record.course ??
            "";


        const summary =
            record.summary ??
            "";


        const submittedAt =
            record.submittedAt ??
            record.submitted_at ??
            "";


        row.innerHTML = `

            <td>

                ${escapeHTML(regNo)}

            </td>


            <td>

                ${escapeHTML(fullName)}

            </td>


            <td>

                ${escapeHTML(course)}

            </td>


            <td>

                Week ${escapeHTML(record.week)}

            </td>


            <td>

                ${escapeHTML(summary)}

            </td>


            <td>

                ${escapeHTML(submittedAt)}

            </td>


            <td>

                <button
                    class="small-btn primary"
                    onclick="departmentViewRecord(${record.id})">

                    Read

                </button>

            </td>

        `;


        departmentRecordsBody.appendChild(
            row
        );

    });

}


// ==========================================
// SEARCH
// ==========================================

searchStudent.addEventListener(
    "input",
    renderDepartmentRecords
);


// ==========================================
// FILTER
// ==========================================

filterWeek.addEventListener(
    "change",
    renderDepartmentRecords
);


// ==========================================
// READ SINGLE RECORD
// ==========================================

window.departmentViewRecord =
async function(id) {

    try {

        const data =
            await apiRequest(
                `/records/${id}`
            );


        const record =
            data.record ??
            data;


        if (!record) {

            return;

        }


        const days =
            record.days || [];


        const daysHTML =
            days
                .map(day => {

                    return `

                        <div class="detail-box">

                            <strong>

                                Day ${escapeHTML(day.day)}

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

                    `;

                })
                .join("");


        const regNo =
            record.regNo ??
            record.reg_no ??
            "";


        const fullName =
            record.fullName ??
            record.full_name ??
            "";


        const course =
            record.course ??
            "";


        const summary =
            record.summary ??
            "";


        document.getElementById(
            "departmentViewContent"
        ).innerHTML = `

            <p>

                <strong>
                    Registration Number:
                </strong>

                ${escapeHTML(regNo)}

            </p>


            <p>

                <strong>
                    Student Name:
                </strong>

                ${escapeHTML(fullName)}

            </p>


            <p>

                <strong>
                    Course:
                </strong>

                ${escapeHTML(course)}

            </p>


            <p>

                <strong>
                    IPT Week:
                </strong>

                Week ${escapeHTML(record.week)}

            </p>


            <hr
                style="margin:14px 0;"
            >


            ${daysHTML}


            <div class="detail-box">

                <strong>
                    Weekly Summary
                </strong>


                <p>

                    ${escapeHTML(summary)}

                </p>

            </div>

        `;


        document.getElementById(
            "departmentViewModal"
        )
        .classList
        .remove("hidden");


    } catch (error) {

        console.error(
            "Failed to load record:",
            error
        );

        alert(
            error.message ||
            "Failed to load record"
        );

    }

};


// ==========================================
// CLOSE MODAL
// ==========================================

document.getElementById(
    "departmentCloseModalBtn"
).addEventListener(
    "click",
    function() {

        document.getElementById(
            "departmentViewModal"
        )
        .classList
        .add("hidden");

    }
);


// ==========================================
// SECURITY
// ==========================================

function escapeHTML(value) {

    return String(value ?? "")

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


// ==========================================
// LOGOUT
// ==========================================

document.getElementById(
    "departmentLogoutBtn"
).addEventListener(
    "click",
    function() {

        sessionStorage.removeItem(
            "departmentLoggedIn"
        );


        sessionStorage.removeItem(
            "departmentToken"
        );


        sessionStorage.removeItem(
            "departmentUser"
        );


        sessionStorage.removeItem(
            "lecturerId"
        );


        location.reload();

    }
);


// ==========================================
// START
// ==========================================

openDepartmentDashboard();