-- StudySync sample data for Supabase / PostgreSQL (port of the data in finalizednormalized.sql).
-- Optional: run after schema.sql on a fresh database.
-- Demo logins use plain-text passwords (e.g. l242512@gmail.com / abcd); skip this file for a real launch.

INSERT INTO Students (full_name, roll_number, email, password) VALUES
('Zahra Saeed', 'L24-2512', 'l242512@gmail.com', 'abcd'),
('Kashish Fatima', 'L24-2605', 'l242605@gmail.com', 'efgh'),
('Aliyah Rasheed', 'L24-2544', 'l242544@gmail.com', 'ijkl'),
('Hamza Ali', 'L24-1111', 'hamza@example.com', 'pass123'),
('Ayesha Malik', 'L24-2222', 'ayesha@example.com', 'pass456');

INSERT INTO Semesters (student_id, semester_name, start_date, end_date) VALUES
(1, 'Fall 2023', '2023-08-20', '2023-12-15'),
(1, 'Spring 2024', '2024-01-10', '2024-05-20'),
(2, 'Fall 2023', '2023-08-20', '2023-12-15'),
(3, 'Spring 2024', '2024-01-10', '2024-05-20'),
(1, 'Fall 2024', '2024-08-20', '2024-12-15'),
(2, 'Spring 2024', '2024-01-10', '2024-05-20'),
(3, 'Fall 2023', '2023-08-20', '2023-12-15'),
(4, 'Fall 2023', '2023-08-20', '2023-12-15'),
(4, 'Spring 2024', '2024-01-10', '2024-05-20'),
(5, 'Fall 2023', '2023-08-20', '2023-12-15');

INSERT INTO Courses (semester_id, course_code, course_name, credit_hours, instructor_name) VALUES
(1, 'CS101', 'Programming Fundamentals', 3.0, 'Dr. Ahmed'),
(2, 'CS201', 'Data Structures', 3.0, 'Dr. Ahmed'),
(2, 'CS210', 'Database Systems', 3.0, 'Ms. Fatima'),
(3, 'MT201', 'Applied Physics', 2.0, 'Dr. Zafar'),
(4, 'SS102', 'Expository Writing', 2.0, 'Prof. Ali'),
(5, 'CS102', 'Object Oriented Programming', 3.0, 'Dr. Bilal'),
(6, 'CS220', 'Operating Systems', 3.0, 'Dr. Bilal'),
(7, 'EE101', 'Basic Electronics', 3.0, 'Dr. Khalid'),
(8, 'HS101', 'Communication Skills', 2.0, 'Ms. Sara'),
(9, 'CS101', 'Programming Fundamentals', 3.0, 'Dr. Ahmed'),
(10, 'MT101', 'Calculus and Analytical Geometry', 3.0, 'Prof. Khan');

INSERT INTO Grades (course_id, letter_grade, comments) VALUES
(1, 'A', 'Excellent work'),
(2, 'B+', 'Solidify with book content'),
(5, 'A-', 'Solid understanding'),
(7, 'A-', 'Good grasp of OOP'),
(8, 'B+', 'Needs improvement'),
(11, 'B', 'Average performance');

INSERT INTO Deadlines (course_id, title, due_date, status, priority, allocated_study_hours) VALUES
(3, 'Assignment 1: Linked Lists', '2024-02-15 23:59', 'Pending', 'High', 5.0),
(4, 'Project Proposal', '2024-02-10 17:00', 'Completed', 'Medium', 2.0),
(4, 'Final Project', '2024-05-01 23:59', 'Pending', 'High', 15.0),
(6, 'Essay Draft', '2024-03-01 09:00', 'Pending', 'Low', 3.0),
(7, 'Lab Report 2', '2024-10-15 23:59', 'Pending', 'Medium', 4.0),
(8, 'Midterm Exam', '2024-03-20 10:00', 'Pending', 'High', 8.0),
(9, 'Quiz 1', '2023-09-10 11:00', 'Completed', 'Low', 1.0),
(10, 'Presentation', '2024-04-05 14:00', 'Pending', 'Medium', 3.0);

INSERT INTO CourseMaterials (course_id, student_id, material_name, file_path) VALUES
(1, NULL, 'Lecture 1 Slides', '/uploads/cs101/lec1.pdf'),
(4, NULL, 'SQL Cheat Sheet', '/uploads/cs210/sql_cheat.pdf'),
(6, NULL, 'Essay Examples', '/uploads/ss102/examples.docx'),
(7, NULL, 'OOP Lecture Notes', '/uploads/cs102/oop_notes.pdf'),
(8, NULL, 'OS Slides', '/uploads/cs220/os_slides.pdf'),
(1, 1, 'Lecture_1_Basics.pdf', '/uploads/student/lec1_basics.pdf'),
(2, 1, 'Code_Examples.zip', '/uploads/student/code_examples.zip'),
(4, 2, 'Physics_Lab.pdf', '/uploads/student/physics_lab.pdf'),
(5, 3, 'Writing_Guide.pdf', '/uploads/student/writing_guide.pdf');

INSERT INTO Books (course_id, title, author, isbn) VALUES
(1, 'Basics of Programming', 'John Doe', '978-1590282755'),
(4, 'Database System Concepts', 'Jane Doe', '978-0078022159'),
(3, 'Data Structures in C++', 'Mike Wazowski', '978-0131986196'),
(7, 'Object Oriented Programming', 'Bjarne Stroustrup', '978-0321563842'),
(8, 'Operating Systems Concepts', 'Silberschatz', '978-1119800361');

INSERT INTO GPAScenarios (student_id, scenario_name) VALUES
(1, 'Best Case Spring 2024'),
(2, 'What if I get A in Physics?'),
(4, 'Try for A in all courses'),
(5, 'Improve CGPA scenario');

INSERT INTO ScenarioCourses (scenario_id, course_id, expected_grade) VALUES
(1, 3, 'A'),
(1, 4, 'A-'),
(2, 5, 'A'),
(3, 9, 'A'),
(3, 10, 'A-'),
(4, 11, 'B+');

INSERT INTO StudyPlannerTasks (student_id, course_id, title, due_date, description, status) VALUES
(1, 1, 'Read Chapter 5', '2025-04-27', 'Read and take notes', 'pending'),
(1, 2, 'Complete Problem Set', '2025-05-01', 'Problems 1-20', 'pending'),
(1, 3, 'Review Notes', '2025-04-27', 'Review lectures', 'completed'),
(2, 4, 'Physics Lab Report', '2025-05-05', 'Complete lab analysis', 'pending'),
(3, 5, 'Essay Writing', '2025-04-30', 'Write 1000 words', 'pending');

INSERT INTO StudyHours (student_id, course_id, date, hours) VALUES
(1, 1, '2025-04-20', 2.5),
(1, 3, '2025-04-21', 3.0),
(1, 2, '2025-04-22', 1.5),
(2, 4, '2025-04-20', 2.0),
(3, 5, '2025-04-21', 1.5);

INSERT INTO TaskProgress (student_id, total_tasks, completed_tasks) VALUES
(1, 10, 6),
(2, 8, 4),
(3, 12, 8);

INSERT INTO TopCourses (student_id, course_id) VALUES
(1, 1),
(1, 2),
(2, 4),
(3, 5);

INSERT INTO Deadlines (course_id, title, description, due_date, status, priority, allocated_study_hours)
SELECT c.course_id, 'Quiz Practice Set', 'Revise solved examples and complete practice sheet.', timezone('utc', now()) + INTERVAL '5 days', 'Pending', 'Medium', 2.0
FROM Courses c
JOIN Semesters s ON s.semester_id = c.semester_id
WHERE s.student_id IN (SELECT student_id FROM Students WHERE email IN ('l242512@gmail.com', 'l242605@gmail.com', 'l242544@gmail.com'))
  AND NOT EXISTS (SELECT 1 FROM Deadlines d WHERE d.course_id = c.course_id AND d.title = 'Quiz Practice Set');

INSERT INTO Deadlines (course_id, title, description, due_date, status, priority, allocated_study_hours)
SELECT c.course_id, 'Assignment Submission', 'Finalize assignment report and upload before deadline.', timezone('utc', now()) + INTERVAL '10 days', 'Pending', 'High', 4.0
FROM Courses c
JOIN Semesters s ON s.semester_id = c.semester_id
WHERE s.student_id IN (SELECT student_id FROM Students WHERE email IN ('l242512@gmail.com', 'l242605@gmail.com', 'l242544@gmail.com'))
  AND NOT EXISTS (SELECT 1 FROM Deadlines d WHERE d.course_id = c.course_id AND d.title = 'Assignment Submission');

INSERT INTO Deadlines (course_id, title, description, due_date, status, priority, allocated_study_hours)
SELECT c.course_id, 'Chapter Revision', 'Review key concepts and summarize notes.', timezone('utc', now()) + INTERVAL '-2 days', 'Completed', 'Low', 1.5
FROM Courses c
JOIN Semesters s ON s.semester_id = c.semester_id
WHERE s.student_id IN (SELECT student_id FROM Students WHERE email IN ('l242512@gmail.com', 'l242605@gmail.com', 'l242544@gmail.com'))
  AND NOT EXISTS (SELECT 1 FROM Deadlines d WHERE d.course_id = c.course_id AND d.title = 'Chapter Revision');

INSERT INTO CourseMaterialWeightage (course_id, quizzes_percentage, assignments_percentage, midterm_percentage, final_percentage)
SELECT c.course_id, 10, 20, 30, 40
FROM Courses c
JOIN Semesters s ON s.semester_id = c.semester_id
WHERE s.student_id IN (SELECT student_id FROM Students WHERE email IN ('l242512@gmail.com', 'l242605@gmail.com', 'l242544@gmail.com'))
  AND NOT EXISTS (SELECT 1 FROM CourseMaterialWeightage cmw WHERE cmw.course_id = c.course_id);

INSERT INTO Books (course_id, title, author, description, pdf_link)
SELECT c.course_id, c.course_name || ' - Core Concepts', 'H. Malik',
       'A strong conceptual guide aligned with weekly lectures.',
       'https://example.com/books/core-concepts.pdf'
FROM Courses c
JOIN Semesters s ON s.semester_id = c.semester_id
WHERE s.student_id IN (SELECT student_id FROM Students WHERE email IN ('l242512@gmail.com', 'l242605@gmail.com', 'l242544@gmail.com'))
  AND NOT EXISTS (SELECT 1 FROM Books b WHERE b.course_id = c.course_id AND b.title = c.course_name || ' - Core Concepts');

INSERT INTO Books (course_id, title, author, description, pdf_link)
SELECT c.course_id, c.course_name || ' - Practice Workbook', 'A. Rehman',
       'Contains solved examples, quizzes, and chapter-wise practice.',
       'https://example.com/books/practice-workbook.pdf'
FROM Courses c
JOIN Semesters s ON s.semester_id = c.semester_id
WHERE s.student_id IN (SELECT student_id FROM Students WHERE email IN ('l242512@gmail.com', 'l242605@gmail.com', 'l242544@gmail.com'))
  AND NOT EXISTS (SELECT 1 FROM Books b WHERE b.course_id = c.course_id AND b.title = c.course_name || ' - Practice Workbook');

INSERT INTO Books (course_id, title, author, description, pdf_link)
SELECT c.course_id, c.course_name || ' - Exam Prep Notes', 'S. Ahmed',
       'Quick revision notes for midterm/final preparation.',
       'https://example.com/books/exam-prep-notes.pdf'
FROM Courses c
JOIN Semesters s ON s.semester_id = c.semester_id
WHERE s.student_id IN (SELECT student_id FROM Students WHERE email IN ('l242512@gmail.com', 'l242605@gmail.com', 'l242544@gmail.com'))
  AND NOT EXISTS (SELECT 1 FROM Books b WHERE b.course_id = c.course_id AND b.title = c.course_name || ' - Exam Prep Notes');

INSERT INTO TaskManager (user_id, course_id, title, status, linked_deadline_id)
SELECT s.student_id, c.course_id, 'Prepare notes for next class', 'todo', NULL
FROM Courses c
JOIN Semesters s ON s.semester_id = c.semester_id
WHERE s.student_id IN (SELECT student_id FROM Students WHERE email IN ('l242512@gmail.com', 'l242605@gmail.com', 'l242544@gmail.com'))
  AND NOT EXISTS (SELECT 1 FROM TaskManager tm WHERE tm.user_id = s.student_id AND tm.course_id = c.course_id AND tm.title = 'Prepare notes for next class');

INSERT INTO TaskManager (user_id, course_id, title, status, linked_deadline_id)
SELECT s.student_id, c.course_id, 'Complete weekly problem set', 'todo', NULL
FROM Courses c
JOIN Semesters s ON s.semester_id = c.semester_id
WHERE s.student_id IN (SELECT student_id FROM Students WHERE email IN ('l242512@gmail.com', 'l242605@gmail.com', 'l242544@gmail.com'))
  AND NOT EXISTS (SELECT 1 FROM TaskManager tm WHERE tm.user_id = s.student_id AND tm.course_id = c.course_id AND tm.title = 'Complete weekly problem set');

INSERT INTO TaskManager (user_id, course_id, title, status, linked_deadline_id)
SELECT s.student_id, c.course_id, 'Revise previous lecture', 'done', NULL
FROM Courses c
JOIN Semesters s ON s.semester_id = c.semester_id
WHERE s.student_id IN (SELECT student_id FROM Students WHERE email IN ('l242512@gmail.com', 'l242605@gmail.com', 'l242544@gmail.com'))
  AND NOT EXISTS (SELECT 1 FROM TaskManager tm WHERE tm.user_id = s.student_id AND tm.course_id = c.course_id AND tm.title = 'Revise previous lecture');

INSERT INTO TaskManager (user_id, course_id, title, status, linked_deadline_id)
SELECT
  s.student_id,
  d.course_id,
  'Work on: ' || d.title,
  CASE WHEN LOWER(d.status) = 'completed' THEN 'done' ELSE 'todo' END,
  d.deadline_id
FROM Deadlines d
JOIN Courses c ON c.course_id = d.course_id
JOIN Semesters s ON s.semester_id = c.semester_id
WHERE s.student_id IN (SELECT student_id FROM Students WHERE email IN ('l242512@gmail.com', 'l242605@gmail.com', 'l242544@gmail.com'))
  AND NOT EXISTS (SELECT 1 FROM TaskManager tm WHERE tm.linked_deadline_id = d.deadline_id AND tm.user_id = s.student_id);
