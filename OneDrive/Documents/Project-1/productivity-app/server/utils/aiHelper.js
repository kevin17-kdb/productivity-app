const axios = require("axios");

/**
 * Sends a prompt to the Google Gemini API (gemini-1.5-flash model) and returns the text response.
 * Fallbacks to a friendly supportive message if no API Key is found or if the request fails.
 * 
 * @param {string} promptText - The prompt message to send to Gemini
 * @returns {Promise<string>} - The AI generated text response
 */
const generateWithGemini = async (promptText) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey.trim() === "" || apiKey === "YOUR_GEMINI_API_KEY") {
        console.warn("Gemini API key is missing. Returning fallback response.");
        return "AI Mode: (Gemini API key not configured). You are doing amazing! Stay focused, take deep breaths, and tackle your tasks one by one. You've got this!";
    }

    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        const response = await axios.post(url, {
            contents: [
                {
                    parts: [
                        {
                            text: promptText
                        }
                    ]
                }
            ]
        });

        if (
            response.data &&
            response.data.candidates &&
            response.data.candidates[0] &&
            response.data.candidates[0].content &&
            response.data.candidates[0].content.parts &&
            response.data.candidates[0].content.parts[0]
        ) {
            return response.data.candidates[0].content.parts[0].text;
        }

        return "AI Counselor: Great job on writing down your thoughts. Remember to take things one step at a time!";
    } catch (err) {
        console.error("Gemini API Call failed:", err.message);
        return "AI Counselor: It looks like my connection is a bit slow right now, but I want you to know that everything is going to be alright. Keep your head up and focus on what you can control!";
    }
};

/**
 * Generate a counselor feedback message for user mood logs.
 */
const getMoodAIFeedback = async (score, reason) => {
    const scoreDescriptions = {
        1: "very low/awful",
        2: "low/bad",
        3: "okay/average",
        4: "good/happy",
        5: "excellent/super energetic"
    };

    const prompt = `
    You are a compassionate, warm, and highly supportive AI counselor embedded in a productivity and mental health tracking app.
    A user has logged their mood:
    - Mood Score: ${score}/5 (${scoreDescriptions[score]})
    - User stated reason: "${reason || "No reason specified"}"
    
    Please provide a concise, empathetic, and encouraging response (maximum 3-4 sentences). 
    If they are feeling bad or stressed, offer validation and a gentle tip. 
    If they are feeling happy, celebrate with them. 
    Always address them warmly and assure them that "everything is all right" or "they are doing great" where appropriate.
    Do not use complex markdown, keep it simple and readable.
    `;

    return await generateWithGemini(prompt);
};

/**
 * Generate a congratulatory message when user completes 100% of tasks.
 */
const getCelebrationMessage = async (tasksCompletedList) => {
    const taskTitles = tasksCompletedList.map(t => `- ${t.title} (${t.category})`).join("\n");
    const prompt = `
    You are an energetic, enthusiastic productivity companion.
    The user has successfully finished 100% of their checklist today!
    Here are the tasks they completed:
    ${taskTitles}
    
    Write a short, fun, and highly motivating congratulatory message (2-3 sentences) referencing some of the specific tasks they did (e.g., studying, health) to make it personal.
    Use emojis to make it feel vibrant!
    `;

    return await generateWithGemini(prompt);
};

/**
 * Generate a weekly/monthly performance coach recommendation report.
 */
const getProductivityCoachReport = async (stats) => {
    const prompt = `
    You are a professional productivity coach.
    Here is the completion report for the user's workspace:
    - Total Tasks: ${stats.totalTasks}
    - Completed Tasks: ${stats.completedTasks}
    - Completion Rate: ${stats.completionRate}%
    
    Category Breakdown:
    ${Object.entries(stats.categoryStats).map(([cat, value]) => `- ${cat}: ${value.completed}/${value.total} completed (${value.rate}%)`).join("\n")}
    
    Compare this to their completion goals (ideally over 70% in key areas like Studying, Health).
    Provide a professional, actionable, and encouraging report (150-200 words) summarizing:
    1. A quick analysis of their success.
    2. Which sector they should focus more on next (e.g. they had low completion in 'Health' or 'Studying').
    3. 2 simple tips to help them balance their categories.
    
    Format the response with clean headers and bullet points.
    `;

    return await generateWithGemini(prompt);
};

module.exports = {
    getMoodAIFeedback,
    getCelebrationMessage,
    getProductivityCoachReport
};
