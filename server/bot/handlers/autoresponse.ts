import { Message } from "discord.js";
import { Configuration, OpenAIApi } from "openai";
import dotenv from "dotenv";

dotenv.config(); // Load API key from .env

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
      "*wags tail happily* that would be me!",
      "*happy roingus noises* me! me! i am!",
      "hehe im a good roingus :D",
      "*proud roingus pose* yours truly!",
      "ME ME ME! *bounces excitedly*"
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

// OpenAI API Setup
const openai = new OpenAIApi(
  new Configuration({
    apiKey: process.env.OPENAI_API_KEY, // Make sure this is set in your environment variables
  })
);

// Function to check predefined responses
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

// AI Response Function
async function getAIResponse(prompt: string): Promise<string | null> {
  try {
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo", // Use GPT-4 if needed
      messages: [{ role: "system", content: "You are a playful Discord bot named Roingus." }, { role: "user", content: prompt }],
      max_tokens: 100,
      temperature: 0.7,
    });

    return response.data.choices[0]?.message?.content || null;
  } catch (error) {
    console.error("OpenAI API Error:", error);
    return null;
  }
}

// Main handler function
export async function handleAutoResponse(message: Message) {
  if (message.author.bot) return;

  // Check if user mentioned Roingus
  const isMentioned = message.mentions.has(message.client.user!, { ignoreEveryone: true });

  if (isMentioned) {
    const aiResponse = await getAIResponse(message.content);
    if (aiResponse) {
      return message.reply(aiResponse);
    } else {
      return message.reply("roingus is having a stroke please try again later");
    }
  }

  // Check for predefined responses
  const response = getRandomResponse(message.content);
  if (response) {
    return message.reply(response);
  }
}
