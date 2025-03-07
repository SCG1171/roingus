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

export async function getAIResponse(userId: string, message: string): Promise<string | null> {
  const now = Date.now();

  // **Cooldown enforcement**
  if (cooldowns.has(userId) && now - cooldowns.get(userId)! < COOLDOWN_TIME) {
    return "roingus is trying to breathe slow down! jeez";
  }

  // **Initialize user history if not present**
  if (!conversationHistory.has(userId)) {
    conversationHistory.set(userId, [
      { role: "system", content: "You are a playful Discord bot named Roingus. Respond in a fun and friendly way." }
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
    // **Call Hugging Face API for Llama**
    const response = await axios.post(
      "https://api-inference.huggingface.co/models/meta-llama/Llama-2-7b-chat",
      { inputs: message },
      { headers: { Authorization: `Bearer ${HUGGINGFACE_API_KEY}` } }
    );

    // Ensure the response format is correct
    if (response.data && Array.isArray(response.data) && response.data.length > 0) {
      const reply = response.data[0]?.generated_text || "roingus is confused, please try again later.";

      // **Store AI response in conversation history**
      history.push({ role: "assistant", content: reply });

      // **Update cooldown**
      cooldowns.set(userId, now);

      return reply;
    }

    return "roingus doesn't know what to say :(";
  } catch (error) {
    console.error("Llama API Error:", error.response?.data || error.message);
    return "roingus is having a brainfart please try again.";
  }
}
