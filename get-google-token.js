// Script to help get Google OAuth refresh token
require("dotenv").config();
const { google } = require("googleapis");
const readline = require("readline");

const SCOPES = [
  "https://www.googleapis.com/auth/calendar.readonly",
  "https://www.googleapis.com/auth/spreadsheets.readonly",
];

async function getRefreshToken() {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    "urn:ietf:wg:oauth:2.0:oob" // Use "out of band" flow for simpler setup
  );

  // Generate auth URL
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    prompt: "consent", // This ensures we get a refresh token
  });

  console.log("\n🔐 Google OAuth Setup");
  console.log("===================");
  console.log("\n1. Open this URL in your browser:");
  console.log(authUrl);
  console.log("\n2. Complete the authorization");
  console.log("3. Google will show you an authorization code");
  console.log("4. Copy that code and paste it below");

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question("\nEnter the authorization code: ", async (code) => {
    try {
      const { tokens } = await oauth2Client.getToken(code);
      console.log("\n✅ Success! Add this to your .env file:");
      console.log(`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}`);

      if (tokens.access_token) {
        console.log(
          "\n📝 Optional: You can also add the access token (expires in 1 hour):"
        );
        console.log(`GOOGLE_ACCESS_TOKEN=${tokens.access_token}`);
      }

      console.log(
        "\n🎉 OAuth setup complete! Your bot can now access Google APIs."
      );
    } catch (error) {
      console.error("\n❌ Error getting tokens:", error.message);
      console.error("Full error:", error);
    }
    rl.close();
  });
}

if (require.main === module) {
  getRefreshToken().catch(console.error);
}

module.exports = { getRefreshToken };
