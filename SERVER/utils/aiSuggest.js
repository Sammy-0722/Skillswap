// utils/aiSuggest.js
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function getAIMatchReason(currentUser, matchProfile) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

    const prompt = `In one short friendly sentence, explain why ${matchProfile.name} 
    (teaches: ${matchProfile.teaches.join(", ")}, wants: ${matchProfile.wants.join(", ")}) 
    is a good skill-swap match for a user who teaches ${currentUser.teaches.join(", ")} 
    and wants to learn ${currentUser.wants.join(", ")}.`;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (err) {
    console.error("Gemini error, falling back:", err.message);
    return null; // fall back to your rule-based reason
  }
}

module.exports = { getAIMatchReason };