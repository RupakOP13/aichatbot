# Pre-Launch Checklist

Use this checklist before deploying to production or showing to interviews.

## 📋 Setup & Configuration

- [ ] `.env` file created with all variables filled
- [ ] MongoDB connection string tested
- [ ] OpenAI API key verified working
- [ ] Pinecone API key and index created
- [ ] JWT_SECRET changed from default
- [ ] Node modules installed in both backend & frontend
- [ ] No `node_modules` in git (check .gitignore)

## 🔧 Backend Setup

- [ ] Backend runs without errors: `npm run dev`
- [ ] Type checking passes: `npm run type-check`
- [ ] Build succeeds: `npm run build`
- [ ] No console errors in terminal
- [ ] API health endpoint works: `curl http://localhost:5000/health`
- [ ] MongoDB tables created
- [ ] All environment variables used correctly

## 🎨 Frontend Setup

- [ ] Frontend runs without errors: `npm start`
- [ ] No TypeScript compilation errors
- [ ] CSS loads correctly (TailwindCSS)
- [ ] Responsive on mobile (F12 -> toggle device)
- [ ] No console errors in browser (F12)
- [ ] All images/assets load properly

## 🔐 Authentication Testing

- [ ] Can register new user
- [ ] Can login with created user
- [ ] JWT token saved in localStorage
- [ ] Token sent in API requests
- [ ] Cannot access protected pages without token
- [ ] Logout clears token

## 📄 Document Upload Testing

- [ ] Upload PDF works
- [ ] Upload TXT works
- [ ] File size validation works
- [ ] Document appears in sidebar after upload
- [ ] Document status changes from processing → completed
- [ ] Deletion works

## 💬 Chat Testing

- [ ] Can create new chat
- [ ] Chat appears in sidebar
- [ ] Can send messages
- [ ] Responses appear in chat
- [ ] Messages are saved (refresh page, messages persist)
- [ ] Can rate messages (👍👎)
- [ ] Chat history preserved
- [ ] Can delete chats

## 🚀 Performance

- [ ] Backend response time < 2 seconds
- [ ] No memory leaks (check task manager)
- [ ] No unused console.logs
- [ ] No commented code
- [ ] Proper error handling (no crash on error)
- [ ] Database indexes on frequently queried fields

## 🐛 Bug Fixes

- [ ] No broken links
- [ ] No 404 errors for resources
- [ ] All buttons functional
- [ ] Forms validate input
- [ ] Error messages helpful
- [ ] Loading states show while waiting

## 📱 Responsiveness

- [ ] Mobile view looks good
- [ ] Tablet view works
- [ ] Desktop view optimal
- [ ] Touch interactions work
- [ ] No horizontal scrolling on mobile
- [ ] Text readable on all sizes

## 🔒 Security

- [ ] Passwords hashed (bcrypt)
- [ ] Sensitive data not in console logs
- [ ] CORS properly configured
- [ ] No API keys in frontend code
- [ ] No sensitive info in git history
- [ ] Input validation on all forms
- [ ] SQL injection prevention (using mongoose)
- [ ] XSS prevention (React escapes by default)

## 📚 Documentation

- [ ] README.md complete and accurate
- [ ] DEPLOYMENT.md has proper instructions
- [ ] DEVELOPMENT.md explains code structure
- [ ] TROUBLESHOOTING.md covers main issues
- [ ] Code comments where needed
- [ ] API endpoints documented
- [ ] Installation steps tested

## 🚢 Deployment Preparation

- [ ] .env.example has all required variables
- [ ] Docker builds successfully: `docker build .`
- [ ] docker-compose works: `docker-compose up -d`
- [ ] Environment variables documented
- [ ] Database backups configured
- [ ] Error tracking ready (Sentry, etc)
- [ ] Monitoring setup (optional)

## 📦 Code Quality

- [ ] No console.log() left in production code
- [ ] No TODO comments unresolved
- [ ] No debug breakpoints
- [ ] Consistent code formatting
- [ ] No unused imports
- [ ] Proper error handling everywhere
- [ ] Type safety enabled (strict mode)

## ✅ Final Testing

- [ ] Complete user flow works:
  1. Register
  2. Login
  3. Upload document
  4. Create chat
  5. Send message
  6. Receive response
  7. Logout
- [ ] No errors in console (F12)
- [ ] No network errors (F12 Network tab)
- [ ] Tested on different browsers
- [ ] Works offline gracefully
- [ ] All links point to correct pages

## 🎓 Interview Preparation

- [ ] Can explain full architecture
- [ ] Can walk through code confidently
- [ ] Can explain AI integration
- [ ] Know limitations and trade-offs
- [ ] Can discuss scaling options
- [ ] Know deployment process
- [ ] Ready to answer "how would you improve this?"

## 🚨 Last Minute Checks (Before Interview/Deployment)

- [ ] App doesn't crash on startup
- [ ] Can create account
- [ ] Can login
- [ ] Can upload document
- [ ] Can chat and get responses
- [ ] UI looks polished
- [ ] No obvious bugs visible
- [ ] Performance is acceptable

## 📊 Performance Benchmarks

Target metrics:
- [ ] Page load: < 3 seconds
- [ ] API response: < 1 second
- [ ] Chat response: < 5 seconds
- [ ] File upload: < 10 seconds
- [ ] Bundle size: < 200KB (gzipped)

## 🎉 Launch Ready!

When all checkboxes are ✅, your app is ready!

### Before Showing To:
- **Interviewer**: Complete security + documentation + performance sections
- **Friends**: Complete all sections for smooth demo
- **Production**: Ensure deployment + monitoring sections done

---

## Notes

Use this space to note any issues found:

```
Issue 1: 
Status:
Resolution:

Issue 2:
Status:
Resolution:
```

Good luck! 🚀
