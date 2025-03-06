import { Configuration, OpenAIApi } from "openai";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables

const openai = new OpenAIApi(
  new Configuration({
    apiKey: process.env.OPENAI_API_KEY, // Make sure this is set in Render
  })
);

export async function getAIResponse(prompt: string): Promise<string | null> {
  try {
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [{ role: "system", content: "You are a playful Discord bot named Roingus." }, { role: "user", content: prompt }],
      max_tokens: 100,
      temperature: 0.7,
    });

    return response.data.choices[0]?.message?.content || null;
  } catch (error) {
    console.error("OpenAI API Error:", error);
    return null;
  }
}
