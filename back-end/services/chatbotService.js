require("dotenv").config();

const {
  GoogleGenAI,
} = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey:
    process.env.GEMINI_API_KEY,
});

// Generate AI response
const generateAIResponse =
  async (messages) => {
    try {
      // Check API key
      if (
        !process.env.GEMINI_API_KEY
      ) {
        throw new Error(
          "GEMINI_API_KEY is not configured"
        );
      }

      // Validate messages
      if (
        !Array.isArray(messages) ||
        messages.length === 0
      ) {
        throw new Error(
          "No messages provided"
        );
      }

      // Validate every message
      for (const item of messages) {
        if (
          !item ||
          !item.role ||
          typeof item.content !==
            "string" ||
          !item.content.trim()
        ) {
          throw new Error(
            "Invalid message content"
          );
        }
      }

      // Convert controller format
      // to Gemini format
      const contents =
        messages.map(
          (item) => ({
            role:
              item.role ===
              "assistant"
                ? "model"
                : "user",

            parts: [
              {
                text:
                  item.content.trim(),
              },
            ],
          })
        );

      console.log(
        "Messages sent to Gemini:",
        JSON.stringify(
          contents,
          null,
          2
        )
      );

      // Generate Gemini response
      const response =
        await ai.models.generateContent(
          {
            // Keep the model that works
            // in your testgemini.js
            model:
              "gemini-3.6-flash",

            contents,

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
          }
        );

      console.log(
        "Gemini response received"
      );

      // Get response text
      const text =
        response.text;

      if (
        !text ||
        !text.trim()
      ) {
        throw new Error(
          "Gemini returned an empty response"
        );
      }

      return {
        message:
          text.trim(),
      };
    } catch (error) {
      console.error(
        "GEMINI API ERROR:"
      );

      console.error(
        error
      );

      throw new Error(
        "Unable to generate AI response"
      );
    }
  };

module.exports = {
  generateAIResponse,
};