const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

// Google API scopes
const SCOPES = [
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/spreadsheets.readonly'
];

// Initialize Google Auth
let auth = null;

// Load credentials and create auth client
const initializeAuth = async () => {
  try {
    // Check if credentials file exists
    const credentialsPath = path.join(process.cwd(), 'credentials.json');
    
    if (!fs.existsSync(credentialsPath)) {
      logger.warn('credentials.json not found. Using environment variables for auth.');
      // For production, you might want to use service account or other auth methods
      return null;
    }

    const credentials = JSON.parse(fs.readFileSync(credentialsPath));
    
    auth = new google.auth.GoogleAuth({
      credentials,
      scopes: SCOPES
    });

    logger.info('Google API authentication initialized successfully');
    return auth;
  } catch (error) {
    logger.error('Error initializing Google API auth:', error);
    throw error;
  }
};

// Get authenticated client
const getAuthClient = async () => {
  if (!auth) {
    await initializeAuth();
  }
  return auth;
};

// Initialize Google Calendar API
const getCalendarClient = async () => {
  try {
    const authClient = await getAuthClient();
    if (!authClient) {
      throw new Error('Google authentication not available');
    }
    
    return google.calendar({ version: 'v3', auth: authClient });
  } catch (error) {
    logger.error('Error creating Calendar client:', error);
    throw error;
  }
};

// Initialize Google Sheets API
const getSheetsClient = async () => {
  try {
    const authClient = await getAuthClient();
    if (!authClient) {
      throw new Error('Google authentication not available');
    }
    
    return google.sheets({ version: 'v4', auth: authClient });
  } catch (error) {
    logger.error('Error creating Sheets client:', error);
    throw error;
  }
};

// Validate configuration
const validateConfig = () => {
  const requiredVars = [
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'GOOGLE_CALENDAR_ID',
    'GOOGLE_SHEET_ID'
  ];

  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    logger.warn(`Missing Google API environment variables: ${missingVars.join(', ')}`);
    return false;
  }

  logger.info('Google API configuration validated successfully');
  return true;
};

// Test API connectivity
const testConnectivity = async () => {
  try {
    const calendarClient = await getCalendarClient();
    const calendarId = process.env.GOOGLE_CALENDAR_ID;
    
    // Test calendar access
    await calendarClient.calendars.get({ calendarId });
    logger.info('Google Calendar API connectivity test passed');
    
    // Test sheets access if sheet ID is provided
    if (process.env.GOOGLE_SHEET_ID) {
      const sheetsClient = await getSheetsClient();
      await sheetsClient.spreadsheets.get({
        spreadsheetId: process.env.GOOGLE_SHEET_ID
      });
      logger.info('Google Sheets API connectivity test passed');
    }
    
    return true;
  } catch (error) {
    logger.error('Google API connectivity test failed:', error);
    return false;
  }
};

// Get calendar ID
const getCalendarId = () => {
  return process.env.GOOGLE_CALENDAR_ID;
};

// Get sheet ID
const getSheetId = () => {
  return process.env.GOOGLE_SHEET_ID;
};

module.exports = {
  initializeAuth,
  getAuthClient,
  getCalendarClient,
  getSheetsClient,
  validateConfig,
  testConnectivity,
  getCalendarId,
  getSheetId,
  SCOPES
}; 