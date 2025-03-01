import { Message } from "discord.js";

export const name = "coinflip";
export const description = "Flip a coin";
export const usage = "!coinflip";
export const cooldown = 3;

export async function execute(message: Message) {
  const result = Math.random() < 0.5 ? "Heads" : "Tails";
  message.reply(`🪙 The coin landed on: **${result}**`);
}
