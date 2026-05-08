# Troubleshooting Guide

## Common Issues & Solutions

### 1. MongoDB Connection Error

**Error**: `MongoServerSelectionError: connect ECONNREFUSED`

**Solutions**:
```bash
# If using local MongoDB
# Make sure MongoDB is running
# Windows: Check Services, start MongoDB
# Mac: brew services start mongodb-community
# Linux: sudo service mongod start

# If using MongoDB Atlas
# Check connection string format
mongodb+srv://username:password@cluster.mongodb.net/database-name

# Common mistakes:
# - Username/password has special characters - URL encode them (@%40 <%3C etc)
# - IP not whitelisted - add IP in Atlas dashboard
# - Database name typo
# - Network timeout - check firewall
```

### 2. API Key Errors

**Error**: `Error: Incorrect API key provided`

**Solutions**:
```bash
# Check OpenAI API key
echo $OPENAI_API_KEY  # Should not be empty

# Verify Pinecone credentials
# - API key correct
# - Environment set correctly (us-east1-aws, etc)
# - Index name matches your Pinecone index

# Reload environment variables
# Mac/Linux: source .env
# Windows: Restart terminal or set manually
```

### 3. Port Already in Use

**Error**: `EADDRINUSE: address already in use :::5000`

**Solutions**:
```bash
# Find process using port 5000
# Windows: netstat -ano | findstr :5000
# Mac/Linux: lsof -i :5000

# Kill process
# Windows: taskkill /PID <PID> /F
# Mac/Linux: kill -9 <PID>

# Or use different port
PORT=5001 npm run dev
```

### 4. Frontend Can't Connect to Backend

**Error**: `Failed to fetch` or `Network Error`

**Solutions**:
```bash
# Check backend is running
# Terminal: curl http://localhost:5000/health

# Check REACT_APP_API_URL
# Should be: http://localhost:5000/api (development)

# Check CORS settings in backend
# frontend URL should be allowed in CORS config

# Browser console F12 -> Network tab
# Check failed requests and error messages
```

### 5. File Upload Issues

**Error**: `413 Payload Too Large` or `File upload failed`

**Solutions**:
```bash
# Check file size limit in .env
MAX_FILE_SIZE=10485760  # 10MB

# Increase if needed
MAX_FILE_SIZE=52428800  # 50MB

# For large files, implement chunked upload
# See DEVELOPMENT.md for example
```

### 6. Pinecone Index Issues

**Error**: `Index does not exist` or `Failed to connect`

**Solutions**:
```bash
# Verify index exists in Pinecone dashboard
# Create if missing: dimension=1536, metric=cosine

# Check environment spelling
# us-east1-aws not us-east-1
# Check Pinecone website for correct environment name

# Test connection
curl -X GET https://pinecone-api.io/...
```

### 7. Memory/Performance Issues

**Error**: `JavaScript heap out of memory` or `Slow response`

**Solutions**:
```bash
# Increase Node memory
NODE_OPTIONS=--max-old-space-size=4096 npm run dev

# Check chunk size in embeddings.ts
// Reduce from 1000 to 500 if OOM

// Reduce batch size in vectorDb.ts
// Chunk vectors into smaller batches

// Add pagination to API responses
// Limit results returned
```

### 8. Docker Issues

**Error**: `Cannot connect to Docker daemon` or `Image build failed`

**Solutions**:
```bash
# Make sure Docker is running
docker --version

# Clear Docker cache if build fails
docker-compose down -v
docker system prune
docker-compose up --build

# Check Docker logs
docker logs container_name

# Common Docker issues
# - Port already in use: change port in docker-compose.yml
# - Out of disk space: docker system prune -a
# - Volume permissions: sudo chown $USER:$USER /path
```

### 9. TypeScript Errors

**Error**: `Type 'X' is not assignable to type 'Y'`

**Solutions**:
```bash
# Run type check
npm run type-check

# Common issues:
# - Missing null check: if (user?.name) {}
# - Wrong type: string vs String
# - Missing import statement
# - Incorrect interface definition
```

### 10. Authentication Issues

**Error**: `401 Unauthorized` or `Invalid token`

**Solutions**:
```bash
# Token not stored
// Check localStorage in browser DevTools

// Token might be expired
// Regenerate by logging in again

// JWT_SECRET mismatch
// Same secret in backend .env used for encode/decode?

// Check token format
// Should be: Bearer <token> (with space)
```

## Debug Mode

### Enable Debug Logging

**Backend**:
```typescript
// Add to index.ts
import debug from 'debug';
const log = debug('app');

// Use it
log('Message:', variable);

// Run with debug
DEBUG=app npm run dev
```

**Frontend**:
```typescript
// In .env
REACT_APP_DEBUG=true

// In components
if (process.env.REACT_APP_DEBUG) {
  console.log('Debug:', data);
}
```

### Network Debugging

**Browser DevTools** (F12):
1. Network tab - see all API calls
2. Console tab - JavaScript errors
3. Storage tab - LocalStorage (tokens)
4. Application tab - Check cookies

**Backend**:
```bash
# Monitor all requests
npm install morgan
app.use(morgan('dev'));
```

## Performance Issues

### Backend Slow

```bash
# Check process metrics
node --inspect src/index.ts

# Use Chrome DevTools
# chrome://inspect

# Profile code execution
// Add timing
console.time('operation');
await operation();
console.timeEnd('operation');
```

### Frontend Slow

```bash
# Check bundle size
npm install -g webpack-bundle-analyzer

# React DevTools Profiler
# Identify slow components
```

## Getting Help

1. **Check logs**: Backend terminal & browser console
2. **Check network**: Browser DevTools network tab
3. **Check environment**: All .env variables set?
4. **Search error**: Copy exact error message to Google
5. **Check GitHub issues**: Project issues/discussions
6. **Ask for help**: Discord, Stack Overflow with minimal example

## Emergency Reset

If everything is broken:

```bash
# Backend reset
cd backend
rm -rf node_modules package-lock.json
npm install
npm run build

# Frontend reset
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run build

# Full reset (nuclear option)
docker-compose down -v
docker system prune -a
# Then start fresh
```

---

Still stuck? Check the detailed logs and describe:
1. What you were doing
2. Exact error message
3. What you've already tried
4. Your setup (local/Docker, OS, Node version)
