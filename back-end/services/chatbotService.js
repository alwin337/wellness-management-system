const {
  GoogleGenAI,
} = require("@google/genai")

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
})


const generateAIResponse = async (
  messages
) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error(
        "GEMINI_API_KEY is not configured"
      );
    }

    const response =
      await ai.models.generateContent({
        model: "gemini-3.7-flash",

        contents: messages,

        config: {
          systemInstruction: `
You are a mental wellness support assistant
inside a student mental wellness management system.

Your role is to:
- provide supportive conversation
- provide general mental wellness information
- suggest healthy coping strategies
- help students manage everyday stress
- provide study and time-management suggestions
- encourage students to seek appropriate human support when needed

You are NOT:
- a doctor
- a therapist
- a counsellor
- a diagnostic system

Do not diagnose mental health conditions.
Do not prescribe medication.
Do not tell a student that they have a mental disorder.

If the student describes an immediate safety concern,
encourage them to contact local emergency services,
a trusted person, or an appropriate crisis service
available in their location.

Use a supportive, respectful,
non-judgmental and student-friendly tone.

Keep responses reasonably concise.
        `,

          safetySettings: [
            {
              category:
                "HARM_CATEGORY_HATE_SPEECH",
              threshold:
                "BLOCK_MEDIUM_AND_ABOVE",
            },
            {
              category:
                "HARM_CATEGORY_HARASSMENT",
              threshold:
                "BLOCK_MEDIUM_AND_ABOVE",
            },
            {
              category:
                "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold:
                "BLOCK_MEDIUM_AND_ABOVE",
            },
            {
              category:
                "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold:
                "BLOCK_MEDIUM_AND_ABOVE",
            },
          ],

          temperature: 0.7,

          maxOutputTokens: 500,
        },
      });

    const text = response.text;

    if (!text) {
      throw new Error(
        "Gemini returned an empty response"
      );
    }

    return {
      message: text,
    };
  } catch (error) {
    console.error(
      "GEMINI API ERROR:",
      error.message
    );

    throw new Error(
      "Unable to generate AI response"
    );
  }
};




module.exports = {
  generateAIResponse,
};