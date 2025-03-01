import { Message } from "discord.js";

export const name = "random";
export const description = "Generate a random number";
export const usage = "!random [max]";
export const cooldown = 3;

export async function execute(message: Message, args: string[]) {
  const max = parseInt(args[0]) || 100;
  if (max < 1) {
    return message.reply("Please provide a number greater than 0!");
  }

  const number = Math.floor(Math.random() * max) + 1;
  message.reply(`🎲 Your random number is: **${number}**`);
}
