# Development Guide

## Project Architecture

```
Request Flow:
Frontend (React) 
  ↓
API Client (axios)
  ↓
Express Backend
  ↓
Services (LLM, Embeddings, VectorDB)
  ↓
External APIs (OpenAI, Pinecone)
  ↓
MongoDB
```

## Development Workflow

### Backend Development

1. **Add New Feature**
   ```bash
   cd backend
   
   # Create new route in src/routes/
   # Create service in src/services/
   # Create model if needed
   # Add middleware if needed
   ```

2. **Testing**
   ```bash
   npm run type-check
   npm run build
   ```

3. **Hot Reload**
   - `npm run dev` enables nodemon
   - Changes auto-reload

### Frontend Development

1. **Add New Component**
   ```bash
   cd frontend/src/components
   # Create new .tsx file
   ```

2. **Add New Page**
   ```bash
   cd frontend/src/pages
   # Create new .tsx file
   # Add route in App.tsx
   ```

3. **Hot Reload**
   - `npm start` uses React Fast Refresh
   - Changes auto-reload

## File Naming Conventions

### Backend
- Files: `camelCase.ts`
- Exports: `camelCase` or `PascalCase` for classes
- Example: `embeddings.ts`, `Chat.ts`

### Frontend
- Components: `PascalCase.tsx`
- Utilities: `camelCase.ts`
- Hooks: `useHookName.ts`
- Types: `index.ts`
- Example: `ChatWindow.tsx`, `useChat.ts`

## Code Standards

### TypeScript Strict Mode
All files use `strict: true`
- No implicit any
- Null checks enforced
- Type safety

### Error Handling
```typescript
try {
  // Operation
} catch (error: any) {
  console.error('Error:', error);
  res.status(500).json({ message: 'Error message' });
}
```

### API Response Format
```typescript
// Success
{
  message: string,
  data: T,
  status: 200
}

// Error
{
  message: string,
  error: string,
  status: 400|500
}
```

## Testing Locally

### 1. Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'

# Copy the token from response
```

### 3. Upload Document
```bash
curl -X POST http://localhost:5000/api/documents/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@document.pdf"
```

### 4. Create Chat
```bash
curl -X POST http://localhost:5000/api/chat \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"documentIds": []}'
```

## Environment Variables Reference

### Backend (.env)
```
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname
JWT_SECRET=your-secret-key
OPENAI_API_KEY=sk-...
PINECONE_API_KEY=...
PINECONE_INDEX_NAME=ai-chatbot
PINECONE_ENVIRONMENT=us-east1-aws
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=pdf,txt,doc,docx
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5000/api
```

## Common Tasks

### Add New API Endpoint
```typescript
// 1. Create route in src/routes/
// 2. Add to index.ts: app.use('/api/feature', featureRoutes);
// 3. Add types to frontend/src/types/
// 4. Create API method in frontend/src/services/api.ts
// 5. Use in component via api.methodName()
```

### Add New Document Type Support
```typescript
// In routes/documents.ts
if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
  // Parse DOCX
}
```

### Add Caching
```typescript
// Use Redis or in-memory cache
const cache = new Map();

if (cache.has(key)) {
  return cache.get(key);
}

const result = await expensiveOperation();
cache.set(key, result);
return result;
```

## Performance Tips

1. **Batch API Calls**: Group Pinecone requests
2. **Chunk Optimization**: Adjust chunk size for better embeddings
3. **Database Indexes**: Ensure proper MongoDB indexes
4. **Frontend Optimization**: Lazy load components, code splitting
5. **Caching**: Cache frequently accessed data

## Debugging

### Backend
```typescript
// Add debugging
console.log('Variable:', variable);
console.error('Error:', error);

// Use debugger
debugger;
// Then: node --inspect src/index.ts
```

### Frontend
```typescript
// React DevTools
// Chrome DevTools Network tab
// Redux DevTools (if using Redux)
```

## Database Queries

### MongoDB
```javascript
// Get all documents for user
db.documents.find({ userId: ObjectId("...") })

// Get document with statistics
db.documents.aggregate([
  { $match: { userId: ObjectId("...") } },
  { $group: { _id: "$status", count: { $sum: 1 } } }
])
```

---

Happy coding! 🚀
