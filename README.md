# StudySync

StudySync is a comprehensive academic planning platform designed to help university students track their academic progress, predict outcomes, and make informed decisions about their future semesters.

The project was created to solve a common student problem: understanding GPA requirements, navigating relative grading systems, and staying organized throughout the semester.

---

## Features

### 🎯 Target CGPA Planner

* Calculate the SGPA required to reach a target CGPA.
* Support for equal and custom semester credit distributions.
* Best-case and realistic academic projections.

### 📊 MCA Grade Calculator

* Predict grades for relative grading courses.
* View complete grade distributions based on MCA values.
* Instantly see expected outcomes for different score ranges.

### 📝 GPA Scenario Planner

* Create and save multiple "what-if" scenarios.
* Compare different grade combinations.
* Keep projections recorded for future reference.

### ⏰ Deadline Manager

* Track assignments, quizzes, projects, and exams.
* Priority-based organization.
* Filter by semester and course.

### ✅ Task Manager

* Create course-specific tasks.
* Move tasks between To-Do and Done lists.
* Stay organized with daily goals.

### 🌙 Theme Support

* Light Mode
* Dark Mode
* Theme preference persistence

### ☰ Quick Navigation

* Easy access to all major features through a streamlined navigation menu.

---

## Tech Stack

### Frontend

* React
* Create React App

### Backend

* Node.js
* Express.js

### Database

* Supabase
* PostgreSQL

### Authentication

* Supabase Auth

### Version Control

* GitHub

---

## Installation

### Clone Repository

```bash
git clone <repository-url>
cd StudySync
```

### Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file and add:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_key
PORT=5000
```

Start backend:

```bash
node server.js
```

or

```bash
npm start
```

---

### Frontend Setup

Open a new terminal:

```bash
cd frontend
npm install
npm start
```

Application will run on:

```text
Frontend: http://localhost:3000
Backend: http://localhost:5000
```

---

## Screenshots


### Dashboard
<img width="1357" height="586" alt="Screenshot 2026-06-17 231436" src="https://github.com/user-attachments/assets/68511518-34d3-4464-8c64-4c8987ec7c80" />


### MCA Calculator
<img width="1355" height="587" alt="Screenshot 2026-06-17 235332" src="https://github.com/user-attachments/assets/7dbf563d-c6e4-4623-ac19-75079b7a32e8" />
<img width="1359" height="582" alt="Screenshot 2026-06-17 235315" src="https://github.com/user-attachments/assets/35930a94-58ae-4214-a51d-c347ce6d8cda" />



### GPA Planner
<img width="1361" height="583" alt="Screenshot 2026-06-17 235348" src="https://github.com/user-attachments/assets/f1560b2f-8b62-4548-9bb4-ed2a3efd810f" />
<img width="1360" height="585" alt="Screenshot 2026-06-17 235402" src="https://github.com/user-attachments/assets/c61d1bab-c48b-4618-ba90-da801b4b9aca" />






## Team

* Kashish Fatima
* Zahra Saeed
* Aliyah Rasheed


## Future Improvements

* Production deployment
* Notifications and reminders
* Mobile responsiveness enhancements
* Advanced academic analytics



## Demo

https://youtu.be/TANMKzMgPnQ 
https://youtu.be/MaikEdhoBAo 


Built as a semester project to help students make academic planning more predictable, data-driven, and organized.
