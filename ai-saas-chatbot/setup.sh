#!/bin/bash

# AI SaaS ChatBot - Quick Start Script

echo "🚀 AI SaaS ChatBot - Quick Start Setup"
echo "======================================"
echo ""

# Check if node is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Node.js found: $(node --version)"

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please update .env with your credentials:"
    echo "   - MONGODB_URI"
    echo "   - OPENAI_API_KEY"
    echo "   - PINECONE_API_KEY"
    echo "   - JWT_SECRET"
    echo ""
fi

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install
if [ $? -eq 0 ]; then
    echo "✅ Backend dependencies installed"
else
    echo "❌ Failed to install backend dependencies"
    exit 1
fi
cd ..

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
if [ $? -eq 0 ]; then
    echo "✅ Frontend dependencies installed"
else
    echo "❌ Failed to install frontend dependencies"
    exit 1
fi
cd ..

echo ""
echo "🎉 Setup Complete!"
echo ""
echo "Next steps:"
echo "1. Update .env with your credentials"
echo "2. Run backend: cd backend && npm run dev"
echo "3. In another terminal, run frontend: cd frontend && npm start"
echo "4. Open http://localhost:3000"
echo ""
echo "For Docker setup, run: docker-compose up -d"
echo ""
