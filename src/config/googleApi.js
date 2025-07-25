const { google } = require("googleapis");
const fs = require("fs");
const path = require("path");
const logger = require("../utils/logger");

// Google API scopes
const SCOPES = [
  "https://www.googleapis.com/auth/calendar.readonly",
  // Removed Google Sheets scope
];

// Initialize Google Auth
let auth = null;

// Load credentials and create auth client
const initializeAuth = async () => {
  try {
    // First, try Service Account authentication (recommended for server apps)
    const serviceAccountPath = path.join(process.cwd(), "service-account.json");

    if (fs.existsSync(serviceAccountPath)) {
      logger.info("Using Service Account authentication");
      auth = new google.auth.GoogleAuth({
        keyFile: serviceAccountPath,
        scopes: SCOPES,
      });
      logger.info("Service Account authentication initialized successfully");
      return auth;
    }

    // Fallback to OAuth2 if service account is not available
    logger.info("Service account not found, trying OAuth2 authentication");

    // Check if we have required environment variables for OAuth2
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      logger.error("Missing required Google API credentials");
      throw new Error(
        "Google API credentials not configured. Please set up Service Account or OAuth2 credentials."
      );
    }

    // Create OAuth2 client using environment variables
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI || "urn:ietf:wg:oauth:2.0:oob"
    );

    // For server-to-server authentication, we need a refresh token
    if (process.env.GOOGLE_REFRESH_TOKEN) {
      oauth2Client.setCredentials({
        refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
        access_token: process.env.GOOGLE_ACCESS_TOKEN || null,
      });

      // Automatically refresh the access token when needed
      oauth2Client.on("tokens", (tokens) => {
        if (tokens.refresh_token) {
          logger.info("New refresh token received");
        }
        if (tokens.access_token) {
          logger.info("Access token refreshed");
        }
      });

      auth = oauth2Client;
      logger.info(
        "OAuth2 authentication initialized successfully using environment variables"
      );
      return auth;
    } else {
      logger.warn("No refresh token found and no service account available.");
      logger.info("Please either:");
      logger.info("1. Set up Service Account: node setup-service-account.js");
      logger.info("2. Set up OAuth2: node get-google-token.js");
      throw new Error("Google authentication not configured");
    }
  } catch (error) {
    logger.error("Error initializing Google API auth:", error);
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
      throw new Error("Google authentication not available");
    }

    return google.calendar({ version: "v3", auth: authClient });
  } catch (error) {
    logger.error("Error creating Calendar client:", error);
    throw error;
  }
};

// Initialize Google Sheets API
const getSheetsClient = async () => {
  try {
    const authClient = await getAuthClient();
    if (!authClient) {
      throw new Error("Google authentication not available");
    }

    return google.sheets({ version: "v4", auth: authClient });
  } catch (error) {
    logger.error("Error creating Sheets client:", error);
    throw error;
  }
};

// Validate configuration
const validateConfig = () => {
  const serviceAccountPath = path.join(process.cwd(), "service-account.json");
  const hasServiceAccount = fs.existsSync(serviceAccountPath);

  if (hasServiceAccount) {
    logger.info(
      "Service Account found - authentication will use service-account.json"
    );

    // Check for required data source IDs (only calendar now)
    if (!process.env.GOOGLE_CALENDAR_ID) {
      logger.warn("Missing GOOGLE_CALENDAR_ID in environment variables");
      return false;
    }

    return true;
  }

  // If no service account, check for OAuth2 credentials
  const requiredOAuthVars = [
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET",
    "GOOGLE_CALENDAR_ID",
    "GOOGLE_REFRESH_TOKEN",
  ];

  const missingOAuthVars = requiredOAuthVars.filter(
    (varName) => !process.env[varName]
  );

  if (missingOAuthVars.length > 0) {
    logger.warn(
      `Missing OAuth2 environment variables: ${missingOAuthVars.join(", ")}`
    );
    logger.info("Please either:");
    logger.info("1. Set up Service Account: node setup-service-account.js");
    logger.info("2. Set up OAuth2: node get-google-token.js");
    return false;
  }

  logger.info("OAuth2 configuration validated successfully");
  return true;
};

// Test API connectivity
const testConnectivity = async () => {
  try {
    const calendarClient = await getCalendarClient();
    const calendarId = process.env.GOOGLE_CALENDAR_ID;

    // Test calendar access
    await calendarClient.calendars.get({ calendarId });
    logger.info("Google Calendar API connectivity test passed");

    return true;
  } catch (error) {
    logger.error("Google API connectivity test failed:", error);
    return false;
  }
};

// Get calendar ID
const getCalendarId = () => {
  return process.env.GOOGLE_CALENDAR_ID;
};

module.exports = {
  initializeAuth,
  getAuthClient,
  getCalendarClient,
  getSheetsClient, // Keep for backward compatibility, but won't be used
  validateConfig,
  testConnectivity,
  getCalendarId,
  SCOPES,
};
