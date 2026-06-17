-- Add Target CGPA Planning Tables
-- This migration adds support for persisting Target CGPA Calculator plans

USE StudySync;
GO

-- Drop existing tables if they exist (for fresh migration)
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[TargetCGPASemesters]') AND type in (N'U'))
    DROP TABLE [dbo].[TargetCGPASemesters];
GO

IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[TargetCGPAPlan]') AND type in (N'U'))
    DROP TABLE [dbo].[TargetCGPAPlan];
GO

-- Main table to store Target CGPA calculations
CREATE TABLE TargetCGPAPlan (
    plan_id INT IDENTITY(1,1) PRIMARY KEY,
    student_id INT NOT NULL,
    current_cgpa DECIMAL(4,2) NOT NULL,
    target_cgpa DECIMAL(4,2) NOT NULL,
    remaining_credits INT NOT NULL,
    remaining_semesters INT NOT NULL,
    total_degree_credits INT NOT NULL DEFAULT 120,
    distribution_method VARCHAR(20) NOT NULL CHECK (distribution_method IN ('equal', 'custom')),
    is_achievable BIT NOT NULL DEFAULT 1,
    required_sgpa DECIMAL(4,2) NULL,
    max_possible_cgpa DECIMAL(4,2) NULL,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (student_id) REFERENCES Students(student_id) ON DELETE CASCADE
);
GO

-- Table to store semester-wise distribution for custom plans
CREATE TABLE TargetCGPASemesters (
    semester_plan_id INT IDENTITY(1,1) PRIMARY KEY,
    plan_id INT NOT NULL,
    semester_number INT NOT NULL,
    semester_name VARCHAR(100) NOT NULL,
    credits INT NOT NULL,
    required_sgpa DECIMAL(4,2) NOT NULL,
    is_achievable BIT NOT NULL DEFAULT 1,
    FOREIGN KEY (plan_id) REFERENCES TargetCGPAPlan(plan_id) ON DELETE CASCADE,
    UNIQUE (plan_id, semester_number)
);
GO

-- Create indexes for faster queries
CREATE INDEX idx_student_target_cgpa ON TargetCGPAPlan(student_id);
CREATE INDEX idx_plan_semesters ON TargetCGPASemesters(plan_id);
GO

-- Sample insert to verify structure
INSERT INTO TargetCGPAPlan (student_id, current_cgpa, target_cgpa, remaining_credits, remaining_semesters, distribution_method, is_achievable, required_sgpa)
VALUES (1, 3.2, 3.5, 100, 4, 'equal', 1, 3.65);

INSERT INTO TargetCGPASemesters (plan_id, semester_number, semester_name, credits, required_sgpa, is_achievable)
VALUES (1, 1, 'Semester 1', 25, 3.65, 1);

-- Verify data
SELECT * FROM TargetCGPAPlan;
SELECT * FROM TargetCGPASemesters;
GO
