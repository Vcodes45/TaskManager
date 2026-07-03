# AI-Powered Task Manager

A full-stack task management application with Google Gemini AI integration for intelligent task analysis, categorization, and prioritization.

## Tech Stack

| Layer    | Technology                               |
| -------- | ---------------------------------------- |
| Frontend | React (Vite), Bootstrap 5, React Router |
| Backend  | FastAPI, SQLAlchemy, PostgreSQL           |
| AI       | Google Gemini API (modular/swappable)    |
| Auth     | JWT (python-jose + passlib/bcrypt)       |

## Features

- **Authentication** — Register/Login with JWT
- **Task Management** — Full CRUD (Create, Read, Update, Delete)
- **Dashboard** — Stats cards (Total, Pending, Completed, High Priority) + task grid
- **AI Analysis** — One-click Gemini-powered analysis per task:
  - Summary
  - Category (Work, Study, Personal, Shopping, Health, Finance, Other)
  - Priority (High/Medium/Low) with reasoning
  - Improved description
- **Responsive** — Works on desktop and mobile

---

## Setup

### Prerequisites

- Python 3.10+
- Node.js 18+
- PostgreSQL running locally
- Google Gemini API key ([Get one here](https://aistudio.google.com/app/apikey))

### 1. Database

Create a PostgreSQL database:

```sql
CREATE DATABASE taskmanager;
```

### 2. Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate   # macOS/Linux
# venv\Scripts\activate    # Windows

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your database URL, secret key, and Gemini API key

# Run the server
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`.
API docs at `http://localhost:8000/docs`.

### 3. Frontend

```bash
cd frontend

# Install dependencies
npm install

# Run dev server
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## Environment Variables

Create `backend/.env`:

```env
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/taskmanager
SECRET_KEY=your-super-secret-key-change-in-production
GEMINI_API_KEY=your-google-gemini-api-key
```

---

## API Endpoints

| Method | Endpoint              | Description              | Auth |
| ------ | --------------------- | ------------------------ | ---- |
| POST   | `/register`           | Register a new user      | No   |
| POST   | `/login`              | Login and get JWT token  | No   |
| GET    | `/tasks`              | Get all user tasks       | Yes  |
| POST   | `/tasks`              | Create a new task        | Yes  |
| PUT    | `/tasks/{id}`         | Update a task            | Yes  |
| DELETE | `/tasks/{id}`         | Delete a task            | Yes  |
| PATCH  | `/tasks/{id}/complete`| Toggle complete/pending  | Yes  |
| POST   | `/tasks/{id}/ai`      | Run AI analysis on task  | Yes  |

---

## Project Structure

```
TaskManger/
├── backend/
│   ├── ai/
│   │   ├── base.py           # Abstract AI service
│   │   └── gemini.py         # Gemini implementation
│   ├── database/
│   │   └── connection.py     # SQLAlchemy setup
│   ├── models/
│   │   ├── user.py           # User model
│   │   └── task.py           # Task model
│   ├── routes/
│   │   ├── auth.py           # Auth endpoints
│   │   ├── tasks.py          # Task CRUD endpoints
│   │   └── ai.py             # AI analysis endpoint
│   ├── schemas/
│   │   ├── user.py           # User Pydantic schemas
│   │   └── task.py           # Task Pydantic schemas
│   ├── services/
│   │   └── auth.py           # JWT + password hashing
│   ├── main.py               # FastAPI app
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── AIResultsPanel.jsx
│       │   ├── DashboardStats.jsx
│       │   ├── Navbar.jsx
│       │   ├── ProtectedRoute.jsx
│       │   ├── TaskCard.jsx
│       │   └── TaskForm.jsx
│       ├── context/
│       │   └── AuthContext.jsx
│       ├── pages/
│       │   ├── CreateTaskPage.jsx
│       │   ├── Dashboard.jsx
│       │   ├── EditTaskPage.jsx
│       │   ├── LoginPage.jsx
│       │   └── RegisterPage.jsx
│       ├── services/
│       │   ├── api.js
│       │   ├── authService.js
│       │   └── taskService.js
│       ├── App.jsx
│       ├── main.jsx
│       └── index.css
├── README.md
└── .gitignore
```

---

## Swapping the AI Provider

The AI layer is modular. To use a different LLM:

1. Create a new class inheriting from `ai/base.py` → `AIService`
2. Implement the `analyze_task(title, description)` method
3. Update `routes/ai.py` to use your new service

---

## License

MIT
# TaskManager
