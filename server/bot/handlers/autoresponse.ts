import { Message } from "discord.js";
import { getAIResponse } from "../utils/openai"; // Ensure this file exists

interface AutoResponse {
  triggers: string[];
  responses: string[];
}

// **Predefined responses**
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

// **Main handler function**
export async function handleAutoResponse(message: Message) {
  if (message.author.bot) return;

  // **Check if user mentioned Roingus**
  const isMentioned = message.mentions.has(message.client.user!, { ignoreEveryone: true });

  if (isMentioned) {
    const aiResponse = await getAIResponse(message.author.id, message.content);
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
