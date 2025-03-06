import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Ensure this is set in Render
});

export async function getAIResponse(prompt: string): Promise<string | null> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // Change to "gpt-4" if needed
      messages: [{ role: "system", content: "You are a playful Discord bot named Roingus." }, { role: "user", content: prompt }],
      max_tokens: 100,
      temperature: 0.7,
    });

    return response.choices[0]?.message?.content || null;
  } catch (error) {
    console.error("OpenAI API Error:", error);
    return null;
  }
}
