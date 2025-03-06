import { OpenAI } from "openai";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Cooldown map to track last API call per user
const cooldowns = new Map<string, number>();
const COOLDOWN_TIME = 30000; // 30 seconds cooldown

export async function getAIResponse(userId: string, prompt: string): Promise<string | null> {
  const now = Date.now();
  
  // Enforce cooldown
  if (cooldowns.has(userId) && now - cooldowns.get(userId)! < COOLDOWN_TIME) {
    return "roingus is trying to breathe slow down! jeez";
  }
  
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-1106",
      messages: [{ role: "system", content: "You are a friendly and playful Discord bot named Roingus." }, { role: "user", content: prompt }],
      max_tokens: 50,
      temperature: 0.5,
    });

    const reply = response.choices[0]?.message?.content || null;

    // Update cooldown
    cooldowns.set(userId, now);

    return reply;
  } catch (error) {
    console.error("OpenAI API Error:", error);
    return "roingus is having a brainfart please try again";
  }
}
