CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(20) NOT NULL
        CHECK (role IN ('student', 'department')),
    course VARCHAR(150),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ipt_submissions (
    id SERIAL PRIMARY KEY,

    student_id INTEGER NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    week INTEGER NOT NULL
        CHECK (week BETWEEN 1 AND 5),

    weekly_summary TEXT NOT NULL,

    status VARCHAR(20) NOT NULL DEFAULT 'submitted'
        CHECK (status IN ('submitted', 'reviewed')),

    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(student_id, week)
);

CREATE TABLE IF NOT EXISTS ipt_days (
    id SERIAL PRIMARY KEY,

    submission_id INTEGER NOT NULL
        REFERENCES ipt_submissions(id)
        ON DELETE CASCADE,

    day_number INTEGER NOT NULL
        CHECK (day_number BETWEEN 1 AND 5),

    activity_date DATE NOT NULL,

    activity TEXT NOT NULL,

    UNIQUE(submission_id, day_number)
);

CREATE INDEX IF NOT EXISTS idx_ipt_submissions_student
ON ipt_submissions(student_id);

CREATE INDEX IF NOT EXISTS idx_ipt_submissions_week
ON ipt_submissions(week);