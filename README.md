
# SIRRS — Smart Issue Reporting and Resolution System

A web-based system for reporting, tracking, and managing organizational issues.

## Features

- Dashboard for monitoring issues
- Report issues with category, location, description, and priority
- View issue details and status
- FastAPI REST API
- React and TypeScript frontend

## Technology Stack

**Frontend:** React, TypeScript, CSS  
**Backend:** Python, FastAPI  
**API Documentation:** Swagger UI

## Project Structure

- `frontend/` — React frontend
- `backend/` — FastAPI backend

## Run the Backend

Open a terminal in the `backend` folder:

```bash
py -m venv .venv
```

Activate the virtual environment on Windows:

```powershell
.\.venv\Scripts\Activate.ps1
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Start the server:

```bash
python -m uvicorn main:app --reload
```

API documentation: http://127.0.0.1:8000/docs

## Run the Frontend

Open a separate terminal:

```bash
cd frontend
npm install
npm run dev
```

## Current Development Status

- Dashboard UI implemented
- FastAPI API implemented
- Frontend-to-backend integration in progress
- Database persistence and authentication planned
