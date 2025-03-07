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

  console.log("🔄 Processing request for:", userId);
  
  // **Check API Key**
  if (!HUGGINGFACE_API_KEY) {
    console.error("❌ Missing Hugging Face API Key! Check .env settings.");
    return "roingus is having an existential crisis, fix the API key!";
  }

  // **Cooldown enforcement**
  if (cooldowns.has(userId) && now - cooldowns.get(userId)! < COOLDOWN_TIME) {
    return "roingus is trying to breathe, slow down! jeez";
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
    console.log("📤 Sending request to Hugging Face API...");
    
    // **Call Hugging Face API for Llama**
    const response = await axios.post(
      "https://api-inference.huggingface.co/models/TinyLlama/TinyLlama-1.1B-Chat-v1.0",
      { inputs: message },
      {
        headers: { Authorization: `Bearer ${HUGGINGFACE_API_KEY}` },
        timeout: 30000 //30s timeout
      }
    );

    console.log("✅ API Response Received:", response.data);

    // Ensure the response format is correct
    let reply: string = "roingus is confused, please try again later.";

    if (response.data) {
      if (Array.isArray(response.data) && response.data.length > 0) {
        reply = response.data[0]?.generated_text || reply;
      } else if (response.data.generated_text) {
        reply = response.data.generated_text;
      }
    }

    console.log("💬 AI Reply:", reply);

    // **Store AI response in conversation history**
    history.push({ role: "assistant", content: reply });

    // **Update cooldown**
    cooldowns.set(userId, now);

    return reply;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error("❌ Llama API Error:", error.response?.data || error.message);
      if (error.response?.status === 401) {
        return "roingus can't talk right now, invalid API key! Fix it.";
      }
      if (error.response?.status === 503) {
        return "roingus is sleeping, the AI is overloaded. Try again later.";
      }
    } else {
      console.error("❌ Unknown error:", error);
    }
    return "roingus is having a brainfart, try again later.";
  }
}
