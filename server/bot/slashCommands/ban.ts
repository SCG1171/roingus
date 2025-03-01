import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
} from "discord.js";

export const command = new SlashCommandBuilder()
  .setName("ban")
  .setDescription("Ban a member from the server")
  .addUserOption((option) =>
    option.setName("user").setDescription("Target user").setRequired(true),
  )
  .addStringOption((option) =>
    option.setName("reason").setDescription("Ban reason"),
  )
  .addIntegerOption((option) =>
    option
      .setName("deletedays")
      .setDescription("Purge messages within X days")
      .setMinValue(0)
      .setMaxValue(7),
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers);

export async function execute(interaction: ChatInputCommandInteraction) {
  const user = interaction.options.getUser("user", true);
  const reason =
    interaction.options.getString("reason") ?? "No reason provided";
  const deleteDays = interaction.options.getInteger("deletedays") ?? 0;

  if (!interaction.guild) {
    return interaction.reply({
      content: "This command can only be used in a server.",
      ephemeral: true,
    });
  }

  const member = await interaction.guild.members
    .fetch(user.id)
    .catch(() => null);

  if (!member) {
    return interaction.reply({
      content: "I couldn't find the target user.",
      ephemeral: true,
    });
  }

  if (!member.bannable) {
    return interaction.reply({
      content:
        "Unable to ban user. Please make sure my role is higher than this user and that I have the necessary permissions to ban the target user.",
      ephemeral: true,
    });
  }

  try {
    await member.ban({ reason, deleteMessageDays: deleteDays });
    await interaction.reply(
      `${user.tag} was banned from the server. Reason: \"${reason}\"`,
    );
  } catch (error) {
    console.error("Error banning member:", error);
    await interaction.reply({
      content:
        "⚠️ An error occured while attempting to ban the target member. Please try again and ensure that I have the necessary permissions and that my role is higher than the target user or bot's highest role.",
      ephemeral: true,
    });
  }
}
