import { Message } from "discord.js";

export const name = "8ball";
export const description = "Ask the magic 8ball a question";
export const usage = "!8ball <question>";
export const cooldown = 3;

const responses = [
  "It is certain.",
  "It is decidedly so.",
  "Without a doubt.",
  "Yes definitely.",
  "You may rely on it.",
  "As I see it, yes.",
  "Most likely.",
  "Outlook good.",
  "Yes.",
  "Signs point to yes.",
  "Reply hazy, try again.",
  "Ask again later.",
  "Better not tell you now.",
  "Cannot predict now.",
  "Concentrate and ask again.",
  "Don't count on it.",
  "My reply is no.",
  "My sources say no.",
  "Outlook not so good.",
  "Very doubtful."
];

export async function execute(message: Message, args: string[]) {
  if (!args.length) {
    return message.reply("Please ask a question!");
  }

  const response = responses[Math.floor(Math.random() * responses.length)];
  message.reply(`🎱 ${response}`);
}
