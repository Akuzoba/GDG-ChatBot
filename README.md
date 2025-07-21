# GDG Event Assistant WhatsApp Bot

A smart, conversational WhatsApp chatbot for GDG communities powered by Google's Gemini 2.5 Flash AI. This bot provides instant access to event information, speaker details, and community insights through natural language conversations.

## 🚀 Features

- **Real-Time Event Info**: Get up-to-date schedules, event details, and speaker bios
- **Past Insights**: Quickly summarize or recall key points from past events
- **Dynamic Conversation**: Handles both factual queries and creative discussions with multi-turn context
- **Continuous Updates**: Data pulled directly from Google Calendar and Google Sheets
- **WhatsApp Accessibility**: Members interact naturally through WhatsApp - no apps or logins required

## 🛠️ Tech Stack

- **Backend**: Node.js with Express.js
- **AI/LLM**: Google Gemini 2.5 Flash
- **Messaging**: Twilio WhatsApp API
- **Data Sources**: Google Calendar, Google Sheets
- **Deployment**: Cloud-ready (Vercel, Render, Heroku)

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Twilio Account (for WhatsApp API)
- Google Cloud Project (for Gemini AI and Google APIs)
- Google Calendar with events
- Google Sheets for FAQs and additional data

## 🔧 Setup Instructions

### 1. Clone and Install

```bash
git clone <repository-url>
cd gdg-whatsapp-bot
npm install
```

### 2. Environment Configuration

Copy the example environment file and configure your API keys:

```bash
cp env.example .env
```

Edit `.env` with your actual API keys:

```env
# Twilio Configuration
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=whatsapp:+1234567890

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# Google APIs
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALENDAR_ID=your_calendar_id@group.calendar.google.com
GOOGLE_SHEET_ID=your_google_sheet_id
```

### 3. Google API Setup

1. Create a Google Cloud Project
2. Enable Google Calendar API and Google Sheets API
3. Create OAuth 2.0 credentials
4. Download credentials and save as `credentials.json` in project root

### 4. Twilio Setup

1. Create a Twilio account
2. Set up WhatsApp Sandbox or Business API
3. Configure webhook URL to point to your deployment

### 5. Run the Application

```bash
# Development
npm run dev

# Production
npm start
```

## 📁 Project Structure

```
gdg-whatsapp-bot/
├── src/
│   ├── index.js                 # Express server entry point
│   ├── config/                  # Service configurations
│   ├── routes/                  # API routes
│   ├── controllers/             # Request handlers
│   ├── services/                # External API services
│   └── utils/                   # Helper functions
├── docs/                        # Documentation
├── tests/                       # Test files
└── package.json
```

## 🔄 How It Works

1. User sends message to WhatsApp number
2. Twilio forwards message to Node.js backend
3. Backend processes with Gemini 2.5 Flash (function calling enabled)
4. Gemini may call tools to fetch from Google Calendar/Sheets
5. Response generated and sent back via WhatsApp

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch
```

## 🚀 Deployment

### Vercel
```bash
npm install -g vercel
vercel
```

### Render
1. Connect your GitHub repository
2. Set environment variables
3. Deploy

### Heroku
```bash
heroku create
git push heroku main
```

## 📚 API Documentation

### Webhook Endpoint
- **POST** `/webhook/whatsapp` - Receives WhatsApp messages from Twilio

### Health Check
- **GET** `/health` - Application health status

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For issues and questions:
- Create an issue in the repository
- Check the documentation in `/docs`
- Review the setup guide in `/docs/setup.md`

## 🔮 Future Enhancements

- Multi-modal support (images, QR codes)
- Voice message processing
- Multi-language support
- Advanced analytics and insights
- Integration with more data sources 