CREATE DATABASE StudySync;
GO
USE StudySync;
GO

drop table if EXISTS ScenarioCourses;
drop table if EXISTS GPAScenarios;
drop table if EXISTS CourseMaterials;
drop table if EXISTS Books;
drop table if EXISTS Deadlines;
drop table if EXISTS Grades;
drop table if EXISTS Courses;
drop table if EXISTS Semesters;
drop table if EXISTS Students;
drop table if EXISTS GradePoints;

-- TABLES WITH CONSTRAINTS

create table GradePoints (
    letter_grade varchar(2) primary key,
    grade_points decimal(4,2) not null
);

create table Students (
    student_id int IDENTITY(1,1) primary key,
    full_name varchar(100) not null,
    roll_number varchar(100) Not null,
    email varchar(100) not null unique,
    password varchar(255) not null,
    created_at DATETIME DEFAULT GETDATE()
);

create table Semesters (
    semester_id int IDENTITY(1,1) primary key,
    student_id int not null,
    semester_name varchar(50) NOT NULL,
    start_date DATE,
    end_date DATE,
    foreign key (student_id) references Students(student_id) ON DELETE CASCADE,
    unique (student_id, semester_name)
);

create table Courses (
    course_id int IDENTITY(1,1) primary key,
    semester_id int not NULL,
    course_code varchar(20) not null,
    course_name varchar(100) not null,
    credit_hours decimal(3,1) not null check (credit_hours > 0),
    instructor_name varchar(100),
    foreign key(semester_id) references Semesters(semester_id) ON DELETE CASCADE,
    unique (semester_id, course_code)
);

create table Grades (
    grade_id  int IDENTITY(1,1) PRIMARY KEY,
    course_id int not null unique,
    letter_grade VARCHAR(2) not null,
    comments VARCHAR(500),
    foreign key(letter_grade) references GradePoints(letter_grade)
);

create table Deadlines (
    deadline_id int IDENTITY(1,1) primary key,
    course_id int not null,
    title varchar(150) not null,
    due_date datetime not null,
    status varchar(10) default 'Pending' check(status IN ('Pending', 'Completed')),
    priority varchar(10) default 'Medium' check(priority IN ('High', 'Medium', 'Low')),
    allocated_study_hours decimal(4,1) DEFAULT 0,
    foreign key (course_id) references Courses(course_id) ON DELETE CASCADE
);

create table CourseMaterials (
    material_id int IDENTITY(1,1) primary key,
    course_id int not null,
    material_name varchar(255) not null,
    file_path  varchar(500),
    uploaded_at datetime DEFAULT GETDATE(),
    foreign key(course_id) references Courses(course_id) ON DELETE CASCADE
);

create table Books (
    book_id int IDENTITY(1,1) PRIMARY KEY,
    course_id int not NULL,
    title VARCHAR(255) NOT NULL,
    author varchar(200),
    isbn varchar(20),
    foreign key(course_id)references Courses(course_id) ON DELETE CASCADE
);

create table GPAScenarios (
    scenario_id int IDENTITY(1,1) primary key,
    student_id int NOT NULL,
    scenario_name varchar(100) NOT NULL,
    created_at datetime DEFAULT GETDATE(),
    foreign key(student_id) REFERENCES Students(student_id) ON DELETE CASCADE
);

create table ScenarioCourses (
    scenario_id int NOT NULL,
    course_id int  NOT NULL,
    expected_grade varchar(2) NOT NULL,
    PRIMARY KEY (scenario_id, course_id),
    FOREIGN KEY (scenario_id) REFERENCES GPAScenarios(scenario_id) ON DELETE CASCADE,
    FOREIGN KEY (course_id)REFERENCES Courses(course_id) ON DELETE NO ACTION,
    FOREIGN KEY (expected_grade) REFERENCES GradePoints(letter_grade)
);

-- SAMPLE DATA

insert into GradePoints (letter_grade, grade_points) VALUES
('A',  4.00),
('A-', 3.67),
('B+', 3.33),
('B',  3.00),
('B-', 2.67),
('C+', 2.33),
('C',  2.00),
('F',  0.00);
select * from GradePoints;

INSERT INTO Students (full_name, roll_number, email, password) VALUES
('Zahra Saeed',    'L24-2512', 'l242512@gmail.com', 'abcd'),
('Kashish Fatima', 'L24-2605', 'l242605@gmail.com', 'efgh'),
('Aliyah Rasheed', 'L24-2544', 'l242544@gmail.com', 'ijkl'),
('Hamza Ali',      'L24-1111', 'hamza@example.com', 'pass123'),
('Ayesha Malik',   'L24-2222', 'ayesha@example.com', 'pass456');
select * from Students;

INSERT INTO Semesters (student_id, semester_name, start_date, end_date) VALUES
(1, 'Fall 2023',   '2023-08-20', '2023-12-15'),
(1, 'Spring 2024', '2024-01-10', '2024-05-20'),
(2, 'Fall 2023',   '2023-08-20', '2023-12-15'),
(3, 'Spring 2024', '2024-01-10', '2024-05-20'),
(1, 'Fall 2024',   '2024-08-20', '2024-12-15'),
(2, 'Spring 2024', '2024-01-10', '2024-05-20'),
(3, 'Fall 2023',   '2023-08-20', '2023-12-15'),
(4, 'Fall 2023',   '2023-08-20', '2023-12-15'),
(4, 'Spring 2024', '2024-01-10', '2024-05-20'),
(5, 'Fall 2023',   '2023-08-20', '2023-12-15');
select * from Semesters;

INSERT INTO Courses (semester_id, course_code, course_name, credit_hours, instructor_name) VALUES
(1, 'CS101',  'Programming Fundamentals',      3.0, 'Dr. Ahmed'),
(2, 'CS201',  'Data Structures',               3.0, 'Dr. Ahmed'),
(2, 'CS210',  'Database Systems',              3.0, 'Ms. Fatima'),
(3, 'MT201',  'Applied Physics',                2.0, 'Dr. Zafar'),
(4, 'SS102',  'Expository Writing',             2.0, 'Prof. Ali'),
(5, 'CS102',  'Object Oriented Programming',   3.0, 'Dr. Bilal'),
(6, 'CS220',  'Operating Systems',             3.0, 'Dr. Bilal'),
(7, 'EE101',  'Basic Electronics',             3.0, 'Dr. Khalid'),
(8, 'HS101',  'Communication Skills',           2.0, 'Ms. Sara'),
(9, 'CS101',  'Programming Fundamentals',      3.0, 'Dr. Ahmed'),
(10,'MT101',  'Calculus and Analytical Geometry',3.0, 'Prof. Khan');
select * from Courses;

INSERT INTO Grades (course_id, letter_grade, comments) VALUES
(1, 'A',  'Excellent work'),
(2, 'B+', 'Solidify with book content'),
(5, 'A-', 'Solid understanding'),
(7, 'A-', 'Good grasp of OOP'),
(8, 'B+', 'Needs improvement'),
(11, 'B', 'Average performance');
select * from Grades;

INSERT INTO Deadlines (course_id, title, due_date, status, priority, allocated_study_hours) VALUES
(3, 'Assignment 1: Linked Lists',      '2024-02-15 23:59', 'Pending',   'High',   5.0),
(4, 'Project Proposal',                '2024-02-10 17:00', 'Completed', 'Medium', 2.0),
(4, 'Final Project',                   '2024-05-01 23:59', 'Pending',   'High',   15.0),
(6, 'Essay Draft',                     '2024-03-01 09:00', 'Pending',   'Low',    3.0),
(7, 'Lab Report 2',                    '2024-10-15 23:59', 'Pending',   'Medium', 4.0),
(8, 'Midterm Exam',                     '2024-03-20 10:00', 'Pending',   'High',   8.0),
(9, 'Quiz 1',                           '2023-09-10 11:00', 'Completed', 'Low',    1.0),
(10,'Presentation',                      '2024-04-05 14:00', 'Pending',   'Medium', 3.0);
select * from Deadlines;

INSERT INTO CourseMaterials (course_id, material_name, file_path) VALUES
(1, 'Lecture 1 Slides',      '/uploads/cs101/lec1.pdf'),
(4, 'SQL Cheat Sheet',        '/uploads/cs210/sql_cheat.pdf'),
(6, 'Essay Examples',         '/uploads/ss102/examples.docx'),
(7, 'OOP Lecture Notes',      '/uploads/cs102/oop_notes.pdf'),
(8, 'OS Slides',              '/uploads/cs220/os_slides.pdf');
select * from CourseMaterials;

INSERT INTO Books (course_id, title, author, isbn) VALUES
(1, 'Basics of Programming',      'John Doe',         '978-1590282755'),
(4, 'Database System Concepts',   'Jane Doe',         '978-0078022159'),
(3, 'Data Structures in C++',     'Mike Wazowski',    '978-0131986196'),
(7, 'Object Oriented Programming','Bjarne Stroustrup','978-0321563842'),
(8, 'Operating Systems Concepts', 'Silberschatz',     '978-1119800361');
select * from Books;

INSERT INTO GPAScenarios (student_id, scenario_name) VALUES
(1, 'Best Case Spring 2024'),
(2, 'What if I get A in Physics?'),
(4, 'Try for A in all courses'),
(5, 'Improve CGPA scenario');
select * from GPAScenarios;

INSERT INTO ScenarioCourses (scenario_id, course_id, expected_grade) VALUES
(1, 3, 'A'),
(1, 4, 'A-'),
(2, 5, 'A'),
(3, 9, 'A'),
(3, 10, 'A-'),
(4, 12, 'B+');
select * from ScenarioCourses;

-- BASIC QUERIES

-- 1. Authenticate login
SELECT student_id, full_name
FROM   Students
WHERE  email='l242512@gmail.com' AND password = 'abcd';

-- 2. Register a new student (example)
-- INSERT INTO Students (full_name, roll_number, email, password) VALUES ('Bilal Ahmed', 'L24-3333', 'bilal@example.com', 'mypass');

--  SEMESTER & COURSE MANAGEMENT 
-- 3. Show every course ever taken by a student
SELECT s.semester_name, c.course_code, c.course_name, c.credit_hours
FROM Semesters s
JOIN Courses c ON s.semester_id = c.semester_id
WHERE s.student_id = 1
ORDER BY s.start_date, c.course_code;

---- 4. Add a new semester
--INSERT INTO Semesters (student_id, semester_name, start_date, end_date)
--VALUES (1, 'Summer 2024', '2024-06-01', '2024-07-30'); UK violation 

-- 5. Update a semester's end date
UPDATE Semesters
SET end_date = '2024-08-15'
WHERE student_id = 1 AND semester_name = 'Summer 2024';

---- 6. Add a new course
--INSERT INTO Courses (semester_id, course_code, course_name, credit_hours, instructor_name)
--VALUES (5, 'CS301', 'Artificial Intelligence', 3.0, 'Dr. Javed');
--select * from Courses where course_code = 'CS301'; UK violation need to change values

-- 7. Update a course instructor
UPDATE Courses
SET instructor_name = 'Dr. Tariq'
WHERE course_id = 13;
select * from Courses where course_id = 13;

-- 8. Delete a course – will cascade to related records
DELETE FROM Courses WHERE course_id = 13;

-- GPA & CGPA CALCULATIONS 
-- 9. Calculate CGPA for a student
SELECT st.full_name,
ROUND(SUM(c.credit_hours * gp.grade_points)/SUM(c.credit_hours),2) AS cgpa
FROM Students st
JOIN Semesters s ON st.student_id=s.student_id
JOIN Courses c  ON s.semester_id=c.semester_id
JOIN Grades g  ON c.course_id= g.course_id
JOIN GradePoints gp ON g.letter_grade = gp.letter_grade
WHERE  st.student_id = 1
GROUP BY st.full_name;

-- 10. Semester-wise GPA trend
SELECT s.semester_name,
ROUND(SUM(c.credit_hours * gp.grade_points) / SUM(c.credit_hours), 2) AS semester_gpa
FROM Semesters s 
JOIN Courses c ON s.semester_id= c.semester_id
JOIN Grades g  ON c.course_id= g.course_id
JOIN GradePoints gp ON g.letter_grade = gp.letter_grade
WHERE s.student_id = 1
GROUP BY s.semester_id, s.semester_name, s.start_date
ORDER BY s.start_date;

-- 11. GPA Scenario projection
SELECT gs.scenario_name,
ROUND(SUM(c.credit_hours * gp.grade_points) / SUM(c.credit_hours), 2) AS projected_gpa
FROM GPAScenarios gs
JOIN ScenarioCourses sc ON gs.scenario_id=sc.scenario_id
JOIN Courses c ON sc.course_id=c.course_id
JOIN GradePoints gp ON sc.expected_grade = gp.letter_grade
WHERE gs.scenario_id = 1
GROUP BY gs.scenario_name;

-- 12. List all scenarios created by a student
SELECT scenario_id, scenario_name, created_at
FROM GPAScenarios
WHERE student_id = 1;

-- 13. Show details of a scenario (courses and expected grades)
SELECT sc.course_id, c.course_code, c.course_name, sc.expected_grade
FROM ScenarioCourses sc
JOIN Courses c ON sc.course_id = c.course_id
WHERE sc.scenario_id = 1;

-- DEADLINE & TASK MANAGEMENT 
-- 14. Pending deadlines for a student
SELECT d.title, c.course_code, d.due_date, d.priority
FROM Deadlines d
JOIN Courses c ON d.course_id=c.course_id
JOIN Semesters s ON c.semester_id=s.semester_id
WHERE  s.student_id = 1 AND d.status = 'Pending'
ORDER BY d.due_date ASC;

-- 15. Pending and Completed task count
SELECT d.status, COUNT(*) AS task_count
FROM Deadlines d
JOIN Courses c ON d.course_id =c.course_id
JOIN Semesters s ON c.semester_id = s.semester_id
WHERE s.student_id = 1
GROUP BY d.status;

-- 16. Show upcoming deadlines (next 7 days)
SELECT d.title, c.course_code, d.due_date, d.priority
FROM Deadlines d
JOIN Courses c ON d.course_id = c.course_id
JOIN Semesters s ON c.semester_id = s.semester_id
WHERE s.student_id = 1 
  AND d.status = 'Pending'
  AND d.due_date BETWEEN GETDATE() AND DATEADD(day, 7, GETDATE())
ORDER BY d.due_date;

-- 17. Show overdue pending deadlines
SELECT d.title, c.course_code, d.due_date, d.priority
FROM Deadlines d
JOIN Courses c ON d.course_id = c.course_id
JOIN Semesters s ON c.semester_id = s.semester_id
WHERE s.student_id = 1 
  AND d.status = 'Pending'
  AND d.due_date < GETDATE()
ORDER BY d.due_date;

-- 18. Mark a deadline as completed
UPDATE Deadlines
SET status = 'Completed'
WHERE deadline_id = 1;

-- 19. Update a deadline's priority
UPDATE Deadlines
SET priority = 'High'
WHERE deadline_id = 4;
select * from Deadlines where deadline_id = 4;

-- 20. Insert a new deadline
INSERT INTO Deadlines (course_id, title, due_date, status, priority, allocated_study_hours)
VALUES (7, 'Final Exam', '2024-12-10 09:00', 'Pending', 'High', 10.0);
select * from Deadlines where title = 'Final Exam';

-- 21. Delete a deadline
DELETE FROM Deadlines WHERE deadline_id = 8;

--  STUDY PLANNER 
-- 22. Study planner: tasks sorted by deadline
SELECT d.title AS task_name, c.course_code, d.priority, d.due_date, d.allocated_study_hours
FROM Deadlines d
JOIN Courses c ON d.course_id = c.course_id
JOIN Semesters s ON c.semester_id = s.semester_id
WHERE s.student_id = 1 AND d.status = 'Pending'
ORDER BY d.due_date;

-- 23. Total study hours allocated per course
SELECT c.course_code, c.course_name, SUM(d.allocated_study_hours) AS total_hours
FROM Courses c
JOIN Deadlines d ON c.course_id = d.course_id
JOIN Semesters s ON c.semester_id = s.semester_id
WHERE s.student_id = 1
GROUP BY c.course_id, c.course_code, c.course_name
ORDER BY total_hours DESC;

-- 24. Top 3 courses by study hours
SELECT TOP 3
       c.course_name,
       c.course_code,
       SUM(d.allocated_study_hours) AS total_hours
FROM Courses c
JOIN Deadlines d ON c.course_id = d.course_id
GROUP BY c.course_id, c.course_name, c.course_code
ORDER BY total_hours DESC;

--  COURSE MATERIALS & BOOKS
-- 25. Show all materials for a specific course
SELECT cm.material_name, cm.file_path, cm.uploaded_at
FROM CourseMaterials cm
WHERE cm.course_id = 4;

-- 26. Show all books for a specific course
SELECT b.title, b.author, b.isbn
FROM Books b
WHERE b.course_id = 3;

-- 27. Find books whose title contains a keyword
SELECT title, author, isbn
FROM Books
WHERE title LIKE '%Database%';

-- 28. Count materials per course
SELECT c.course_code, COUNT(cm.material_id) AS material_count
FROM Courses c
LEFT JOIN CourseMaterials cm ON c.course_id = cm.course_id
GROUP BY c.course_id, c.course_code;

-- 29. Insert a new book
INSERT INTO Books (course_id, title, author, isbn)
VALUES (7, 'Clean Code', 'Robert Martin', '978-0132350884');
select * from Books where title = 'Clean Code';

-- 30. Delete a course material
DELETE FROM CourseMaterials
WHERE material_id = 2;

--  ACADEMIC PERFORMANCE REPORTS
-- 31. Course performance summary (all grades for a student)
SELECT s.semester_name, c.course_code, c.course_name, g.letter_grade, gp.grade_points
FROM Students st
JOIN Semesters s ON st.student_id = s.student_id
JOIN Courses c ON s.semester_id = c.semester_id
JOIN Grades g ON c.course_id = g.course_id
JOIN GradePoints gp ON g.letter_grade = gp.letter_grade
WHERE st.student_id = 1
ORDER BY s.start_date, c.course_code;

-- 32. Number of courses each student has per semester, but now with more data
SELECT s.semester_name, COUNT(c.course_id) AS course_count
FROM Semesters s
LEFT JOIN Courses c ON s.semester_id = c.semester_id
WHERE s.student_id = 1
GROUP BY s.semester_id, s.semester_name, s.start_date
ORDER BY s.start_date;

-- 33. List courses without grades (incomplete)
SELECT c.course_code, c.course_name, s.semester_name
FROM Courses c
JOIN Semesters s ON c.semester_id = s.semester_id
LEFT JOIN Grades g ON c.course_id = g.course_id
WHERE g.grade_id IS NULL AND s.student_id = 1;

-- 34. Overall progress: completed vs total tasks
SELECT 
    COUNT(*) AS total_tasks,
    (SELECT COUNT(*) 
     FROM Deadlines d2
     JOIN Courses c2 ON d2.course_id = c2.course_id
     JOIN Semesters s2 ON c2.semester_id = s2.semester_id
     WHERE s2.student_id = 1 AND d2.status = 'Completed') AS completed_tasks,
    ROUND(100.0 * (SELECT COUNT(*) 
                    FROM Deadlines d2
                    JOIN Courses c2 ON d2.course_id = c2.course_id
                    JOIN Semesters s2 ON c2.semester_id = s2.semester_id
                    WHERE s2.student_id = 1 AND d2.status = 'Completed') / COUNT(*), 2) AS completion_percentage
FROM Deadlines d
JOIN Courses c ON d.course_id = c.course_id
JOIN Semesters s ON c.semester_id = s.semester_id
WHERE s.student_id = 1;

-- 35. Average GPA across all students (for admin)
SELECT ROUND(AVG(student_cgpa.cgpa), 2) AS overall_avg_cgpa
FROM (
    SELECT st.student_id,
           ROUND(SUM(c.credit_hours * gp.grade_points)/SUM(c.credit_hours),2) AS cgpa
    FROM Students st
    JOIN Semesters s ON st.student_id=s.student_id
    JOIN Courses c  ON s.semester_id=c.semester_id
    JOIN Grades g  ON c.course_id= g.course_id
    JOIN GradePoints gp ON g.letter_grade = gp.letter_grade
    GROUP BY st.student_id
) AS student_cgpa;