import { Message, PermissionFlagsBits, GuildMember } from "discord.js";
import { checkPermissions } from "../../utils/permissions";

export const name = "ban";
export const description = "Ban a member from the server";
export const usage = "!ban @user [reason]";
export const cooldown = 5;
export const permissions = [PermissionFlagsBits.BanMembers];

export async function execute(message: Message, args: string[]) {
  if (!(await checkPermissions(message, permissions))) return;

  const member: GuildMember | undefined = message.mentions.members?.first();
  if (!member) {
    return message.reply("I couldn't find the target user.");
  }

  const reason: string = args.slice(1).join(" ") || "No reason provided";

  if (!member.bannable) {
    return message.reply(
      "Unable to ban user. Ensure my role is higher than this user and I have the necessary permissions."
    );
  }

  try {
    await member.ban({ reason });
    await message.reply(
      `${member.user.tag} was banned from the server. Reason: "${reason}"`
    );
  } catch (error) {
    console.error("Ban error:", error);
    await message.reply(
      "⚠️ An error occurred while attempting to ban the target member. Please check my permissions and role position."
    );
  }
}
