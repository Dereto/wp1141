# HW6: Line AI Chatbot - The Cursed Genie

A Next.js application integrating Line Messaging API and Google Gemini LLM to create a "Cursed Genie" chatbot. The system includes a webhook for the Line Bot and an Admin Dashboard for monitoring conversations.

## 🚀 Deployment

- **Line Bot ID**: `@your_bot_id` (or QR Code link)
- **Admin Dashboard**: [https://your-vercel-project.vercel.app](https://your-vercel-project.vercel.app)

> **Note**: The Admin Dashboard allows you to view all user conversations and history in real-time.

## ✨ Features

- **Persona**: "The Cursed Genie" - Grants wishes with a cruel twist (Monkey's Paw style).
- **LLM Integration**: Uses Google Gemini 2.0 Flash for intelligent, context-aware responses.
- **Persistence**: MongoDB stores all Users and Messages.
- **Context Awareness**: Maintains a history of the last 10 messages.
- **Robustness**:
  - Handles API failures gracefully.
  - Sanitizes chat history for Gemini API compliance.
  - Lazy database connection for faster webhook response.

## 🛠️ Environment Setup

### Prerequisites
- Node.js 18+
- MongoDB Atlas (Free Tier)
- Line Developers Account (Messaging API)
- Google AI Studio Account (Gemini API)

### Local Development

1.  **Install Dependencies**:
    ```bash
    cd hw6
    npm install
    ```

2.  **Configure Environment**:
    Create a `.env.local` file in the `hw6` directory:
    ```env
    MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/hw6?retryWrites=true&w=majority
    CHANNEL_ACCESS_TOKEN=your_line_channel_access_token
    CHANNEL_SECRET=your_line_channel_secret
    GOOGLE_API_KEY=your_google_api_key
    ```

3.  **Run Locally**:
    ```bash
    npm run dev
    ```
    - Dashboard: `http://localhost:3000`
    - Webhook: `http://localhost:3000/api/webhook` (Use ngrok to expose for Line testing)

### Deployment (Vercel)

1.  Push code to GitHub.
2.  Import project into Vercel.
3.  Set **Root Directory** to `hw6`.
4.  Add the Environment Variables from `.env.local` to Vercel Project Settings.
5.  Deploy.
6.  Update Line Webhook URL to: `https://<your-vercel-domain>/api/webhook`

## 📂 Structure

- `src/app/api/webhook`: Line Bot Webhook Handler.
- `src/app/api/admin`: API routes for the Dashboard.
- `src/lib/llm.ts`: Google Gemini integration logic.
- `src/lib/db.ts`: MongoDB connection helper.
- `src/models`: Mongoose schemas (User, Message).
- `chatbot-design.md`: Detailed design and persona documentation.

## 📝 References
- [Line Messaging API](https://developers.line.biz/en/docs/messaging-api/)
- [Google Gemini API](https://ai.google.dev/)
- [Next.js Documentation](https://nextjs.org/docs)
