import { Message, EmbedBuilder } from "discord.js";

export const name = "userinfo";
export const description = "Get information about a user";
export const usage = "!userinfo [@user]";
export const cooldown = 3;

export async function execute(message: Message) {
  const member = message.mentions.members?.first() || message.member;
  if (!member) return;

  const embed = new EmbedBuilder()
    .setColor("#0099ff")
    .setTitle(`User Info - ${member.user.tag}`)
    .setThumbnail(member.user.displayAvatarURL())
    .addFields(
      { name: "Joined Server", value: member.joinedAt?.toLocaleDateString() || "Unknown" },
      { name: "Account Created", value: member.user.createdAt.toLocaleDateString() },
      { name: "Roles", value: member.roles.cache.map(r => r.name).join(", ") }
    )
    .setTimestamp();

  message.reply({ embeds: [embed] });
}
