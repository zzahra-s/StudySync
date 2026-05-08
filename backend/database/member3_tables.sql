-- Create missing tables for Member 3 features
CREATE TABLE StudyPlannerTasks (
    task_id int IDENTITY(1,1) PRIMARY KEY,
    student_id int NOT NULL,
    title varchar(255) NOT NULL,
    course varchar(100),
    due_date date,
    description text,
    status varchar(20) DEFAULT 'pending',
    created_at datetime DEFAULT GETDATE(),
    FOREIGN KEY (student_id) REFERENCES Students(student_id) ON DELETE CASCADE
);

CREATE TABLE StudyHours (
    hour_id int IDENTITY(1,1) PRIMARY KEY,
    student_id int NOT NULL,
    date date NOT NULL,
    hours decimal(4,2) NOT NULL,
    subject varchar(100),
    course varchar(100),
    created_at datetime DEFAULT GETDATE(),
    FOREIGN KEY (student_id) REFERENCES Students(student_id) ON DELETE CASCADE
);

CREATE TABLE TaskProgress (
    progress_id int IDENTITY(1,1) PRIMARY KEY,
    student_id int NOT NULL,
    total_tasks int DEFAULT 0,
    completed_tasks int DEFAULT 0,
    percentage decimal(5,2) DEFAULT 0,
    updated_at datetime DEFAULT GETDATE(),
    FOREIGN KEY (student_id) REFERENCES Students(student_id) ON DELETE CASCADE,
    UNIQUE(student_id)
);

CREATE TABLE TopCourses (
    top_course_id int IDENTITY(1,1) PRIMARY KEY,
    student_id int NOT NULL,
    course_id int,
    course varchar(100),
    grade varchar(5),
    created_at datetime DEFAULT GETDATE(),
    FOREIGN KEY (student_id) REFERENCES Students(student_id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES Courses(course_id)
);

CREATE TABLE Materials (
    material_id int IDENTITY(1,1) PRIMARY KEY,
    student_id int NOT NULL,
    course_id int,
    file_name varchar(255) NOT NULL,
    description text,
    upload_date date DEFAULT GETDATE(),
    url varchar(500),
    FOREIGN KEY (student_id) REFERENCES Students(student_id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES Courses(course_id)
);

-- Insert sample data for student 1
INSERT INTO StudyPlannerTasks (student_id, title, course, due_date, description, status) VALUES
(1, 'Read Chapter 5', 'CS101', '2025-04-27', 'Read and take notes', 'pending'),
(1, 'Complete Problem Set', 'CS201', '2025-05-01', 'Problems 1-20', 'pending'),
(1, 'Review Notes', 'CS210', '2025-04-27', 'Review lectures', 'completed');

INSERT INTO StudyHours (student_id, date, hours, subject, course) VALUES
(1, '2025-04-20', 2.5, 'Programming', 'CS101'),
(1, '2025-04-21', 3.0, 'Database', 'CS210'),
(1, '2025-04-22', 1.5, 'Data Structures', 'CS201');

INSERT INTO TaskProgress (student_id, total_tasks, completed_tasks, percentage) VALUES
(1, 10, 6, 60.0);

INSERT INTO TopCourses (student_id, course_id, course, grade) VALUES
(1, 1, 'CS101', 'A'),
(1, 2, 'CS201', 'A-');

INSERT INTO Materials (student_id, course_id, file_name, description, upload_date) VALUES
(1, 1, 'Lecture_1_Basics.pdf', 'Introduction to programming basics', '2025-04-15'),
(1, 2, 'Code_Examples.zip', 'Python code examples', '2025-04-16');

-- Insert sample data for other students
INSERT INTO StudyPlannerTasks (student_id, title, course, due_date, description, status) VALUES
(2, 'Physics Lab Report', 'MT201', '2025-05-05', 'Complete lab analysis', 'pending'),
(3, 'Essay Writing', 'SS102', '2025-04-30', 'Write 1000 words', 'pending');

INSERT INTO StudyHours (student_id, date, hours, subject, course) VALUES
(2, '2025-04-20', 2.0, 'Physics', 'MT201'),
(3, '2025-04-21', 1.5, 'English', 'SS102');

INSERT INTO TaskProgress (student_id, total_tasks, completed_tasks, percentage) VALUES
(2, 8, 4, 50.0),
(3, 12, 8, 66.7);

INSERT INTO TopCourses (student_id, course_id, course, grade) VALUES
(2, 3, 'MT201', 'B+'),
(3, 4, 'SS102', 'A');

INSERT INTO Materials (student_id, course_id, file_name, description, upload_date) VALUES
(2, 3, 'Physics_Lab.pdf', 'Lab instructions', '2025-04-15'),
(3, 4, 'Writing_Guide.pdf', 'Essay writing tips', '2025-04-16');

PRINT 'All Member 3 tables created and populated successfully!';