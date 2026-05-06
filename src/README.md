# TaskFlow - Team Task Manager

TaskFlow is a production-ready, full-stack collaborative task management application built with React, Node.js, and PostgreSQL. It allows teams to manage projects, track tasks, and monitor performance through a modern SaaS dashboard.

## Features

- **User Authentication**: Secure signup/signin using Anything's built-in auth system.
- **Role-Based Access**: Admins can manage projects and members; members focus on their assigned tasks.
- **Project Management**: Create, update, and delete projects with defined deadlines and team members.
- **Task Management**:
  - **Kanban Board**: Drag tasks through status columns (To Do, In Progress, Done).
  - **Task Lists**: Tabular view of tasks with sorting and filtering.
  - **Comments**: Collaborative threaded comments on every task.
- **Analytics Dashboard**: Visual overview of team performance using Recharts.
- **Activity Tracking**: Automated logs for every major action (project creation, task updates, etc.).
- **Responsive UI**: Fully mobile-responsive design built with Tailwind CSS.

## Tech Stack

- **Frontend**: React.js, Tailwind CSS, Lucide Icons, Framer Motion (motion/react).
- **Backend**: Node.js Serverless Functions.
- **Database**: Neon PostgreSQL (via `@neondatabase/serverless`).
- **Data Fetching**: TanStack React Query.
- **Notifications**: Sonner Toasts.
- **Charts**: Recharts.

## Database Models

### Users
- `id`: Serial Primary Key
- `name`: Text
- `email`: Text (Unique)
- `role`: Text (admin/member)

### Projects
- `id`: Serial Primary Key
- `name`: Text
- `description`: Text
- `deadline`: Timestamp
- `admin_id`: Integer (Reference to users)

### Tasks
- `id`: Serial Primary Key
- `title`: Text
- `priority`: Text (low/medium/high)
- `status`: Text (todo/in_progress/done)
- `project_id`: Integer (Reference to projects)
- `assigned_to`: Integer (Reference to users)

### Comments
- `id`: Serial Primary Key
- `task_id`: Integer (Reference to tasks)
- `user_id`: Integer (Reference to users)
- `content`: Text

## Local Setup

1. Enable **Authentication** in your project settings.
2. The platform automatically manages the PostgreSQL database via `process.env.DATABASE_URL`.
3. Start the dev server and visit `http://localhost:3000`.

## Demo Credentials

- **Email**: admin@test.com
- **Password**: Admin@123
- **Email**: member@test.com
- **Password**: Member@123

*(Note: Users must sign up first in this environment to populate the users table)*

## Deployment

