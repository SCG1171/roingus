import { PerplexityAI } from "perplexity-ai";

// Cooldown system to avoid spam
const cooldowns = new Map<string, number>();
const COOLDOWN_TIME = 30000; // 30 seconds cooldown

// Memory system to track conversations
const conversationHistory = new Map<string, { role: "user" | "assistant"; content: string }[]>();
const HISTORY_LIMIT = 5; // Stores the last 5 interactions per user

export async function getAIResponse(userId: string, message: string): Promise<string | null> {
  const now = Date.now();

  // **Enforce cooldown to prevent spam**
  if (cooldowns.has(userId) && now - cooldowns.get(userId)! < COOLDOWN_TIME) {
    return "roingus is trying to breathe slow down! jeez";
  }

  // **Initialize conversation history**
  if (!conversationHistory.has(userId)) {
    conversationHistory.set(userId, []);
  }

  const history = conversationHistory.get(userId)!;
  history.push({ role: "user", content: message });

  // **Limit history to the last 5 messages**
  if (history.length > HISTORY_LIMIT) {
    history.splice(1, history.length - HISTORY_LIMIT);
  }

  try {
    // **Call Perplexity AI’s Free LLaMA 3 Model**
    const response = await PerplexityAI.chat.completions.create({
      model: "llama-3-8b", // This uses LLaMA 3 8B model
      messages: history,
      max_tokens: 50, // Keep responses short
      temperature: 0.4, // Lower temperature for better accuracy
    });

    const reply = response.choices[0]?.message?.content || null;

    if (reply) {
      history.push({ role: "assistant", content: reply });
    }

    // **Update cooldown**
    cooldowns.set(userId, now);

    return reply;
  } catch (error) {
    console.error("❌ LLaMA 3 API Error:", error);
    return "roingus is having a brainfart please try again";
  }
}
