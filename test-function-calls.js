// Simple test script to verify function calling is working
require("dotenv").config();
const {
  createChatSession,
  handleFunctionCall,
} = require("./src/config/geminiClient");
const logger = require("./src/utils/logger");

async function testFunctionCalling() {
  try {
    console.log("🧪 Testing Gemini Function Calling...\n");

    // Test 1: Create chat session
    console.log("1. Creating chat session...");
    const chat = createChatSession();
    console.log("✅ Chat session created successfully\n");

    // Test 2: Send a message that should trigger function calling
    console.log(
      "2. Sending test message that should trigger function calling..."
    );
    const testMessage =
      "Please use the get_upcoming_events function to show me upcoming GDG events";
    console.log(`Message: "${testMessage}"`);

    const result = await chat.sendMessage(testMessage);
    const response = await result.response;

    console.log("3. Checking for function calls...");
    console.log("Response structure:", JSON.stringify(response, null, 2));

    // Check if function calling is needed
    let functionCalls;
    try {
      functionCalls = response.functionCalls();
      console.log(
        `Function calls detected via functionCalls(): ${
          functionCalls ? functionCalls.length : 0
        }`
      );
    } catch (error) {
      console.log(
        "No functionCalls() method available, trying alternative detection..."
      );

      // Alternative method to detect function calls
      const candidates = response.candidates;
      if (
        candidates &&
        candidates[0] &&
        candidates[0].content &&
        candidates[0].content.parts
      ) {
        const parts = candidates[0].content.parts;
        console.log("Content parts:", JSON.stringify(parts, null, 2));
        const functionCallPart = parts.find((part) => part.functionCall);
        if (functionCallPart) {
          console.log("✅ Function call detected via alternative method");
          console.log("Function:", functionCallPart.functionCall.name);
          console.log("Args:", functionCallPart.functionCall.args);
        } else {
          console.log("No function calls detected in parts");
        }
      }
    }

    if (functionCalls && functionCalls.length > 0) {
      console.log("✅ Function calls detected successfully!");
      for (let i = 0; i < functionCalls.length; i++) {
        const functionCall = functionCalls[i];
        console.log(`  Function ${i + 1}: ${functionCall.name}`);
        console.log(`  Args: ${JSON.stringify(functionCall.args, null, 2)}`);
      }
    } else {
      console.log(
        "❌ No function calls detected - this might indicate an issue"
      );
      console.log("Response text:", response.text());
    }

    console.log("\n4. Testing direct function handler...");

    // Test the function handler directly
    const testFunctionCall = {
      name: "get_upcoming_events",
      args: { maxResults: 3, daysAhead: 30 },
    };

    console.log("Testing function handler directly...");
    try {
      const directResult = await handleFunctionCall(testFunctionCall);
      console.log("✅ Direct function call successful");
      console.log("Result:", JSON.stringify(directResult, null, 2));
    } catch (error) {
      console.log("❌ Direct function call failed:", error.message);
      console.log(
        "This might be due to missing Google API credentials or configuration"
      );
    }
  } catch (error) {
    console.error("❌ Test failed:", error);
    console.error("Error details:", error.message);
  }
}

// Run the test
testFunctionCalling()
  .then(() => {
    console.log("\n🏁 Test completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Test script error:", error);
    process.exit(1);
  });
