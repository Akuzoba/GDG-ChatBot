# GDG WhatsApp Bot Setup Guide

## Prerequisites

Before setting up the GDG WhatsApp Bot, ensure you have:

- Node.js 18+ installed
- npm or yarn package manager
- A Google Cloud Platform account
- A Twilio account
- A Google Calendar with GDG events
- A Google Sheets document for FAQs and data

## Step 1: Project Setup

### 1.1 Clone and Install Dependencies

```bash
# Clone the repository
git clone <repository-url>
cd gdg-whatsapp-bot

# Install dependencies
npm install
```

### 1.2 Environment Configuration

```bash
# Copy the example environment file
cp env.example .env

# Edit the .env file with your configuration
nano .env
```

## Step 2: Google Cloud Platform Setup

### 2.1 Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable billing for the project

### 2.2 Enable Required APIs

Enable the following APIs in your Google Cloud project:

- Google Calendar API
- Google Sheets API
- Google Drive API (if needed)

```bash
# Using gcloud CLI (optional)
gcloud services enable calendar-json.googleapis.com
gcloud services enable sheets.googleapis.com
gcloud services enable drive.googleapis.com
```

### 2.3 Create Service Account

1. Go to **IAM & Admin** > **Service Accounts**
2. Click **Create Service Account**
3. Name: `gdg-whatsapp-bot`
4. Description: `Service account for GDG WhatsApp Bot`
5. Click **Create and Continue**

### 2.4 Grant Permissions

Assign the following roles to the service account:
- **Calendar API**: Calendar API User
- **Sheets API**: Sheets API User
- **Drive API**: Drive API User (if needed)

### 2.5 Download Credentials

1. Click on the created service account
2. Go to **Keys** tab
3. Click **Add Key** > **Create New Key**
4. Choose **JSON** format
5. Download the file and save as `credentials.json` in the project root

### 2.6 Configure Google Calendar

1. Create a Google Calendar for GDG events
2. Share the calendar with the service account email
3. Note the Calendar ID (found in calendar settings)

### 2.7 Configure Google Sheets

1. Create a Google Sheets document
2. Share it with the service account email
3. Create the following sheets:
   - **FAQs**: Category, Question, Answer, Tags
   - **Speakers**: Name, Bio, Expertise, Contact, Events, Social
   - **Resources**: Category, Title, Description, Link, Type
   - **Feedback**: EventID, Rating, Comments, Date, Attendee

## Step 3: Twilio Setup

### 3.1 Create Twilio Account

1. Go to [Twilio Console](https://console.twilio.com/)
2. Sign up for a new account
3. Verify your phone number

### 3.2 Set Up WhatsApp Sandbox

1. Go to **Messaging** > **Try it out** > **Send a WhatsApp message**
2. Follow the instructions to join the sandbox
3. Note the sandbox phone number

### 3.3 Get API Credentials

1. Go to **Console** > **Account Info**
2. Copy your **Account SID** and **Auth Token**
3. Note your **Twilio Phone Number**

### 3.4 Configure Webhook URL

For development:
```bash
# Install ngrok
npm install -g ngrok

# Start your application
npm run dev

# In another terminal, expose your local server
ngrok http 3000

# Copy the HTTPS URL (e.g., https://abc123.ngrok.io)
```

For production, use your deployed URL.

## Step 4: Gemini AI Setup

### 4.1 Get Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the API key

### 4.2 Configure Environment Variables

Update your `.env` file with all the credentials:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Twilio Configuration
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=whatsapp:+1234567890

# Google Gemini AI Configuration
GEMINI_API_KEY=your_gemini_api_key

# Google APIs Configuration
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback

# Google Calendar Configuration
GOOGLE_CALENDAR_ID=your_calendar_id@group.calendar.google.com

# Google Sheets Configuration
GOOGLE_SHEET_ID=your_google_sheet_id

# Security
WEBHOOK_SECRET=your_webhook_secret
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
```

## Step 5: Data Setup

### 5.1 Populate Google Calendar

Add some sample GDG events to your calendar:

```
Event: GDG Meetup - Introduction to AI
Date: Next week
Time: 6:00 PM - 8:00 PM
Location: Community Center
Description: Learn about artificial intelligence and machine learning
```

### 5.2 Populate Google Sheets

Add sample data to your sheets:

**FAQs Sheet:**
```
Category | Question | Answer | Tags
Events | How do I join GDG events? | Simply show up! All our events are free and open to everyone. | membership, events
Events | What should I bring to events? | Just bring yourself and a laptop if the event requires coding. | events, preparation
```

**Speakers Sheet:**
```
Name | Bio | Expertise | Contact | Events | Social
John Doe | Senior Developer at Tech Corp | AI/ML, Web Development | john@example.com | AI Workshop | @johndoe
```

## Step 6: Testing

### 6.1 Start the Application

```bash
# Development mode
npm run dev

# Production mode
npm start
```

### 6.2 Test the Webhook

```bash
# Test the webhook endpoint
curl -X POST http://localhost:3000/webhook/test \
  -H "Content-Type: application/json" \
  -d '{"userId": "test123", "message": "What events are coming up?"}'
```

### 6.3 Test WhatsApp Integration

1. Send a message to your Twilio WhatsApp number
2. Check the logs for processing
3. Verify the response is received

## Step 7: Deployment

### 7.1 Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
```

### 7.2 Deploy to Render

1. Connect your GitHub repository to Render
2. Create a new Web Service
3. Set build command: `npm install`
4. Set start command: `npm start`
5. Add environment variables

### 7.3 Deploy to Heroku

```bash
# Install Heroku CLI
npm install -g heroku

# Create Heroku app
heroku create gdg-whatsapp-bot

# Set environment variables
heroku config:set TWILIO_ACCOUNT_SID=your_sid
heroku config:set TWILIO_AUTH_TOKEN=your_token
# ... set all other variables

# Deploy
git push heroku main
```

### 7.4 Update Webhook URL

After deployment, update your Twilio webhook URL:

1. Go to Twilio Console > Messaging > Settings > WhatsApp Sandbox
2. Set the webhook URL to: `https://your-domain.com/webhook/whatsapp`
3. Save the configuration

## Step 8: Monitoring and Maintenance

### 8.1 Health Checks

```bash
# Check application health
curl https://your-domain.com/health

# Check webhook status
curl https://your-domain.com/webhook/status
```

### 8.2 Logs

Monitor the application logs:

```bash
# View logs
tail -f logs/combined.log

# View error logs
tail -f logs/error.log
```

### 8.3 Analytics

Check conversation statistics:

```bash
curl https://your-domain.com/webhook/stats
```

## Troubleshooting

### Common Issues

1. **Webhook not receiving messages**
   - Check webhook URL configuration
   - Verify Twilio signature validation
   - Check server logs

2. **Google API errors**
   - Verify service account permissions
   - Check credentials.json file
   - Ensure APIs are enabled

3. **Gemini API errors**
   - Verify API key is correct
   - Check API quota limits
   - Review request format

4. **Message delivery failures**
   - Check Twilio account status
   - Verify phone number format
   - Review rate limits

### Debug Mode

Enable debug logging:

```env
LOG_LEVEL=debug
NODE_ENV=development
```

### Support

For issues and questions:
- Check the logs in `logs/` directory
- Review the architecture documentation
- Create an issue in the repository

## Security Best Practices

1. **Never commit credentials**
   - Keep `.env` file in `.gitignore`
   - Use environment variables in production

2. **Regular updates**
   - Keep dependencies updated
   - Monitor security advisories

3. **Access control**
   - Limit service account permissions
   - Use least privilege principle

4. **Monitoring**
   - Set up alerts for errors
   - Monitor API usage and costs 