<div align="center">

[![Open in Visual Studio Code](https://classroom.github.com/assets/open-in-vscode-2e0aaae1b6195c2367325f4f02e2d04e9abb55f0b24a779b69b11b9e10269abc.svg)](https://classroom.github.com/online_ide?assignment_repo_id=23205690&assignment_repo_type=AssignmentRepo)

# 👟 Sneaker Marketplace
</div>

---
## Here is the link for the application: https://project-1-btp405naa-group8-g5bq.vercel.app/
## Login email is: sam@example.com
## Login password is: password123

## 📂 Project Structure
* **backend/** - Flask backend API
* **my-app/** - Next.js frontend

---

## ⚙️ Project Setup

**Go into the backend folder:**
```bash
cd backend
1. Create a virtual environment:
- Run: python -m venv venv

2. Activate the virtual environment:
- for Windows: venv\Scripts\activate
- for Mac/Linux: source venv/bin/activate

3. Install backend dependencies:
- pip install -r requirements.txt

4. Create a .env file inside backend/ with:

        DATABASE_URL=your_database_url_here
        SECRET_KEY=your_secret_key_here
        JWT_SECRET_KEY=your_jwt_secret_here

5. Run database migrations:
- flask db upgrade

6. Start the backend server:
- python run.py or py run.py

The backend should run on: http://127.0.0.1:5000

--------------------------------------------------

Frontend Setup
1. Go into the frontend folder: /my-app
- cd my-app

2. Install frontend dependencies:
- npm install

3. Start the frontend:
- npm run dev

The frontend should run on:
http://localhost:3000

Requirements:
Python installed

Node.js and npm installed

PostgreSQL installed and running

Project database created before running the backend

Notes:

Make sure the backend is running before testing frontend API features


Make sure the .env file is set correctly in backend/


If the frontend does not load sneaker data, check that the database contains test rows



If login does not work, make sure the stored password is a real generated password hash

