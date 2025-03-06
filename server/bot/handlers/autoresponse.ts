import { Message } from "discord.js";
import { getAIResponse } from "../utils/openai"; // Import AI function

interface AutoResponse {
  triggers: string[];
  responses: string[];
}

// Predefined responses
const autoResponses: AutoResponse[] = [
  {
    triggers: ["who's a good roingus", "whos a good roingus", "who is a good roingus"],
    responses: [
      "mhm yes im good roingus :3",
      "*wags tail happily* meee",
      "*happy roingus noises* me! me! i am!",
      "hehe im a good roingus :D",
      "*proud roingus pose* me i am a certified good roingus :3",
      "ME ME ME! *bounces excitedly*"
    ]
  },
  {
    triggers: ["bad roingus"],
    responses: [
      "waaaaaaaaaa",
      ":(",
      "what did i do :(",
      "that was mean",
      "*sad roingus noises*"
    ]
  },
  {
    triggers: ["roingus"],
    responses: [
      "roingus :3",
      "hi i am roingus",
      "roingus roingus roingus",
      "# i am best roingus.",
      "-# roingussssssss... *hiss*",
      "*poof* roingus."
    ]
  }
];

// Conversation memory storage
const conversationMemory = new Map<string, { role: "system" | "user" | "assistant", content: string }[]>();

// Function to get a random predefined response
function getRandomResponse(message: string): string | null {
  const lowerMessage = message.toLowerCase();

  for (const response of autoResponses) {
    if (response.triggers.some(trigger => lowerMessage.includes(trigger))) {
      const randomIndex = Math.floor(Math.random() * response.responses.length);
      return response.responses[randomIndex];
    }
  }
  
  return null;
}

// Main handler function
export async function handleAutoResponse(message: Message) {
  if (message.author.bot) return;

  // Check for predefined responses first
  const response = getRandomResponse(message.content);
  if (response) {
    return message.reply(response);
  }

  // Check if Roingus was mentioned
  const isMentioned = message.mentions.has(message.client.user!, { ignoreEveryone: true });

  if (isMentioned) {
    const userId = message.author.id;

    // Initialize user conversation memory if it doesn't exist
    if (!conversationMemory.has(userId)) {
      conversationMemory.set(userId, [{ role: "system", content: "You are a playful and friendly Discord bot named Roingus." }]);
    }

    // Retrieve and update conversation memory
    const memory = conversationMemory.get(userId)!;
    memory.push({ role: "user", content: message.content });

    // Keep memory within last 5 messages for efficiency
    if (memory.length > 6) memory.splice(1, memory.length - 5);

    // Get AI-generated response
    const aiResponse = await getAIResponse(memory);
    if (aiResponse) {
      memory.push({ role: "assistant", content: aiResponse }); // Store response in memory
      return message.reply(aiResponse);
    } else {
      return message.reply("⚠️ roingus is having a stroke please try again later");
    }
  }
}
