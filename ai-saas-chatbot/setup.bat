@echo off
REM AI SaaS ChatBot - Quick Start Script for Windows

echo.
echo 🚀 AI SaaS ChatBot - Quick Start Setup
echo ======================================
echo.

REM Check if node is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✅ Node.js found: %NODE_VERSION%
echo.

REM Create .env file if it doesn't exist
if not exist .env (
    echo 📝 Creating .env file from template...
    copy .env.example .env
    echo ⚠️  Please update .env with your credentials:
    echo    - MONGODB_URI
    echo    - OPENAI_API_KEY
    echo    - PINECONE_API_KEY
    echo    - JWT_SECRET
    echo.
)

REM Install backend dependencies
echo 📦 Installing backend dependencies...
cd backend
call npm install
if errorlevel 1 (
    echo ❌ Failed to install backend dependencies
    cd ..
    pause
    exit /b 1
)
echo ✅ Backend dependencies installed
cd ..

REM Install frontend dependencies
echo 📦 Installing frontend dependencies...
cd frontend
call npm install
if errorlevel 1 (
    echo ❌ Failed to install frontend dependencies
    cd ..
    pause
    exit /b 1
)
echo ✅ Frontend dependencies installed
cd ..

echo.
echo 🎉 Setup Complete!
echo.
echo Next steps:
echo 1. Update .env with your credentials
echo 2. Run backend: cd backend ^&^& npm run dev
echo 3. In another terminal, run frontend: cd frontend ^&^& npm start
echo 4. Open http://localhost:3000
echo.
echo For Docker setup, run: docker-compose up -d
echo.
pause
