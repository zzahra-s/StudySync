USE StudySync;
GO

/* ===========================
   Schema updates for feature set
   =========================== */
IF COL_LENGTH('Deadlines', 'description') IS NULL
BEGIN
  ALTER TABLE Deadlines ADD description VARCHAR(500) NULL;
END
GO

IF OBJECT_ID('CourseMaterialWeightage', 'U') IS NULL
BEGIN
  CREATE TABLE CourseMaterialWeightage (
    id INT IDENTITY(1,1) PRIMARY KEY,
    course_id INT NOT NULL UNIQUE,
    quizzes_percentage INT NOT NULL CHECK (quizzes_percentage BETWEEN 0 AND 100),
    assignments_percentage INT NOT NULL CHECK (assignments_percentage BETWEEN 0 AND 100),
    midterm_percentage INT NOT NULL CHECK (midterm_percentage BETWEEN 0 AND 100),
    final_percentage INT NOT NULL CHECK (final_percentage BETWEEN 0 AND 100),
    updated_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (course_id) REFERENCES Courses(course_id) ON DELETE CASCADE
  );
END
GO

IF OBJECT_ID('BookMaterial', 'U') IS NULL
BEGIN
  CREATE TABLE BookMaterial (
    id INT IDENTITY(1,1) PRIMARY KEY,
    course_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(200) NOT NULL,
    description VARCHAR(600) NULL,
    pdf_link VARCHAR(500) NULL,
    FOREIGN KEY (course_id) REFERENCES Courses(course_id) ON DELETE CASCADE
  );
END
GO

IF OBJECT_ID('TaskManager', 'U') IS NULL
BEGIN
  CREATE TABLE TaskManager (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    course_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    status VARCHAR(10) NOT NULL CHECK (status IN ('todo', 'done')),
    linked_deadline_id INT NULL,
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES Students(student_id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES Courses(course_id) ON DELETE CASCADE,
    FOREIGN KEY (linked_deadline_id) REFERENCES Deadlines(deadline_id) ON DELETE SET NULL
  );
END
GO

/* ===========================
   Seed data for existing 3 users
   =========================== */
DECLARE @User1 INT = (SELECT TOP 1 student_id FROM Students WHERE email = 'l242512@gmail.com');
DECLARE @User2 INT = (SELECT TOP 1 student_id FROM Students WHERE email = 'l242605@gmail.com');
DECLARE @User3 INT = (SELECT TOP 1 student_id FROM Students WHERE email = 'l242544@gmail.com');

/* Deadlines with descriptions */
INSERT INTO Deadlines (course_id, title, description, due_date, status, priority, allocated_study_hours)
SELECT c.course_id, 'Quiz Practice Set', 'Revise solved examples and complete practice sheet.', DATEADD(DAY, 5, GETDATE()), 'Pending', 'Medium', 2.0
FROM Courses c
JOIN Semesters s ON s.semester_id = c.semester_id
WHERE s.student_id IN (@User1, @User2, @User3)
  AND NOT EXISTS (
    SELECT 1 FROM Deadlines d WHERE d.course_id = c.course_id AND d.title = 'Quiz Practice Set'
  );

INSERT INTO Deadlines (course_id, title, description, due_date, status, priority, allocated_study_hours)
SELECT c.course_id, 'Assignment Submission', 'Finalize assignment report and upload before deadline.', DATEADD(DAY, 10, GETDATE()), 'Pending', 'High', 4.0
FROM Courses c
JOIN Semesters s ON s.semester_id = c.semester_id
WHERE s.student_id IN (@User1, @User2, @User3)
  AND NOT EXISTS (
    SELECT 1 FROM Deadlines d WHERE d.course_id = c.course_id AND d.title = 'Assignment Submission'
  );

INSERT INTO Deadlines (course_id, title, description, due_date, status, priority, allocated_study_hours)
SELECT c.course_id, 'Chapter Revision', 'Review key concepts and summarize notes.', DATEADD(DAY, -2, GETDATE()), 'Completed', 'Low', 1.5
FROM Courses c
JOIN Semesters s ON s.semester_id = c.semester_id
WHERE s.student_id IN (@User1, @User2, @User3)
  AND NOT EXISTS (
    SELECT 1 FROM Deadlines d WHERE d.course_id = c.course_id AND d.title = 'Chapter Revision'
  );

/* Course material weightages for all courses of the 3 users */
INSERT INTO CourseMaterialWeightage (course_id, quizzes_percentage, assignments_percentage, midterm_percentage, final_percentage)
SELECT c.course_id, 10, 20, 30, 40
FROM Courses c
JOIN Semesters s ON s.semester_id = c.semester_id
WHERE s.student_id IN (@User1, @User2, @User3)
  AND NOT EXISTS (
    SELECT 1 FROM CourseMaterialWeightage cmw WHERE cmw.course_id = c.course_id
  );

/* Recommended books: 3 books per course */
INSERT INTO BookMaterial (course_id, title, author, description, pdf_link)
SELECT c.course_id, c.course_name + ' - Core Concepts', 'H. Malik',
       'A strong conceptual guide aligned with weekly lectures.',
       'https://example.com/books/core-concepts.pdf'
FROM Courses c
JOIN Semesters s ON s.semester_id = c.semester_id
WHERE s.student_id IN (@User1, @User2, @User3)
  AND NOT EXISTS (
    SELECT 1 FROM BookMaterial bm WHERE bm.course_id = c.course_id AND bm.title = c.course_name + ' - Core Concepts'
  );

INSERT INTO BookMaterial (course_id, title, author, description, pdf_link)
SELECT c.course_id, c.course_name + ' - Practice Workbook', 'A. Rehman',
       'Contains solved examples, quizzes, and chapter-wise practice.',
       'https://example.com/books/practice-workbook.pdf'
FROM Courses c
JOIN Semesters s ON s.semester_id = c.semester_id
WHERE s.student_id IN (@User1, @User2, @User3)
  AND NOT EXISTS (
    SELECT 1 FROM BookMaterial bm WHERE bm.course_id = c.course_id AND bm.title = c.course_name + ' - Practice Workbook'
  );

INSERT INTO BookMaterial (course_id, title, author, description, pdf_link)
SELECT c.course_id, c.course_name + ' - Exam Prep Notes', 'S. Ahmed',
       'Quick revision notes for midterm/final preparation.',
       'https://example.com/books/exam-prep-notes.pdf'
FROM Courses c
JOIN Semesters s ON s.semester_id = c.semester_id
WHERE s.student_id IN (@User1, @User2, @User3)
  AND NOT EXISTS (
    SELECT 1 FROM BookMaterial bm WHERE bm.course_id = c.course_id AND bm.title = c.course_name + ' - Exam Prep Notes'
  );

/* Task manager data (todo + done), linked to deadlines where possible */
INSERT INTO TaskManager (user_id, course_id, title, status, linked_deadline_id)
SELECT s.student_id, c.course_id, 'Prepare notes for next class', 'todo', NULL
FROM Courses c
JOIN Semesters s ON s.semester_id = c.semester_id
WHERE s.student_id IN (@User1, @User2, @User3)
  AND NOT EXISTS (
    SELECT 1 FROM TaskManager tm
    WHERE tm.user_id = s.student_id AND tm.course_id = c.course_id AND tm.title = 'Prepare notes for next class'
  );

INSERT INTO TaskManager (user_id, course_id, title, status, linked_deadline_id)
SELECT s.student_id, c.course_id, 'Complete weekly problem set', 'todo', NULL
FROM Courses c
JOIN Semesters s ON s.semester_id = c.semester_id
WHERE s.student_id IN (@User1, @User2, @User3)
  AND NOT EXISTS (
    SELECT 1 FROM TaskManager tm
    WHERE tm.user_id = s.student_id AND tm.course_id = c.course_id AND tm.title = 'Complete weekly problem set'
  );

INSERT INTO TaskManager (user_id, course_id, title, status, linked_deadline_id)
SELECT s.student_id, c.course_id, 'Revise previous lecture', 'done', NULL
FROM Courses c
JOIN Semesters s ON s.semester_id = c.semester_id
WHERE s.student_id IN (@User1, @User2, @User3)
  AND NOT EXISTS (
    SELECT 1 FROM TaskManager tm
    WHERE tm.user_id = s.student_id AND tm.course_id = c.course_id AND tm.title = 'Revise previous lecture'
  );

INSERT INTO TaskManager (user_id, course_id, title, status, linked_deadline_id)
SELECT
  s.student_id,
  d.course_id,
  'Work on: ' + d.title,
  CASE WHEN LOWER(d.status) = 'completed' THEN 'done' ELSE 'todo' END,
  d.deadline_id
FROM Deadlines d
JOIN Courses c ON c.course_id = d.course_id
JOIN Semesters s ON s.semester_id = c.semester_id
WHERE s.student_id IN (@User1, @User2, @User3)
  AND NOT EXISTS (
    SELECT 1 FROM TaskManager tm
    WHERE tm.linked_deadline_id = d.deadline_id AND tm.user_id = s.student_id
  );
