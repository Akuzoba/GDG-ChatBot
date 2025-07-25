// Test script for Service Account authentication
require("dotenv").config();
const { google } = require("googleapis");
const path = require("path");
const fs = require("fs");

async function testServiceAccount() {
  try {
    console.log(
      "🧪 Testing Service Account Authentication (Calendar Only)...\n"
    );

    // Check if service account file exists
    const serviceAccountPath = path.join(process.cwd(), "service-account.json");
    if (!fs.existsSync(serviceAccountPath)) {
      console.log("❌ service-account.json not found");
      console.log(
        "📋 Please run: node setup-service-account.js for instructions"
      );
      return;
    }

    // Load service account credentials
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath));
    console.log("✅ Service account file loaded");
    console.log(`📧 Service account email: ${serviceAccount.client_email}`);

    // Create auth client
    const auth = new google.auth.GoogleAuth({
      keyFile: serviceAccountPath,
      scopes: ["https://www.googleapis.com/auth/calendar.readonly"],
    });

    console.log("✅ Auth client created");

    // Test Calendar API
    if (process.env.GOOGLE_CALENDAR_ID) {
      console.log("\n📅 Testing Calendar API...");
      const calendar = google.calendar({ version: "v3", auth });

      try {
        const response = await calendar.events.list({
          calendarId: process.env.GOOGLE_CALENDAR_ID,
          timeMin: new Date().toISOString(),
          maxResults: 3,
          singleEvents: true,
          orderBy: "startTime",
        });

        console.log("✅ Calendar API test successful");
        console.log(`📊 Found ${response.data.items.length} upcoming events`);

        if (response.data.items.length > 0) {
          console.log("📋 Sample events:");
          response.data.items.forEach((event, i) => {
            const start = event.start.dateTime || event.start.date;
            console.log(`   ${i + 1}. ${event.summary} - ${start}`);
          });
        }
      } catch (error) {
        console.log("❌ Calendar API test failed:", error.message);
        if (error.message.includes("notFound")) {
          console.log(
            "💡 Make sure you shared the calendar with the service account email"
          );
        }
      }
    } else {
      console.log("⚠️ GOOGLE_CALENDAR_ID not set in .env file");
    }

    console.log("\n🎉 Service Account testing completed!");
  } catch (error) {
    console.error("❌ Service Account test failed:", error.message);
  }
}

if (require.main === module) {
  testServiceAccount().catch(console.error);
}

module.exports = { testServiceAccount };

async function testServiceAccount() {
  try {
    console.log("🧪 Testing Service Account Authentication...\n");

    // Check if service account file exists
    const serviceAccountPath = path.join(process.cwd(), "service-account.json");
    if (!fs.existsSync(serviceAccountPath)) {
      console.log("❌ service-account.json not found");
      console.log(
        "📋 Please run: node setup-service-account.js for instructions"
      );
      return;
    }

    // Load service account credentials
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath));
    console.log("✅ Service account file loaded");
    console.log(`📧 Service account email: ${serviceAccount.client_email}`);

    // Create auth client
    const auth = new google.auth.GoogleAuth({
      keyFile: serviceAccountPath,
      scopes: ["https://www.googleapis.com/auth/calendar.readonly"],
    });

    console.log("✅ Auth client created");

    // Test Calendar API
    if (process.env.GOOGLE_CALENDAR_ID) {
      console.log("\n📅 Testing Calendar API...");
      const calendar = google.calendar({ version: "v3", auth });

      try {
        const response = await calendar.events.list({
          calendarId: process.env.GOOGLE_CALENDAR_ID,
          timeMin: new Date().toISOString(),
          maxResults: 3,
          singleEvents: true,
          orderBy: "startTime",
        });

        console.log("✅ Calendar API test successful");
        console.log(`📊 Found ${response.data.items.length} upcoming events`);

        if (response.data.items.length > 0) {
          console.log("📋 Sample events:");
          response.data.items.forEach((event, i) => {
            const start = event.start.dateTime || event.start.date;
            console.log(`   ${i + 1}. ${event.summary} - ${start}`);
          });
        }
      } catch (error) {
        console.log("❌ Calendar API test failed:", error.message);
        if (error.message.includes("notFound")) {
          console.log(
            "💡 Make sure you shared the calendar with the service account email"
          );
        }
      }
    } else {
      console.log("⚠️ GOOGLE_CALENDAR_ID not set in .env file");
    }

    console.log("\n🎉 Service Account testing completed!");
  } catch (error) {
    console.error("❌ Service Account test failed:", error.message);
  }
}

if (require.main === module) {
  testServiceAccount().catch(console.error);
}

module.exports = { testServiceAccount };
