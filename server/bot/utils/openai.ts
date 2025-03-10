import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const HUGGINGFACE_API_KEY = process.env.HF_API_KEY;

// Cooldown system to prevent spam
const cooldowns = new Map<string, number>();
const COOLDOWN_TIME = 30000; // 30 seconds cooldown

// Memory for AI responses
const conversationHistory = new Map<string, { role: string; content: string }[]>();
const HISTORY_LIMIT = 5;

export async function getAIResponse(userId: string, message: string): Promise<string> {
  const now = Date.now();

  if (cooldowns.has(userId) && now - cooldowns.get(userId)! < COOLDOWN_TIME) {
    return "roingus is trying to breathe slow down! jeez";
  }

  if (!conversationHistory.has(userId)) {
    conversationHistory.set(userId, [
      { role: "system", content: "You are Roingus, a playful Discord bot. Be brief, funny, and friendly." }
    ]);
  }

  const history = conversationHistory.get(userId)!;
  history.push({ role: "user", content: message });

  if (history.length > HISTORY_LIMIT) {
    history.splice(1, history.length - HISTORY_LIMIT);
  }

  try {
    const response = await axios.post(
      "https://api-inference.huggingface.co/models/meta-llama/Llama-2-7b-chat",
      {
        inputs: history.map(h => `${h.role}: ${h.content}`).join("\n") + "\nassistant:",
        parameters: { max_new_tokens: 60, temperature: 0.5 },
      },
      { headers: { Authorization: `Bearer ${HUGGINGFACE_API_KEY}` } }
    );

    const rawReply = response.data[0]?.generated_text || "";
    const reply = rawReply.split("assistant:").pop()?.trim() || "roingus is confused :(";

    history.push({ role: "assistant", content: reply });
    cooldowns.set(userId, now);

    return reply;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error("Llama API Error:", error.response?.data || error.message);
    } else {
      console.error("Unknown error:", error);
    }
    return "roingus is having a brainfart, please try again.";
  }
}
