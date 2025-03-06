import { OpenAI } from "openai";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Cooldown map to track last API call per user
const cooldowns = new Map<string, number>();
const COOLDOWN_TIME = 30000; // 30 seconds cooldown

// Conversation history map (memory)
const conversationHistory = new Map<string, { role: "system" | "user" | "assistant"; content: string }[]>();
const HISTORY_LIMIT = 5; // Stores the last 5 interactions per user

export async function getAIResponse(userId: string, message: string): Promise<string | null> {
  const now = Date.now();
  
  // **Cooldown enforcement**
  if (cooldowns.has(userId) && now - cooldowns.get(userId)! < COOLDOWN_TIME) {
    return "roingus is trying to breathe slow down! jeez";
  }

  // **Initialize user history if not present**
  if (!conversationHistory.has(userId)) {
    conversationHistory.set(userId, [
      { role: "system", content: "You are a friendly and playful Discord bot named Roingus." }
    ]);
  }

  // **Retrieve and update conversation history**
  const history = conversationHistory.get(userId)!;
  history.push({ role: "user", content: message });

  // **Trim history if it exceeds the limit**
  if (history.length > HISTORY_LIMIT) {
    history.splice(1, history.length - HISTORY_LIMIT);
  }

  try {
    // **Call OpenAI API**
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-1106",
      messages: history,
      max_tokens: 50,
      temperature: 0.5,
    });

    const reply = response.choices[0]?.message?.content || null;

    if (reply) {
      // **Store AI response in conversation history**
      history.push({ role: "assistant", content: reply });
    }

    // **Update cooldown**
    cooldowns.set(userId, now);

    return reply;
  } catch (error) {
    console.error("OpenAI API Error:", error);
    return "roingus is having a brainfart please try again";
  }
}
