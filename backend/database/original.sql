/*
  StudySync clean baseline schema.
  Run this first, then run database/seed.sql for sample data.
*/

USE master;
GO
DROP DATABASE IF EXISTS StudySync;
GO
CREATE DATABASE StudySync;
GO
USE StudySync;
GO

DROP TABLE IF EXISTS TaskManager;
DROP TABLE IF EXISTS BookMaterial;
DROP TABLE IF EXISTS CourseMaterialWeightage;
DROP TABLE IF EXISTS TaskProgress;
DROP TABLE IF EXISTS ScenarioCourses;
DROP TABLE IF EXISTS GPAScenarios;
DROP TABLE IF EXISTS Deadlines;
DROP TABLE IF EXISTS Grades;
DROP TABLE IF EXISTS Courses;
DROP TABLE IF EXISTS Semesters;
DROP TABLE IF EXISTS Students;
DROP TABLE IF EXISTS GradePoints;
GO

CREATE TABLE GradePoints (
  letter_grade VARCHAR(2) PRIMARY KEY,
  grade_points DECIMAL(4,2) NOT NULL
);

CREATE TABLE Students (
  student_id INT IDENTITY(1,1) PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  roll_number VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at DATETIME DEFAULT GETDATE()
);

CREATE TABLE Semesters (
  semester_id INT IDENTITY(1,1) PRIMARY KEY,
  student_id INT NOT NULL,
  semester_name VARCHAR(50) NOT NULL,
  start_date DATE,
  end_date DATE,
  FOREIGN KEY (student_id) REFERENCES Students(student_id) ON DELETE CASCADE,
  UNIQUE (student_id, semester_name)
);

CREATE TABLE Courses (
  course_id INT IDENTITY(1,1) PRIMARY KEY,
  semester_id INT NOT NULL,
  course_code VARCHAR(20) NOT NULL,
  course_name VARCHAR(100) NOT NULL,
  credit_hours DECIMAL(3,1) NOT NULL CHECK (credit_hours > 0),
  instructor_name VARCHAR(100),
  FOREIGN KEY (semester_id) REFERENCES Semesters(semester_id) ON DELETE CASCADE,
  UNIQUE (semester_id, course_code)
);

CREATE TABLE Grades (
  grade_id INT IDENTITY(1,1) PRIMARY KEY,
  course_id INT NOT NULL UNIQUE,
  letter_grade VARCHAR(2) NOT NULL,
  comments VARCHAR(500),
  FOREIGN KEY (course_id) REFERENCES Courses(course_id),
  FOREIGN KEY (letter_grade) REFERENCES GradePoints(letter_grade)
);

CREATE TABLE Deadlines (
  deadline_id INT IDENTITY(1,1) PRIMARY KEY,
  course_id INT NOT NULL,
  title VARCHAR(150) NOT NULL,
  description VARCHAR(500) NULL,
  due_date DATETIME NOT NULL,
  status VARCHAR(10) DEFAULT 'Pending' CHECK(status IN ('Pending', 'Completed')),
  priority VARCHAR(10) DEFAULT 'Medium' CHECK(priority IN ('High', 'Medium', 'Low')),
  allocated_study_hours DECIMAL(4,1) DEFAULT 0,
  FOREIGN KEY (course_id) REFERENCES Courses(course_id) ON DELETE CASCADE
);

CREATE TABLE GPAScenarios (
  scenario_id INT IDENTITY(1,1) PRIMARY KEY,
  student_id INT NOT NULL,
  scenario_name VARCHAR(100) NOT NULL,
  created_at DATETIME DEFAULT GETDATE(),
  FOREIGN KEY (student_id) REFERENCES Students(student_id) ON DELETE CASCADE
);

CREATE TABLE ScenarioCourses (
  scenario_id INT NOT NULL,
  course_id INT NOT NULL,
  expected_grade VARCHAR(2) NOT NULL,
  PRIMARY KEY (scenario_id, course_id),
  FOREIGN KEY (scenario_id) REFERENCES GPAScenarios(scenario_id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES Courses(course_id),
  FOREIGN KEY (expected_grade) REFERENCES GradePoints(letter_grade)
);

CREATE TABLE TaskProgress (
  progress_id INT IDENTITY(1,1) PRIMARY KEY,
  student_id INT NOT NULL UNIQUE,
  total_tasks INT DEFAULT 0,
  completed_tasks INT DEFAULT 0,
  percentage DECIMAL(5,2) DEFAULT 0,
  updated_at DATETIME DEFAULT GETDATE(),
  FOREIGN KEY (student_id) REFERENCES Students(student_id) ON DELETE CASCADE
);

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

CREATE TABLE BookMaterial (
  id INT IDENTITY(1,1) PRIMARY KEY,
  course_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(200) NOT NULL,
  description VARCHAR(600) NULL,
  pdf_link VARCHAR(500) NULL,
  FOREIGN KEY (course_id) REFERENCES Courses(course_id) ON DELETE CASCADE
);

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
