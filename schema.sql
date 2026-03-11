
CREATE TABLE users (
 id SERIAL PRIMARY KEY,
 name TEXT NOT NULL,
 email TEXT UNIQUE NOT NULL,
 password_hash TEXT,
 role TEXT DEFAULT 'student',
 created_at TIMESTAMP DEFAULT NOW(),
 active BOOLEAN DEFAULT TRUE
);

CREATE TABLE courses (
 id SERIAL PRIMARY KEY,
 title TEXT,
 description TEXT,
 price NUMERIC,
 workload_hours INTEGER,
 cover_image TEXT,
 trailer_youtube TEXT,
 teacher_id INTEGER,
 min_grade INTEGER,
 max_installments INTEGER,
 created_at TIMESTAMP DEFAULT NOW(),
 active BOOLEAN DEFAULT TRUE
);

CREATE TABLE lessons (
 id SERIAL PRIMARY KEY,
 course_id INTEGER,
 title TEXT,
 type TEXT,
 content TEXT,
 video_url TEXT,
 meet_url TEXT,
 order_index INTEGER,
 created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE materials (
 id SERIAL PRIMARY KEY,
 lesson_id INTEGER,
 title TEXT,
 drive_url TEXT
);

CREATE TABLE enrollments (
 id SERIAL PRIMARY KEY,
 student_id INTEGER,
 course_id INTEGER,
 enrolled_at TIMESTAMP DEFAULT NOW(),
 completed BOOLEAN DEFAULT FALSE,
 completion_date TIMESTAMP
);

CREATE TABLE progress (
 id SERIAL PRIMARY KEY,
 student_id INTEGER,
 lesson_id INTEGER,
 completed BOOLEAN DEFAULT FALSE,
 completed_at TIMESTAMP
);

CREATE TABLE exams (
 id SERIAL PRIMARY KEY,
 course_id INTEGER,
 title TEXT,
 type TEXT,
 min_grade INTEGER
);

CREATE TABLE questions (
 id SERIAL PRIMARY KEY,
 exam_id INTEGER,
 question_text TEXT,
 option_a TEXT,
 option_b TEXT,
 option_c TEXT,
 option_d TEXT,
 option_e TEXT,
 correct_option TEXT
);

CREATE TABLE exam_results (
 id SERIAL PRIMARY KEY,
 student_id INTEGER,
 exam_id INTEGER,
 score INTEGER,
 approved BOOLEAN,
 completed_at TIMESTAMP
);

CREATE TABLE payments (
 id SERIAL PRIMARY KEY,
 student_id INTEGER,
 course_id INTEGER,
 total_value NUMERIC,
 entry_value NUMERIC,
 installments INTEGER,
 created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE installments (
 id SERIAL PRIMARY KEY,
 payment_id INTEGER,
 number INTEGER,
 value NUMERIC,
 due_date TIMESTAMP,
 paid BOOLEAN DEFAULT FALSE,
 paid_at TIMESTAMP
);

CREATE TABLE sessions (
 id SERIAL PRIMARY KEY,
 user_id INTEGER,
 ip TEXT,
 device_hash TEXT,
 created_at TIMESTAMP DEFAULT NOW(),
 last_activity TIMESTAMP,
 active BOOLEAN DEFAULT TRUE
);
