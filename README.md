# Gogo-Scheduler

A lightweight Go service for managing and executing Python and Shell scripts with execution history tracking.

## Features

- RESTful API using Gin framework
- SQLite database with GORM
- Support for Python and Shell script execution
- Task history tracking
- Clean architecture pattern

## API Endpoints

### Scripts

- `POST /scripts` - Create a new script
  ```json
  {
    "name": "Hello World",
    "type": "python",
    "content": "print('Hello, World!')"
  }
  ```

- `GET /scripts` - List all scripts
- `GET /scripts/:id` - Get script details
- `POST /scripts/:id/run` - Execute a script
- `DELETE /scripts/:id` - Delete a script

### Tasks

- `GET /tasks` - List all tasks
  - Query params: `script_id` (optional) - Filter tasks by script
- `GET /tasks/:id` - Get task execution details

## Setup

### Backend
1. Install dependencies:
```bash
go mod tidy
```

2. Run the service:
```bash
go run cmd/main.go
```

### Frontend
1. Navigate to web directory:
```bash
cd web
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

The service will start on `http://localhost:8080`
The UI will be available at `http://localhost:5173`

## Example Usage

### Create a Python Script
```