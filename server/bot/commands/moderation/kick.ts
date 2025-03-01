import { Message, PermissionFlagsBits } from "discord.js";
import { checkPermissions } from "../../utils/permissions";

export const name = "kick";
export const description =
  "Kicks a member or bot from the server. Kick Member permissions required.";
export const usage = "!kick @user [reason]";
export const cooldown = 5;
export const permissions = [PermissionFlagsBits.KickMembers];

export async function execute(message: Message, args: string[]) {
  if (!(await checkPermissions(message, permissions))) return;

  const member = message.mentions.members?.first();
  if (!member) {
    return message.reply("Please mention a valid member or UID to kick.");
  }

  const reason = args.slice(1).join(" ") || "No reason provided";

  if (!member.kickable) {
    return message.reply(
      "Error kicking user. Please make sure that I have the necessary permissions and that my role is higher than the target member or bot.",
    );
  }

  try {
    await member.kick(reason);
    message.reply(
      `${member.user.tag} was successfully kicked from the server. Reason: \"${reason}\""`,
    );
  } catch (error) {
    message.reply("⚠️ An error occured while attempting to kick the member.");
    console.error(error);
  }
}
