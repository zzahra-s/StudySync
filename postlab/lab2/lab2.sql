

CREATE DATABASE lab2;
GO

USE lab2;
GO



CREATE TABLE salesman (
    salesman_id INT           PRIMARY KEY,
    name        NVARCHAR(50)  NOT NULL,
    city        NVARCHAR(50),
    commission  FLOAT
);
GO

CREATE TABLE customers (
    customer_id INT            PRIMARY KEY,
    cust_name   NVARCHAR(100)  NOT NULL,
    city        NVARCHAR(50),
    grade       INT,
    salesman_id INT,
    CONSTRAINT FK_CUSTOMERS_SALESMAN
        FOREIGN KEY (salesman_id) REFERENCES salesman(salesman_id)
        ON UPDATE CASCADE
        ON DELETE SET NULL
);
GO

CREATE TABLE orders (
    ord_no      INT    PRIMARY KEY,
    purch_amt   FLOAT  NOT NULL,
    ord_date    DATE   NOT NULL,
    customer_id INT,
    salesman_id INT,
  
    CONSTRAINT FK_ORDERS_CUSTOMER
        FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT FK_ORDERS_SALESMAN
        FOREIGN KEY (salesman_id) REFERENCES salesman(salesman_id)
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
);
GO


CREATE TABLE Tasks (
    id          INT IDENTITY(1,1) PRIMARY KEY,
    title       VARCHAR(255) NOT NULL,
    description TEXT         NOT NULL,
    created_at  DATETIME     DEFAULT GETDATE()
);
GO

CREATE PROCEDURE CreateTask
    @title       VARCHAR(255),
    @description TEXT
AS
BEGIN
    INSERT INTO Tasks (title, description)
    VALUES (@title, @description);
END;
GO

INSERT INTO Tasks (title, description) VALUES
('Fix Backend Bug',       'Resolve the API response issue for the task endpoint'),
('Design UI Mockups',     'Create wireframes for the dashboard and review with team'),
('Database Optimization', 'Improve query performance and add indexes where needed'),
('Write Documentation',   'Complete API documentation for all endpoints');
GO


INSERT INTO salesman (salesman_id, name, city, commission) VALUES
(5001, 'James Hoog', 'New York', 0.15),
(5002, 'Nail Knite', 'Paris',    0.13),
(5005, 'Pit Alex',   'London',   0.11),
(5006, 'Mc Lyon',    'Paris',    0.14),
(5007, 'Paul Adam',  'San Jose', 0.13),
(5003, 'Lauson Hen', 'San Jose', 0.12);
GO

INSERT INTO customers (customer_id, cust_name, city, grade, salesman_id) VALUES
(3002, 'Nick Rimando',    'New York',   100,  5001),
(3007, 'John Brad Davis', 'New York',   200,  5001),
(3005, 'Graham Zusi',     'California', 200,  5002),
(3008, 'Julian Green',    'London',     300,  5002),
(3004, 'Fabian Johnson',  'Paris',      300,  5006),
(3009, 'Geoff Cameron',   'Berlin',     100,  5003),
(3003, 'Jozy Altidor',    'Moscow',     200,  5007),
(3001, 'John Brad Guzan', 'London',     NULL, 5005);
GO

INSERT INTO orders (ord_no, purch_amt, ord_date, customer_id, salesman_id) VALUES
(70001, 150.5,   '2012-10-05', 3005, 5002),
(70009, 270.65,  '2011-09-10', 3001, 5005),
(70002, 65.26,   '2014-10-05', 3002, 5001),
(70004, 110.5,   '2011-08-17', 3009, 5003),
(70007, 948.5,   '2012-09-10', 3005, 5002),
(70005, 2400.6,  '2010-07-27', 3007, 5001),
(70008, 5760.0,  '2013-09-10', 3002, 5001),
(70010, 1983.43, '2010-10-10', 3004, 5006),
(70003, 2480.4,  '2013-10-10', 3009, 5003),
(70012, 250.45,  '2010-06-27', 3008, 5002),
(70011, 75.29,   '2014-08-17', 3003, 5007),
(70013, 3045.6,  '2010-04-25', 3002, 5001);
GO

INSERT INTO Tasks (title, description) VALUES
('Fix Backend Bug',       'Resolve the API response issue for the task endpoint'),
('Design UI Mockups',     'Create wireframes for the dashboard and review with team'),
('Database Optimization', 'Improve query performance and add indexes where needed'),
('Write Documentation',   'Complete API documentation for all endpoints');
GO

