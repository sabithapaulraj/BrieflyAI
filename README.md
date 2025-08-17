
# 🍋 MangoDesk Meeting Summarizer

AI-powered meeting notes summarizer and sharer built with Node.js, Express, React, TypeScript, and Google Gemini AI.

## 🚀 Features

- Upload or paste meeting transcripts (`.txt` files supported)
- Custom instructions for summary formatting
- Gemini AI-powered summaries (editable before sharing)
- Email summaries to multiple recipients
- Responsive UI (desktop & mobile)
- Full test coverage (Jest, React Testing Library, Supertest)

## 🛠 Tech Stack

- **Backend:** Node.js, Express
- **Frontend:** React, TypeScript
- **AI:** Google Gemini (`@google/generative-ai`)
- **Email:** Nodemailer
- **File Uploads:** Multer
- **Testing:** Jest, React Testing Library, Supertest
- **Deployment:** Vercel (frontend), Render (backend)

## 🏁 Quick Start

### Prerequisites

- Node.js v14+
- npm or yarn
- Google Gemini API key
- Gmail App Password

### Installation

1. **Clone the repo**
    ```bash
    git clone <repo-url>
    cd MangoDesk
    ```
2. **Install dependencies**
    ```bash
    npm install
    cd frontend && npm install && cd ..
    ```
3. **Configure environment**
    - Copy `.env.example` to `.env` and fill in:
       ```env
       GEMINI_API_KEY=your_gemini_api_key
       EMAIL_USER=your_email@gmail.com
       EMAIL_PASS=your_app_password
       PORT=3001
       NODE_ENV=development
       ```

### Getting API Keys

- [Google Gemini API Key](https://makersuite.google.com/app/apikey)
- [Gmail App Password](https://myaccount.google.com/security)

### Running Locally

1. **Start backend**
    ```bash
    npm run dev
    ```
2. **Start frontend**
    ```bash
    cd frontend
    npm start
    ```
3. **Open** [http://localhost:3000](http://localhost:3000)

## 🧪 Testing

Run all tests (backend & frontend):
```bash
npm test
cd frontend && npm test
```

## 📖 Usage

1. Upload or paste transcript
2. Add custom instructions
3. Click "Generate Summary"
4. Edit summary (optional)
5. Add recipient emails
6. Click "Send Email"

## � API Endpoints

### `POST /api/generate-summary`
Generate summary from transcript and instructions.
**Body:**
```json
{
   "transcript": "...",
   "instruction": "..."
}
```
**Response:**
```json
{
   "summary": "..."
}
```

### `POST /api/send-email`
Send summary to recipients.
**Body:**
```json
{
   "summary": "...",
   "recipients": ["a@example.com", "b@example.com"]
}
```
**Response:**
```json
{
   "success": true,
   "message": "Email sent successfully"
}
```

### `POST /api/upload-transcript`
Upload transcript file (multipart form-data, field: `transcript`).
**Response:**
```json
{
   "transcript": "..."
}
```

## 🛡 Security

- Store secrets in `.env`
- Use Gmail App Passwords
- Validate/sanitize all inputs
- Use HTTPS in production

## 🚀 Deployment

### Frontend (Vercel)
1. Push to GitHub
2. Import repo in Vercel
3. Set root to `frontend`, build command `npm run build`, output `build`
4. Set `REACT_APP_API_URL` to backend URL

### Backend (Render)
1. Push to GitHub
2. Create Web Service in Render
3. Build: `npm install`, Start: `npm start`
4. Set env vars: `GEMINI_API_KEY`, `EMAIL_USER`, `EMAIL_PASS`, `NODE_ENV=production`

## 🤝 Contributing

1. Fork & clone
2. Create feature branch
3. Commit & push
4. Open PR

## 📄 License

MIT License. See [LICENSE](LICENSE).

## 🆘 Support

- Check console for errors
- Verify API keys and Gmail App Password
- Ensure dependencies are installed

## 🔮 Roadmap

- [ ] Support PDF/DOCX uploads
- [ ] Real-time collaboration
- [ ] Summary templates
- [ ] Calendar integration
- [ ] Advanced email templates
- [ ] User authentication/history
- [ ] Export to PDF/Word
