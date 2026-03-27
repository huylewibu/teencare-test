# TeenCare Mini LMS

A mini web application for managing Parents, Students, Classes, Class Registrations, and Subscriptions.


## Tech Stack

- Backend: Express.js + TypeScript + Prisma
- Frontend: Next.js + React + Tailwind CSS
- Database: PostgreSQL
- DevOps: Docker + Docker Compose


## Project Structure

test-teencare/
  backend/              # Express + TypeScript + Prisma API
  frontend/             # Next.js frontend
  docker-compose.yml    # Runs backend + frontend + PostgreSQL together
  README.md

## Features

- Create and view Parents
- Create and view Students with Parent relation
- Create and view Classes by weekday
- Register a student into a class
- Check class capacity before registration
- Check schedule conflicts before registration
- Check valid subscription before registration
- Cancel registration with session refund rule:
  - More than 24 hours before class: refund 1 session
  - Less than 24 hours before class: no refund

## Database Schema Overview

### Parent
- id
- name
- phone
- email

### Student
- id
- name
- dob
- gender
- current_grade
- parent_id

### Class
- id
- name
- subject
- day_of_week
- time_slot
- teacher_name
- max_students

### ClassRegistration
- id
- class_id
- student_id
- subscription_id
- created_at

### Subscription
- id
- student_id
- package_name
- start_date
- end_date
- total_sessions
- used_sessions

## Main API Endpoints

### Parents
- `POST /api/parents`
- `GET /api/parents/:id`

### Students
- `POST /api/students`
- `GET /api/students/:id`

### Classes
- `POST /api/classes`
- `GET /api/classes`
- `GET /api/classes?day=Mon`

### Class Registrations
- `POST /api/classes/:classId/register`
- `DELETE /api/registrations/:id`

### Subscriptions
- `POST /api/subscriptions`
- `GET /api/subscriptions/:id`
- `PATCH /api/subscriptions/:id/use`

## Example Request

### Create Parent

```bash
curl -X POST http://localhost:4000/api/parents \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "phone": "0123456789",
    "email": "john@example.com"
  }'