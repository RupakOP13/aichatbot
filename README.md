# NexusAI: Advanced Business Data Intelligence Platform 🚀

NexusAI is a premium, full-stack AI-powered platform designed to transform raw business data into actionable strategic insights. By combining **Retrieval-Augmented Generation (RAG)** with sophisticated data profiling and dynamic visualizations, NexusAI allows users to "talk" to their spreadsheets and instantly generate executive-grade reports.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/Frontend-React.js-61DAFB?logo=react)
![Node](https://img.shields.io/badge/Backend-Node.js-339933?logo=node.js)
![AI](https://img.shields.io/badge/AI-Llama%203%20(Groq)-orange?logo=meta)
![Database](https://img.shields.io/badge/Database-MongoDB-47A248?logo=mongodb)

---

## ✨ Key Features

### 🧠 Intelligent AI Chat (RAG)
*   **Context-Aware Analysis**: Chat with your PDFs, CSVs, and XLSX files using Llama 3.1 via Groq for ultra-fast processing.
*   **Hybrid RAG System**: Uses vector embeddings for text documents and statistical injection for structured datasets.
*   **Dynamic Charting**: Ask the AI to "visualize sales by region," and it will render a live chart directly in the chat bubble.

### 📊 Automated Data Profiling
*   **Instant Stats**: Automatic calculation of Median, Standard Deviation, Null Counts, and Unique Values upon upload.
*   **Type Sniffing**: Automatically detects Dates, Categories, and Numeric fields to ensure accurate visualization.
*   **Executive Summaries**: AI-generated Key Insights, Trends, Strategic Recommendations, and Risk Anomalies.

### 🎨 Premium Dashboard Experience
*   **Rich Aesthetics**: Modern dark-mode interface with Glassmorphism, smooth animations, and responsive design.
*   **Interactive Data Explorer**: Search, filter, and paginate through your raw data with a high-performance table view.
*   **Visual Intelligence Tab**: A dedicated suite of Bar, Line, and Doughnut charts that auto-adjust based on your dataset.

### 🛠️ Professional Tooling
*   **PDF Export**: Download your AI-generated insights and charts as a professionally formatted PDF report.
*   **Voice Integration**: Use speech-to-text to ask questions and hear the AI read its findings aloud.
*   **Secure Auth**: Full authentication system with JWT and Google OAuth integration.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React.js 18 (TypeScript)
- **Styling**: Tailwind CSS + Custom CSS Variables (Glassmorphism)
- **Charts**: Chart.js + React-Chartjs-2
- **Icons**: React Icons (Lucide/Material)
- **PDF Generation**: jsPDF

### Backend
- **Runtime**: Node.js + Express (TypeScript)
- **Database**: MongoDB (Mongoose)
- **AI/LLM**: Groq (Llama 3.1 8B/70B)
- **Embeddings**: LangChain + VectorDB logic
- **File Parsing**: SheetJS (XLSX) & PapaParse (CSV)
- **Storage**: Cloudinary (for report file persistence)

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas)
- Groq API Key
- Cloudinary Credentials (Optional for local testing)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/nexus-ai.git
   cd nexus-ai
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   # Create .env file and add your keys (GROQ_API_KEY, MONGO_URI, JWT_SECRET)
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   # Create .env file and add REACT_APP_API_URL
   npm start
   ```

---

## 📂 Project Structure

```text
├── backend/
│   ├── src/
│   │   ├── models/        # Mongoose Schemas (User, Report, Chat)
│   │   ├── routes/        # API Endpoints (Auth, Reports, Chat)
│   │   ├── services/      # AI, Embeddings, VectorDB Logic
│   │   └── utils/         # Data Parsers & Statistical Engine
├── frontend/
│   ├── src/
│   │   ├── components/    # Reusable UI (Charts, ChatWindow, etc.)
│   │   ├── pages/         # Dashboard, Login, Register
│   │   ├── services/      # Axios API Client
│   │   └── utils/         # Chart Helpers & Formatting
```

---

## 📝 License
Distributed under the MIT License. See `LICENSE` for more information.

---

**Built with ❤️ by [Your Name]**
