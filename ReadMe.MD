# Sneaker Marketplace

## Project Structure

- `backend/` - Flask backend API
- `my-app/` - Next.js frontend

## Backend Setup

1. Go into the backend folder:

```bash
cd backend

Create a virtual environment:

python -m venv venv

Activate the virtual environment:

Windows
venv\Scripts\activate
Mac/Linux
source venv/bin/activate

Install backend dependencies:

pip install -r requirements.txt

Create a .env file inside backend/ with:

DATABASE_URL=your_database_url_here
SECRET_KEY=your_secret_key_here
JWT_SECRET_KEY=your_jwt_secret_here

Run database migrations:

flask db upgrade

Start the backend server:

python run.py

The backend should run on:

http://127.0.0.1:5000



##Frontend Setup

Go into the frontend folder:

cd my-app

Install frontend dependencies:

npm install

Start the frontend:

npm run dev

The frontend should run on:

http://localhost:3000
Requirements

Python installed

Node.js and npm installed

PostgreSQL installed and running

Project database created before running the backend




##Notes:
Make sure the backend is running before testing frontend API features

Make sure the .env file is set correctly in backend/

If the frontend does not load sneaker data, check that the database contains test rows

If login does not work, make sure the stored password is a real generated password hash
