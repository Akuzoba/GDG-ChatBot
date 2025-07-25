// Service Account setup for Google APIs
// This approach doesn't require user OAuth consent

require("dotenv").config();
const { google } = require("googleapis");

console.log("🔧 Google Service Account Setup");
console.log("================================");
console.log();
console.log(
  "Instead of OAuth, let's use a Service Account which is better for server applications."
);
console.log();
console.log("📋 Steps to set up Service Account:");
console.log();
console.log("1. Go to Google Cloud Console: https://console.cloud.google.com/");
console.log("2. Select your project (or create one)");
console.log('3. Go to "APIs & Services" > "Credentials"');
console.log('4. Click "Create Credentials" > "Service Account"');
console.log("5. Fill in the service account details");
console.log("6. After creation, click on the service account");
console.log('7. Go to "Keys" tab > "Add Key" > "Create new key" > "JSON"');
console.log(
  '8. Download the JSON file and save it as "service-account.json" in your project root'
);
console.log();
console.log("9. Enable the following APIs:");
console.log("   - Google Calendar API");
console.log();
console.log("10. Share your calendar with the service account email:");
console.log(
  "    - The email will be in the format: your-service-account@your-project.iam.gserviceaccount.com"
);
console.log(
  '    - Give it "Make changes to events" or "See all event details" permissions as needed'
);
console.log();
console.log(
  "✅ After completing these steps, run: node test-service-account.js"
);

module.exports = {};
