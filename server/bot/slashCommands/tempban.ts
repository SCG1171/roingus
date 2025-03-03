import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits, GuildMember, TextChannel } from "discord.js";

export const command = new SlashCommandBuilder()
  .setName("tempban")
  .setDescription("Bans target member for a specified duration in hours.")
  .addUserOption((option) =>
    option.setName("user").setDescription("Target user").setRequired(true)
  )
  .addIntegerOption((option) =>
    option
      .setName("duration")
      .setDescription("Ban duration in hours")
      .setRequired(true)
      .setMinValue(1)
      .setMaxValue(720) // Max 30 days
  )
  .addStringOption((option) =>
    option.setName("reason").setDescription("Ban reason")
  )
  .addIntegerOption((option) =>
    option
      .setName("deletedays")
      .setDescription("Purge messages within X days (maximum of 7 days)")
      .setMinValue(0)
      .setMaxValue(7)
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers);

export async function execute(interaction: ChatInputCommandInteraction) {
  const user = interaction.options.getUser("user", true);
  const duration = interaction.options.getInteger("duration", true);
  const reason = interaction.options.getString("reason") ?? "No reason provided";
  const deleteDays = interaction.options.getInteger("deletedays") ?? 0;

  if (!interaction.guild) {
    return interaction.reply({ content: "This command can only be used in a server.", ephemeral: true });
  }

  const member: GuildMember | null = await interaction.guild.members.fetch(user.id).catch(() => null);

  if (!member) {
    return interaction.reply({ content: "⚠️ The target user is not in this server or channel.", ephemeral: true });
  }

  if (!member.bannable) {
    return interaction.reply({ content: "One or more roles on this user is preventing them from being banned. Please make sure the target user does not have the Administrator permission and try again.", ephemeral: true });
  }

  try {
    await member.ban({ reason, deleteMessageSeconds: deleteDays * 86400 });

    await interaction.reply(
      `Successfully banned **${user.tag}** for **${duration} hours**.\nReason: **${reason}**`
    );

    // Schedule unban
    setTimeout(async () => {
      try {
        await interaction.guild!.bans.remove(user.id, "Temporary ban duration expired");

        if (interaction.channel && interaction.channel.isTextBased() && interaction.channel instanceof TextChannel) {
          await interaction.channel.send(`🔓 **${user.tag}**'s ban has expired.`);
        }
      } catch (error) {
        console.error("Error unbanning member:", error);
        if (interaction.channel && interaction.channel.isTextBased() && interaction.channel instanceof TextChannel) {
          await interaction.channel.send(`⚠️ Failed to unban **${user.tag}**. Try unbanning them manually.`);
        }
      }
    }, duration * 60 * 60 * 1000);
  } catch (error) {
    console.error("Error temp-banning member:", error);
    await interaction.reply({ content: "⚠️ An error occured while attempting to ban the target member.", ephemeral: true });
  }
}
