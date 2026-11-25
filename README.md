# Jira Issue Tracker

A full-stack task and issue tracking Kanban application built with **Django REST Framework** and **React**. Designed with a clean, responsive 3-column board (`To Do`, `In Progress`, `Done`) and secured with JSON Web Token (JWT) authentication.

## Features

- **JWT Authentication:** User registration, login, and protected API routes using `djangorestframework-simplejwt`.
- **Interactive Kanban Board:** Create, view, update, and delete issues across **To Do**, **In Progress**, and **Done** columns.
- **Click-to-Edit Modal:** Click any issue card to update its title, description, priority level, or workflow status.
- **Live Search & Priority Filtering:** Filter tickets in real time by keyword or priority badge (`Low`, `Medium`, `High`).
- **RESTful API:** Full CRUD endpoints powered by Django REST Framework's `ModelViewSet` and `DefaultRouter`.

## Tech Stack

### Backend
- **Python 3 & Django**
- **Django REST Framework (DRF)**
- **SimpleJWT** (`djangorestframework-simplejwt`)
- **django-cors-headers**
- **SQLite** (default development database)

### Frontend
- **React (Vite)**
- **Axios** (with request interceptors for Bearer token injection)
- **Custom CSS** (clean, responsive Kanban grid and modal UI)

## Project Structure

```text
Jira/
├── backend/
│   ├── config/          # Main Django project settings and root URLs
│   ├── issues/          # Issues app (models, serializers, views, JWT routes)
│   ├── manage.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── api.js       # Axios instance with JWT interceptor
│   │   ├── App.jsx      # Main Kanban board, filters, and edit modal
│   │   ├── Auth.jsx     # Login and registration view
│   │   └── App.css      # Application styling
│   └── package.json
├── .gitignore
└── README.md
```

## Local Setup & Installation

### 1. Clone the Repository
```bash
git clone https://github.com
cd Jira
```

### 2. Backend Setup (Django)
```bash
cd backend
python -m venv venv

# Activate virtual environment (Windows)
venv\Scripts\activate
# Activate virtual environment (Mac/Linux)
# source venv/bin/activate

pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```
The Django API will run at `http://localhost:8000/api/`.

### 3. Frontend Setup (React)
Open a second terminal window in the root `Jira` folder:
```bash
cd frontend
npm install
npm run dev
```
The React app will run at `http://localhost:5173`.

## API Endpoints

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/register/` | Register a new user account | No |
| `POST` | `/api/token/` | Obtain JWT access & refresh tokens | No |
| `POST` | `/api/token/refresh/` | Refresh an expired access token | No |
| `GET` | `/api/issues/` | List all issues | Yes |
| `POST` | `/api/issues/` | Create a new issue | Yes |
| `PATCH` | `/api/issues/<id>/` | Update issue status, priority, or details | Yes |
| `DELETE` | `/api/issues/<id>/` | Delete an issue | Yes |
