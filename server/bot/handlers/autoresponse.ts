import { Message } from "discord.js";

interface AutoResponse {
  triggers: string[];
  responses: string[];
}

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
    triggers: ["good roingus"],
    responses: [
      "*happy beeping*",
      "thank you! *virtual tail wag*",
      "*proud robot noises*",
      "aww shucks ≧◡≦",
      "*happy dance*"
    ]
  },
  {
    triggers: ["pat roingus", "pet roingus"],
    responses: [
      "*happy purring*",
      "*leans into pets*",
      "*chirps contentedly*",
      "more pets please! :3",
      "*nuzzles your hand*"
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
      "-# roingussssssss... *hiss*"
    ]
  }
];

export function getRandomResponse(message: string): string | null {
  const lowerMessage = message.toLowerCase();
  
  for (const response of autoResponses) {
    if (response.triggers.some(trigger => lowerMessage.includes(trigger))) {
      const randomIndex = Math.floor(Math.random() * response.responses.length);
      return response.responses[randomIndex];
    }
  }
  
  return null;
}

export async function handleAutoResponse(message: Message) {
  if (message.author.bot) return;
  
  const response = getRandomResponse(message.content);
  if (response) {
    await message.reply(response);
  }
}
