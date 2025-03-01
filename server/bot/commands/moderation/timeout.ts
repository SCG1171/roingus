import { Message, PermissionFlagsBits } from "discord.js";
import { checkPermissions } from "../../utils/permissions";

export const name = "timeout";
export const description = "Timeout a member";
export const usage = "!timeout @user <minutes> [reason]";
export const cooldown = 5;
export const permissions = [PermissionFlagsBits.ModerateMembers];

export async function execute(message: Message, args: string[]) {
  if (!await checkPermissions(message, permissions)) return;

  const member = message.mentions.members?.first();
  if (!member) {
    return message.reply("Please mention a member to timeout!");
  }

  const minutes = parseInt(args[1]);
  if (isNaN(minutes) || minutes <= 0) {
    return message.reply("Please provide a valid number of minutes!");
  }

  const reason = args.slice(2).join(" ") || "No reason provided";

  try {
    await member.timeout(minutes * 60 * 1000, reason);
    message.reply(`Timed out ${member.user.tag} for ${minutes} minutes. Reason: ${reason}`);
  } catch (error) {
    message.reply("There was an error timing out the member.");
    console.error(error);
  }
}
