USE StudySync;
GO

/*
Run this before seed.sql if you only want schema updates
without inserting data.
*/

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
