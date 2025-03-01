import { Message, PermissionFlagsBits } from "discord.js";
import { checkPermissions } from "../../utils/permissions";

export const name = "ban";
export const description = "Ban a member from the server";
export const usage = "!ban @user [reason]";
export const cooldown = 5;
export const permissions = [PermissionFlagsBits.BanMembers];

export async function execute(message: Message, args: string[]) {
  if (!(await checkPermissions(message, permissions))) return;

  const member = message.mentions.members?.first();
  if (!member) {
    return message.reply("I couldn't find the target user.");
  }

  const reason = args.slice(1).join(" ") || "No reason provided";

  if (!member.bannable) {
    return message.reply(
      "Unable to ban user. Please make sure my role is higher than this user and that I have the necessary permissions to ban the target user.",
    );
  }

  try {
    await member.ban({ reason });
    message.reply(
      `${user.tag} was banned from the server. Reason: \"${reason}\"`,
    );
  } catch (error) {
    message.reply(
      "⚠️ An error occured while attempting to ban the target member. Please try again and ensure that I have the necessary permissions and that my role is higher than the target user or bot's highest role.",
    );
    console.error(error);
  }
}
