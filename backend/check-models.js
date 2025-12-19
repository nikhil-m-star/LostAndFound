const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config({ path: '.env.local' });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
    const modelsToCheck = [
        "gemini-1.5-flash",
        "gemini-2.0-flash-exp",
        "gemini-2.0-flash"
    ];

    for (const modelName of modelsToCheck) {
        try {
            console.log(`Trying ${modelName}...`);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Hello");
            console.log(`${modelName} works:`, result.response.text());
        } catch (err) {
            console.error(`${modelName} failed:`, err.message);
        }
    }
}

listModels();
