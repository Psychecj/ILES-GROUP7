# ILES - Internship Logging and Evaluation System

## Overview

ILES (Internship Logging and Evaluation System) is a web-based platform designed to manage and monitor student internships. The system provides a centralized environment where students, workplace supervisors, academic supervisors, and administrators can collaborate throughout the internship period.

The platform supports internship placement management, weekly activity logging, performance evaluation, supervisor reviews, grading, and communication among stakeholders.

---

## FEATURES

### Student

* Register and authenticate securely
* Submit weekly internship logs
* Upload supporting attachments
* Track log approval status
* View supervisor feedback
* Monitor internship progress

### Workplace Supervisor

* Review submitted weekly logs
* Provide comments and feedback
* Evaluate student performance
* Monitor assigned students

### Academic Supervisor

* Review internship progress
* Assess student submissions
* Submit evaluations
* Monitor workplace supervisor feedback

### Administrator

* Manage users and roles
* Manage internship placements
* Monitor system activities
* Oversee internship workflows

---

## TECHNOLOGY STACK

### Frontend

* React
* Vite
* React Router

### Backend

* Django
* Django REST Framework
* JWT Authentication

### Database

* PostgreSQL

### Deployment

* Render
* Vercel

---

## System Architecture

Frontend (React)
↓
REST API (Django REST Framework)
↓
PostgreSQL Database

Authentication is handled using JSON Web Tokens (JWT).

---

## MAIN MODULES

### User Management

Custom user model supporting role-based access control.

### Internship Placement Management

Tracks internship placements and assigned supervisors.

### Weekly Log Management

Allows students to submit weekly internship reports and attachments.

### Evaluation Management

Supports academic and workplace supervisor assessments.

### Grading Module

Calculates and stores final internship grades.

### Notification Module

Delivers system notifications to users.

---

## PROJECT STRUCTURE

backend/

* config/
* internship/
* media/

Front/my-react-app/

* src/
* components/
* pages/
* services/

---

## RUNNING THE PROJECT

### Backend

```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend

```bash
cd Front/my-react-app
npm install
npm run dev
```

---

## Authors
* Faisal Ali
* Kizito Fahad
* Ssemuwemba Joseph C
* Nalule Mable Muwanguzi
* Nalubega Melissa V

Group 7

Internship Logging and Evaluation System (ILES)
