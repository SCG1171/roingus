import { Message, PermissionFlagsBits } from "discord.js";
import { checkPermissions } from "../../utils/permissions";
import { storage } from "../../../storage";

export const name = "warn";
export const description = "Warn a member";
export const usage = "!warn @user <reason>";
export const cooldown = 5;
export const permissions = [PermissionFlagsBits.ModerateMembers];

export async function execute(message: Message, args: string[]) {
  if (!await checkPermissions(message, permissions)) return;

  const member = message.mentions.members?.first();
  if (!member) {
    return message.reply("Please mention a member to warn!");
  }

  const reason = args.slice(1).join(" ");
  if (!reason) {
    return message.reply("Please provide a reason for the warning!");
  }

  try {
    await storage.addWarning({
      userId: member.id,
      guildId: message.guildId!,
      reason,
      moderatorId: message.author.id,
      timestamp: Date.now()
    });

    const warnings = await storage.getWarnings(member.id, message.guildId!);
    message.reply(
      `Warned ${member.user.tag} for: ${reason}\nThis user now has ${warnings.length} warning(s).`
    );
  } catch (error) {
    message.reply("There was an error warning the member.");
    console.error(error);
  }
}
