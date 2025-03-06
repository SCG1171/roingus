import { Message } from "discord.js";
import { getAIResponse } from "../utils/openai"; // Ensure this file exists

interface AutoResponse {
  triggers: string[];
  responses: string[];
}

// **Core predefined responses**
const autoResponses: AutoResponse[] = [
  {
    triggers: ["who's a good roingus", "whos a good roingus", "who is a good roingus"],
    responses: ["mhm yes im good roingus :3", "hehe im a good roingus :D", "ME ME ME! *bounces excitedly*"]
  },
  {
    triggers: ["bad roingus"],
    responses: ["waaaaaaaaaa", ":(", "what did i do :(", "that was mean", "*sad roingus noises*"]
  },
  {
    triggers: ["roingus"],
    responses: ["roingus :3", "hi i am roingus", "roingus roingus roingus", "# i am best roingus."]
  }
];

// **Memory for AI Responses**
const conversationHistory = new Map<string, { role: "system" | "user" | "assistant"; content: string }[]>();

// **Function to get a random predefined response**
function getRandomResponse(message: string): string | null {
  const lowerMessage = message.toLowerCase();
  for (const response of autoResponses) {
    if (response.triggers.some(trigger => lowerMessage.includes(trigger))) {
      return response.responses[Math.floor(Math.random() * response.responses.length)];
    }
  }
  return null;
}

// **Handles AI conversation with memory**
async function getMemoryAIResponse(userId: string, message: string): Promise<string | null> {
  if (!conversationHistory.has(userId)) {
    conversationHistory.set(userId, [
      { role: "system", content: "You are a playful Discord bot named Roingus. Your tone is cheerful and friendly." }
    ]);
  }

  // Add user message to conversation history
  const history = conversationHistory.get(userId)!;
  history.push({ role: "user", content: message });

  // **Convert history to OpenAI-compatible format**
  const formattedHistory = history.map(entry => ({
    role: entry.role as "system" | "user" | "assistant",
    content: entry.content
  }));

  const aiResponse = await getAIResponse(formattedHistory);

  if (aiResponse) {
    history.push({ role: "assistant", content: aiResponse });

    // **Limit memory to the last 5 interactions**
    if (history.length > 10) history.splice(1, history.length - 5);

    return aiResponse;
  }
  return null;
}

// **Main handler function**
export async function handleAutoResponse(message: Message) {
  if (message.author.bot) return;

  // **Check if user mentioned Roingus**
  const isMentioned = message.mentions.has(message.client.user!, { ignoreEveryone: true });

  if (isMentioned) {
    const aiResponse = await getMemoryAIResponse(message.author.id, message.content);
    if (aiResponse) {
      return message.reply(aiResponse);
    } else {
      return message.reply("😵 roingus is having a stroke please try again later.");
    }
  }

  // **Check for predefined responses**
  const response = getRandomResponse(message.content);
  if (response) {
    return message.reply(response);
  }
}
