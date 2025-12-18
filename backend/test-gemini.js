const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config({ path: '.env.local' });

const apiKey = process.env.GEMINI_API_KEY;
console.log("Testing with API Key:", apiKey ? apiKey.substring(0, 10) + "..." : "MISSING");

const genAI = new GoogleGenerativeAI(apiKey);

async function testModel(modelName) {
    try {
        console.log(`\nTesting model: ${modelName}...`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Hello, are you working?");
        const response = await result.response;
        console.log(`[SUCCESS] ${modelName} responded:`, response.text());
    } catch (err) {
        console.error(`[FAILED] ${modelName} error:`, err.message);
    }
}

async function run() {
    await testModel("gemini-1.5-flash");
    await testModel("gemini-pro");
}

run();
