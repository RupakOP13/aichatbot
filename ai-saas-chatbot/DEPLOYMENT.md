# Deployment Guide

## Local Development

### Prerequisites
- Node.js 18+
- MongoDB
- OpenAI API key
- Pinecone API key

### Quick Start

```bash
# Clone repository
git clone <repo-url>
cd ai-saas-chatbot

# Copy environment file
cp .env.example .env

# Fill in your credentials in .env

# Option 1: Local development
cd backend && npm install && npm run dev &
cd frontend && npm install && npm start

# Option 2: Docker
docker-compose up -d
```

## Production Deployment

### 1. Backend Deployment (Railway/Render)

#### Option A: Railway
```bash
npm install -g @railway/cli
railway login
railway link
railway up
```

#### Option B: Render
1. Push code to GitHub
2. Connect repository on render.com
3. Create Web Service
4. Set environment variables
5. Deploy automatically on push

**Environment Variables:**
```
MONGODB_URI=mongodb+srv://...
OPENAI_API_KEY=sk-...
PINECONE_API_KEY=...
PINECONE_INDEX_NAME=ai-chatbot
JWT_SECRET=your-secret-key
NODE_ENV=production
```

### 2. Frontend Deployment (Vercel)

#### Method 1: Vercel CLI
```bash
npm i -g vercel
cd frontend
vercel
```

#### Method 2: GitHub Integration
1. Connect repository on vercel.com
2. Select frontend folder
3. Set build command: `npm run build`
4. Set start command: `npm start`

**Environment Variables:**
```
REACT_APP_API_URL=https://your-backend-domain.com/api
```

### 3. Database Setup

#### MongoDB Atlas
1. Create account on mongodb.com
2. Create cluster (free tier available)
3. Get connection string
4. Update MONGODB_URI in backend

#### Pinecone
1. Create account on pinecone.io
2. Create index with dimension 1536 (OpenAI embeddings)
3. Get API key
4. Update credentials

## Monitoring & Maintenance

### Logs
```bash
# Railway
railway logs -f

# Render
render logs

# Local Docker
docker logs ai-chatbot-backend
```

### Database Backup
```bash
# MongoDB Atlas - automatic backups enabled

# Manual backup
mongodump --uri "mongodb+srv://..." --out ./backup
```

### Performance Monitoring
- Monitor API response times
- Track Pinecone query latency
- Monitor MongoDB indexes

## Scaling Considerations

1. **Vector Database**: Pinecone handles scaling automatically
2. **Database**: Upgrade MongoDB tier as needed
3. **Backend**: Use load balancer with Railway/Render
4. **Frontend**: CDN available through Vercel

## Cost Estimation (Monthly)

- **MongoDB Atlas**: $0-100 (free tier to paid)
- **Pinecone**: $0-50 (free tier included)
- **OpenAI API**: $0-100+ (pay-as-you-go)
- **Backend (Railway)**: $5-50
- **Frontend (Vercel)**: Free-$20

**Total MVP Cost**: $0-30/month (free tiers)

## Security Checklist

- [ ] Change JWT_SECRET in production
- [ ] Enable CORS properly
- [ ] Use HTTPS only
- [ ] Set up API rate limiting
- [ ] Enable MongoDB authentication
- [ ] Rotate API keys regularly
- [ ] Monitor access logs
- [ ] Set up error tracking (Sentry)

## Troubleshooting

### MongoDB Connection Error
```bash
# Check connection string
mongodb+srv://user:password@cluster.mongodb.net/database-name

# Common issues:
# - IP whitelist not configured
# - Wrong password
# - Database name incorrect
```

### Pinecone Not Working
```bash
# Check API key
# Check index exists
# Check dimension matches (1536 for OpenAI)
```

### API Not Responding
```bash
# Check backend logs
# Verify environment variables
# Check CORS settings
# Verify MongoDB connection
```

## Updates & Maintenance

```bash
# Update dependencies
npm update

# Security audit
npm audit fix

# Type checking
npm run type-check

# Build production
npm run build
```

---

**Need help?** Check README.md or create an issue on GitHub.
