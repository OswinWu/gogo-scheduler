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
