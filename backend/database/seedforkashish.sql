-- ======================================================
-- SEED DATA FOR KASHISH FATIMA (l242605@gmail.com)
-- ======================================================

USE StudySync;
GO

SET NOCOUNT ON;

-- 1. Identify Kashish Fatima's Student ID
DECLARE @KashishID INT;
SELECT @KashishID = student_id FROM Students WHERE email = 'l242605@gmail.com';

-- If user doesn't exist, create them
IF @KashishID IS NULL
BEGIN
    INSERT INTO Students (full_name, roll_number, email, password)
    VALUES ('Kashish Fatima', 'L24-2605', 'l242605@gmail.com', 'efgh');
    SET @KashishID = SCOPE_IDENTITY();
END

PRINT 'Seeding data for Student ID: ' + CAST(@KashishID AS VARCHAR(10));

-- 2. Add More Semesters for Kashish
-- (Using IF NOT EXISTS to avoid duplicates if user runs it multiple times)
IF NOT EXISTS (SELECT 1 FROM Semesters WHERE student_id = @KashishID AND semester_name = 'Fall 2023')
    INSERT INTO Semesters (student_id, semester_name, start_date, end_date) VALUES (@KashishID, 'Fall 2023', '2023-08-20', '2023-12-15');

IF NOT EXISTS (SELECT 1 FROM Semesters WHERE student_id = @KashishID AND semester_name = 'Spring 2024')
    INSERT INTO Semesters (student_id, semester_name, start_date, end_date) VALUES (@KashishID, 'Spring 2024', '2024-01-10', '2024-05-20');

IF NOT EXISTS (SELECT 1 FROM Semesters WHERE student_id = @KashishID AND semester_name = 'Fall 2024')
    INSERT INTO Semesters (student_id, semester_name, start_date, end_date) VALUES (@KashishID, 'Fall 2024', '2024-08-20', '2024-12-15');

-- Get Semester IDs
DECLARE @Fall23 INT = (SELECT semester_id FROM Semesters WHERE student_id = @KashishID AND semester_name = 'Fall 2023');
DECLARE @Spring24 INT = (SELECT semester_id FROM Semesters WHERE student_id = @KashishID AND semester_name = 'Spring 2024');
DECLARE @Fall24 INT = (SELECT semester_id FROM Semesters WHERE student_id = @KashishID AND semester_name = 'Fall 2024');

-- 3. Add Courses for Kashish

-- Fall 2023 (Completed)
INSERT INTO Courses (semester_id, course_code, course_name, credit_hours, instructor_name) VALUES
(@Fall23, 'CS101', 'Programming Fundamentals', 3.0, 'Dr. Ahmed'),
(@Fall23, 'MT101', 'Calculus I', 3.0, 'Dr. Zafar'),
(@Fall23, 'EE101', 'Basic Electronics', 2.0, 'Prof. Ali'),
(@Fall23, 'HS101', 'English Composition', 3.0, 'Ms. Sara');

-- Spring 2024 (In Progress / Partially Graded)
INSERT INTO Courses (semester_id, course_code, course_name, credit_hours, instructor_name) VALUES
(@Spring24, 'CS201', 'Data Structures', 3.0, 'Dr. Ahmed'),
(@Spring24, 'CS210', 'Digital Logic Design', 3.0, 'Ms. Fatima'),
(@Spring24, 'MT202', 'Linear Algebra', 3.0, 'Dr. Zafar'),
(@Spring24, 'SS102', 'Pakistan Studies', 2.0, 'Prof. Ali');

-- Fall 2024 (Future / Current)
INSERT INTO Courses (semester_id, course_code, course_name, credit_hours, instructor_name) VALUES
(@Fall24, 'CS301', 'Algorithms', 3.0, 'Dr. Bilal'),
(@Fall24, 'CS320', 'Database Systems', 3.0, 'Ms. Fatima'),
(@Fall24, 'EE202', 'Signals and Systems', 4.0, 'Dr. Khalid'),
(@Fall24, 'HS201', 'Communication Skills', 2.0, 'Ms. Sara');

-- 4. Add Grades for Kashish (Completed Courses)
-- Get Course IDs for Fall 2023
DECLARE @C1 INT = (SELECT course_id FROM Courses WHERE semester_id = @Fall23 AND course_code = 'CS101');
DECLARE @C2 INT = (SELECT course_id FROM Courses WHERE semester_id = @Fall23 AND course_code = 'MT101');
DECLARE @C3 INT = (SELECT course_id FROM Courses WHERE semester_id = @Fall23 AND course_code = 'EE101');
DECLARE @C4 INT = (SELECT course_id FROM Courses WHERE semester_id = @Fall23 AND course_code = 'HS101');

INSERT INTO Grades (course_id, letter_grade, comments) VALUES
(@C1, 'A', 'Excellent logical thinking'),
(@C2, 'A-', 'Strong mathematical foundation'),
(@C3, 'B+', 'Good lab performance'),
(@C4, 'A', 'Perfect writing skills');

-- 5. Add Books & Resources for Kashish
INSERT INTO Books (course_id, title, author, isbn) VALUES
(@C1, 'C++ Programming: From Problem Analysis to Program Design', 'D.S. Malik', '978-1337102087'),
(@C2, 'Calculus: Early Transcendentals', 'James Stewart', '978-1285741550'),
((SELECT course_id FROM Courses WHERE semester_id = @Spring24 AND course_code = 'CS201'), 'Data Structures and Algorithms in C++', 'Adam Drozdek', '978-1133608424');

-- 6. Add Deadlines for Current Semester (Spring 2024)
DECLARE @DS_ID INT = (SELECT course_id FROM Courses WHERE semester_id = @Spring24 AND course_code = 'CS201');
DECLARE @DLD_ID INT = (SELECT course_id FROM Courses WHERE semester_id = @Spring24 AND course_code = 'CS210');

INSERT INTO Deadlines (course_id, title, due_date, status, priority, allocated_study_hours, description) VALUES
(@DS_ID, 'Assignment 2: Binary Search Trees', DATEADD(DAY, 5, GETDATE()), 'Pending', 'High', 10.0, 'Implement AVL trees and perform rotations.'),
(@DS_ID, 'Quiz 3: Heap Sort', DATEADD(DAY, 2, GETDATE()), 'Pending', 'Medium', 3.0, 'Revise max-heap and min-heap properties.'),
(@DLD_ID, 'Lab Project: 4-bit ALU', DATEADD(DAY, 14, GETDATE()), 'Pending', 'High', 15.0, 'Design and simulate an ALU using Logisim.'),
(@DLD_ID, 'Midterm Revision', DATEADD(DAY, -1, GETDATE()), 'Completed', 'High', 8.0, 'Review all K-Maps and Logic Gates.');

-- 7. Add Tasks to Task Manager (Linked to Deadlines)
DECLARE @D1 INT = (SELECT SCOPE_IDENTITY() - 3); -- Approximation for demo
DECLARE @D2 INT = (SELECT SCOPE_IDENTITY() - 2);
DECLARE @D3 INT = (SELECT SCOPE_IDENTITY() - 1);

INSERT INTO TaskManager (user_id, course_id, title, status, linked_deadline_id) VALUES
(@KashishID, @DS_ID, 'Code the BST Insert Function', 'todo', @D1),
(@KashishID, @DS_ID, 'Test AVL Rotations', 'todo', @D1),
(@KashishID, @DS_ID, 'Read Heap Sort Chapter', 'done', @D2),
(@KashishID, @DLD_ID, 'Complete ALU Circuit Diagram', 'todo', @D3),
(@KashishID, @DLD_ID, 'Revise Truth Tables', 'done', NULL);

-- 8. Add Course Materials
INSERT INTO CourseMaterials (course_id, material_name, file_path) VALUES
(@DS_ID, 'Data Structures Lecture 10', '/uploads/cs201/lec10.pdf'),
(@DLD_ID, 'K-Map Minimization Guide', '/uploads/cs210/kmap_guide.pdf');

-- 9. Add Weightage
INSERT INTO CourseMaterialWeightage (course_id, quizzes_percentage, assignments_percentage, midterm_percentage, final_percentage) VALUES
(@DS_ID, 15, 20, 25, 40),
(@DLD_ID, 10, 25, 25, 40);

-- 10. Summary Progress
INSERT INTO TaskProgress (student_id, total_tasks, completed_tasks, percentage)
VALUES (@KashishID, 20, 12, 60.0)
ON ERROR RESUME NEXT; -- Handle potential unique constraint if exists

PRINT 'Seed data for Kashish Fatima added successfully!';
GO
