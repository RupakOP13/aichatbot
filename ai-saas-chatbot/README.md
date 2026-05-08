# AI SaaS ChatBot - Production-Ready MERN + AI Project

A full-stack AI-powered chatbot application that combines document management with intelligent Q&A capabilities powered by LLMs.

## 🚀 Features

### Core Features
- **User Authentication**: Secure JWT-based authentication
- **Document Management**: Upload and process PDFs, TXT files
- **AI Chat Interface**: Real-time chat with context-aware responses
- **Vector Embeddings**: Semantic search using Pinecone
- **LLM Integration**: GPT-3.5/GPT-4 powered responses
- **Response Ratings**: Users can rate AI responses

### Tech Stack
- **Frontend**: React 18, TypeScript, TailwindCSS
- **Backend**: Node.js, Express, TypeScript
- **Database**: MongoDB (chat history, documents)
- **Vector DB**: Pinecone (semantic search)
- **LLM**: OpenAI GPT models
- **Embeddings**: OpenAI Embeddings API
- **ORM**: Mongoose

## 📋 Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- OpenAI API key
- Pinecone API key
- Docker (optional)

## 🔧 Setup Instructions

### Backend Setup

```bash
cd backend
npm install

# Create .env file in root directory
cp ../.env.example .env

# Fill in your credentials
# - MONGODB_URI
# - OPENAI_API_KEY
# - PINECONE_API_KEY
# - JWT_SECRET

npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install

npm start
```

The frontend will run on `http://localhost:3000`
The backend will run on `http://localhost:5000`

## 🐳 Docker Setup

```bash
docker-compose up -d
```

All services will start:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- MongoDB: localhost:27017

## 📚 Project Structure

```
ai-saas-chatbot/
├── backend/
│   ├── src/
│   │   ├── routes/          # API endpoints
│   │   ├── services/        # Business logic (LLM, embeddings, vector DB)
│   │   ├── models/          # MongoDB schemas
│   │   ├── middleware/      # Auth, error handling
│   │   ├── utils/           # Utilities (JWT, text processing)
│   │   └── index.ts         # Express server
│   ├── package.json
│   ├── tsconfig.json
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API client
│   │   ├── hooks/           # Custom React hooks
│   │   ├── types/           # TypeScript types
│   │   ├── App.tsx
│   │   └── index.tsx
│   ├── public/
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   └── Dockerfile
├── docker-compose.yml
└── .env.example
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Documents
- `POST /api/documents/upload` - Upload document
- `GET /api/documents` - Get user's documents
- `DELETE /api/documents/:id` - Delete document

### Chat
- `POST /api/chat` - Create new chat
- `GET /api/chat` - Get all chats
- `GET /api/chat/:id` - Get specific chat
- `POST /api/chat/:id/message` - Send message
- `POST /api/chat/:id/rate` - Rate message
- `DELETE /api/chat/:id` - Delete chat

## 🤖 How It Works

1. **Document Upload**: User uploads a PDF or text file
2. **Text Processing**: Backend extracts and chunks the text
3. **Embeddings**: Text chunks are converted to embeddings using OpenAI
4. **Vector Storage**: Embeddings stored in Pinecone for semantic search
5. **Query Processing**: User question converted to embedding
6. **Semantic Search**: Similar chunks retrieved from Pinecone
7. **LLM Response**: Retrieved context + question sent to GPT-3.5/4
8. **Response Display**: Answer shown with source citations

## 📊 Database Schema

### User
```typescript
{
  username: string (unique)
  email: string (unique)
  password: string (hashed)
  role: 'user' | 'admin'
  createdAt: Date
  updatedAt: Date
}
```

### Document
```typescript
{
  userId: ObjectId
  title: string
  filename: string
  fileSize: number
  content: string
  chunksCount: number
  vectorsCount: number
  status: 'processing' | 'completed' | 'failed'
  uploadedAt: Date
}
```

### Chat
```typescript
{
  userId: ObjectId
  title: string
  messages: Message[]
  documentIds: ObjectId[]
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}
```

## 🚀 Deployment

### Vercel (Frontend)
```bash
npm run build
vercel deploy
```

### Railway/Render (Backend)
1. Connect GitHub repo
2. Set environment variables
3. Deploy automatically

### MongoDB Atlas
- Create free tier cluster
- Use connection string in MONGODB_URI

### Pinecone
- Create free tier index
- Use API key and environment

## 🔐 Security Features

- JWT authentication
- Password hashing with bcrypt
- CORS enabled
- Input validation
- Authorization checks
- Rate limiting ready

## 📈 Performance Optimizations

- Vector caching
- Document chunking with overlap
- Batch API requests
- Connection pooling
- Index optimization

## 🎯 Internship Interview Talking Points

1. **Full-Stack Development**: React, Node.js, MongoDB, TypeScript
2. **AI/ML Integration**: Vector embeddings, semantic search, LLM chains
3. **Scalability**: Batch processing, indexing, caching strategies
4. **Database Design**: Schema normalization, indexing
5. **API Design**: RESTful architecture, error handling
6. **Authentication**: JWT implementation, password hashing
7. **DevOps**: Docker, docker-compose, deployment strategies
8. **Best Practices**: Code organization, error handling, logging

## 🤝 Contributing

1. Create feature branch
2. Commit changes
3. Push to branch
4. Open pull request

## 📝 License

MIT

## 🙋 Support

For issues and questions, check the GitHub issues or contact the maintainer.

---

**Built for internship success!** 🎓
