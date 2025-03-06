import { Configuration, OpenAIApi } from "openai";
import dotenv from "dotenv";

dotenv.config(); // Load .env file

const openai = new OpenAIApi(
  new Configuration({
    apiKey: process.env.OPENAI_API_KEY, // Ensure this is set in Render
  })
);

// **Handles AI conversation**
export async function getAIResponse(history: { role: "system" | "user" | "assistant"; content: string }[]) {
  try {
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: history,
      max_tokens: 100,
      temperature: 0.7,
    });

    return response.data.choices[0]?.message?.content || null;
  } catch (error) {
    console.error("OpenAI API Error:", error);
    return null;
  }
}
