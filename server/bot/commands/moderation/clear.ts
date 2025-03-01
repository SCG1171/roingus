import { Message, PermissionFlagsBits, TextChannel } from "discord.js";
import { checkPermissions } from "../../utils/permissions";

export const name = "clear";
export const description = "Delete messages in bulk";
export const usage = "!clear <amount>";
export const cooldown = 5;
export const permissions = [PermissionFlagsBits.ManageMessages];

export async function execute(message: Message, args: string[]) {
  if (!(await checkPermissions(message, permissions))) return;

  const amount = parseInt(args[0]);
  if (isNaN(amount) || amount < 1 || amount > 100) {
    return message.reply("Please provide a valid number between 1 and 100.");
  }

  const channel = message.channel;
  if (channel.isTextBased() && channel instanceof TextChannel) {
    try {
      const deletedMessages = await channel.bulkDelete(amount, true);
      await message.reply(`Successfully deleted ${deletedMessages.size} messages.`);
    } catch (error) {
      console.error("Clear command error:", error);
      await message.reply("⚠️ Unable to delete messages. Ensure I have the correct permissions.");
    }
  } else {
    return message.reply("I can only delete messages in server text channels.");
  }
}
