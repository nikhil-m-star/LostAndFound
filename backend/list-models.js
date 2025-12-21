require('dotenv').config({ path: '.env.local' });
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function listModels() {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
        console.log("No API Key found.");
        return;
    }

    // Note: listModels is not directly on GenerativeModel, but we can try a different approach 
    // or just rely on the error messages. 
    // However, usually we can't list models with just the generate-ai package easily without a complex setup 
    // or using the REST API.
    // Let's use a simple fetch to the REST API matching the node SDK logic.

    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.models) {
            console.log("\n✅ AVAILABLE MODELS FOR YOUR KEY:");
            data.models.forEach(m => {
                if (m.name.includes('gemini')) {
                    console.log(`- ${m.name.replace('models/', '')}`);
                }
            });
        } else {
            console.log("❌ Could not list models:", JSON.stringify(data));
        }
    } catch (err) {
        console.error("❌ Network Error:", err.message);
    }
}

listModels();
