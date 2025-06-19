# Task Management System

A full-stack task management application built with Laravel and Vue.js that allows users to create, organize, and track tasks efficiently.

## Project Overview

This Task Management System provides a modern interface for task organization with backend API support for data persistence. The application follows a decoupled architecture with Laravel powering the backend API and Vue.js handling the frontend user interface.

Users can create tasks, assign them to categories, set due dates, track progress, and manage their workflow through an intuitive interface. The system supports user authentication to keep tasks private and secure.

## Features

- User registration and authentication
- Create, read, update, and delete tasks
- Categorize tasks with custom categories
- Set priority levels and due dates
- Mark tasks as complete or in-progress
- Filter and search functionality
- Responsive design for desktop and mobile use

## Technologies Used

### Backend
- Laravel 12.x
- PHP 8.2.12 (ZTS Visual C++ 2019 x64)
- Laravel Installer 4.5.1
- Laravel Sanctum for authentication
- MySQL database
- RESTful API architecture

### Frontend
- Vue 3
- Vite build tool
- Modern JavaScript (ES6+)
- Responsive design using CSS/SCSS
- Axios for API communication

## Setup Instructions

### Prerequisites
- PHP 8.2+ with required extensions
- Composer
- Node.js and npm
- MySQL server
- Git

### Backend Setup

1. Clone the repository:
2. Navigate to the backend directory:
3. Install PHP dependencies:
4. Create environment file:
5. Generate application key:
6. Configure MySQL database in the .env file:
7. Create the MySQL database:
8. Run database migrations:
9. Seed the database with sample data (optional):
10. Start the development server:
 ```
 php artisan serve
 ```
 The API will be available at http://localhost:8000

### Frontend Setup

1. Navigate to the frontend directory:
2. Install JavaScript dependencies:
3. Configure API base URL in the `.env` file:
4. Start the development server:
```
npm run dev
```
The frontend will be available at http://localhost:5173

5. For production build:


### Frontend Tests
## API Endpoints

The backend provides the following API endpoints:

### Authentication
- `POST /api/register` - Register a new user
- `POST /api/login` - Log in existing user
- `POST /api/logout` - Log out current user

### Tasks
- `GET /api/tasks` - Get all tasks for authenticated user
- `GET /api/tasks/{id}` - Get a specific task
- `POST /api/tasks` - Create a new task
- `PUT /api/tasks/{id}` - Update an existing task
- `DELETE /api/tasks/{id}` - Delete a task

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create a new category
- `PUT /api/categories/{id}` - Update a category
- `DELETE /api/categories/{id}` - Delete a category

## Development Decisions and Assumptions

1. **Architecture**: Adopted a decoupled architecture with separate backend and frontend codebases for better separation of concerns and scalability.

2. **Database**: Using MySQL for robust relational data storage and management.

3. **Authentication**: Implemented using Laravel Sanctum for secure API token authentication.

4. **Data Storage**: Used database for session and cache storage for improved performance and reliability.

5. **Frontend Framework**: Selected Vue.js for its simplicity and progressive integration capabilities.

6. **Environment**: Developed using PHP 8.2.12 with ZTS (Zend Thread Safety) and Laravel Installer 4.5.1.

7. **Task Status Tracking**: Tasks have status fields to track their progress (e.g., pending, in progress, completed).

8. **User Experience**: Prioritized intuitive UI design with drag-and-drop functionality for task management.

## Testing

### Backend Tests

## Deployment

### Backend Deployment
1. Set up a production server with PHP 8.2+ and MySQL
2. Configure environment variables for production
3. Run migrations: `php artisan migrate --force`
4. Configure web server (Nginx/Apache) to point to the public directory

### Frontend Deployment
1. Build the frontend: `npm run build`
2. Deploy the contents of the dist directory to a static file server or CDN

## Future Enhancements

- Team collaboration features
- Task comments and attachments
- Email notifications for due dates
- Calendar integration
- Mobile applications

## License

This project is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).

## Contact

For questions or support, please contact [your-email@example.com](mailto:your-email@example.com).