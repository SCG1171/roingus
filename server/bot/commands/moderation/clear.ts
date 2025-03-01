import { Message, PermissionFlagsBits } from "discord.js";
import { checkPermissions } from "../../utils/permissions";

export const name = "clear";
export const description = "Clear messages from a channel";
export const usage = "!clear <number>";
export const cooldown = 5;
export const permissions = [PermissionFlagsBits.ManageMessages];

export async function execute(message: Message, args: string[]) {
  if (!await checkPermissions(message, permissions)) return;

  const amount = parseInt(args[0]);
  if (isNaN(amount) || amount < 1 || amount > 100) {
    return message.reply("Please provide a number between 1 and 100!");
  }

  try {
    const deleted = await message.channel.bulkDelete(amount + 1);
    message.channel.send(`Deleted ${deleted.size - 1} messages.`)
      .then(msg => setTimeout(() => msg.delete(), 3000));
  } catch (error) {
    message.reply("There was an error deleting messages.");
    console.error(error);
  }
}
