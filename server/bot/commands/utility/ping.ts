import { Message } from "discord.js";

export const name = "ping";
export const description = "Check if the bot is responsive";
export const usage = "!ping";
export const cooldown = 3;

export async function execute(message: Message) {
  const sent = await message.reply("Pinging...");
  const latency = sent.createdTimestamp - message.createdTimestamp;
  await sent.edit(`Pong! Latency is ${latency}ms.`);
}
