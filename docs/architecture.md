# GDG WhatsApp Bot Architecture

## Overview

The GDG WhatsApp Bot is a conversational AI assistant that provides instant access to GDG community information through WhatsApp. The system integrates multiple services to deliver real-time, accurate responses to user queries.

## System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   WhatsApp      │    │   Twilio API    │    │   Node.js       │
│   User          │◄──►│   (Messaging)   │◄──►│   Backend       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                       │
                                                       ▼
                       ┌─────────────────────────────────────────┐
                       │           Gemini 2.5 Flash             │
                       │           (AI Processing)              │
                       └─────────────────────────────────────────┘
                                                       │
                                                       ▼
                       ┌─────────────────────────────────────────┐
                       │           Google APIs                   │
                       │  ┌─────────────┐  ┌─────────────┐      │
                       │  │   Calendar  │  │   Sheets    │      │
                       │  │   (Events)  │  │  (FAQs, etc)│      │
                       │  └─────────────┘  └─────────────┘      │
                       └─────────────────────────────────────────┘
```

## Core Components

### 1. WhatsApp Interface
- **Platform**: WhatsApp Business API via Twilio
- **Function**: Receives and sends messages to users
- **Features**: Text messages, media support, webhook handling

### 2. Twilio Integration
- **Service**: Twilio WhatsApp API
- **Function**: Message routing and delivery
- **Security**: Webhook signature validation
- **Features**: Message status tracking, error handling

### 3. Node.js Backend
- **Framework**: Express.js
- **Function**: Request handling, business logic orchestration
- **Features**: Rate limiting, security middleware, logging

### 4. Gemini AI Engine
- **Model**: Gemini 2.5 Flash
- **Function**: Natural language understanding and response generation
- **Features**: Function calling, conversation context, multi-turn dialogue

### 5. Google Services Integration
- **Calendar API**: Event information, schedules, speaker details
- **Sheets API**: FAQs, community resources, speaker bios
- **Authentication**: OAuth 2.0 with service account

## Data Flow

### 1. Message Reception
```
User → WhatsApp → Twilio → Webhook → Node.js Backend
```

### 2. Message Processing
```
Node.js → Gemini AI → Function Call → Google APIs → Response Generation
```

### 3. Response Delivery
```
Generated Response → Twilio → WhatsApp → User
```

## Function Calling System

The bot uses Gemini's function calling capability to dynamically fetch information:

### Available Functions

1. **get_upcoming_events**
   - Fetches events from Google Calendar
   - Parameters: maxResults, daysAhead
   - Returns: Event list with details

2. **get_event_details**
   - Retrieves specific event information
   - Parameters: eventId, eventTitle
   - Returns: Detailed event data

3. **get_past_events**
   - Fetches historical event data
   - Parameters: maxResults, daysBack
   - Returns: Past events list

4. **get_faqs**
   - Searches FAQ database
   - Parameters: category, searchTerm
   - Returns: Relevant FAQs

5. **get_speaker_info**
   - Retrieves speaker information
   - Parameters: speakerName, eventId
   - Returns: Speaker details

## Conversation Management

### Session Handling
- **Storage**: In-memory Map (chatSessions)
- **Key**: User phone number
- **Lifetime**: Until server restart or manual clear
- **Context**: Maintains conversation history

### Message Flow
1. **Parse**: Extract message content and sender
2. **Validate**: Check for special commands
3. **Process**: Send to Gemini with context
4. **Execute**: Handle function calls if needed
5. **Respond**: Send formatted response via WhatsApp

## Security Features

### 1. Webhook Validation
- Twilio signature verification
- Request authenticity checks
- Replay attack prevention

### 2. Rate Limiting
- Per-IP request limiting
- Configurable thresholds
- Graceful degradation

### 3. Error Handling
- Comprehensive error catching
- User-friendly error messages
- Detailed logging for debugging

### 4. Environment Security
- API key management
- Environment variable protection
- Credential file security

## Scalability Considerations

### 1. Horizontal Scaling
- Stateless design
- Session management improvements needed
- Load balancer ready

### 2. Performance Optimization
- Connection pooling
- Caching strategies
- Async processing

### 3. Monitoring
- Health checks
- Performance metrics
- Error tracking

## Deployment Architecture

### Development
```
Local Machine → ngrok → Twilio Webhook
```

### Production
```
Cloud Platform (Vercel/Render/Heroku) → Twilio Webhook
```

### Environment Variables
- API keys and secrets
- Service configuration
- Feature flags

## Integration Points

### 1. Google Calendar
- **Purpose**: Event data source
- **Access**: Read-only
- **Sync**: Real-time via API

### 2. Google Sheets
- **Purpose**: FAQ and resource database
- **Structure**: Multiple sheets for different data types
- **Updates**: Manual or automated

### 3. Twilio WhatsApp
- **Purpose**: Message transport
- **Features**: Media support, status tracking
- **Limitations**: Rate limits, message size

### 4. Gemini AI
- **Purpose**: Natural language processing
- **Capabilities**: Function calling, context awareness
- **Limitations**: Token limits, response time

## Error Handling Strategy

### 1. Graceful Degradation
- Fallback responses
- Service availability checks
- User-friendly error messages

### 2. Retry Logic
- Exponential backoff
- Circuit breaker pattern
- Timeout handling

### 3. Monitoring
- Error logging
- Performance metrics
- Alert systems

## Future Enhancements

### 1. Multi-modal Support
- Image processing
- Document handling
- Voice message support

### 2. Advanced Analytics
- User behavior tracking
- Conversation analytics
- Performance insights

### 3. Integration Expansion
- Slack integration
- Email notifications
- Social media feeds

### 4. AI Improvements
- Custom training data
- Domain-specific fine-tuning
- Multi-language support 