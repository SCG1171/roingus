import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
} from "discord.js";

export const command = new SlashCommandBuilder()
  .setName("kick")
  .setDescription(
    "Kicks a member or bot from the server. Kick Member permissions required.",
  )
  .addUserOption((option) =>
    option.setName("user").setDescription("The user to kick").setRequired(true),
  )
  .addStringOption((option) =>
    option.setName("reason").setDescription("The reason for the kick"),
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers);

export async function execute(interaction: ChatInputCommandInteraction) {
  const user = interaction.options.getUser("user", true);
  const reason =
    interaction.options.getString("reason") ?? "No reason provided";

  if (!interaction.guild) {
    return interaction.reply({
      content: "This command can only be used in a server!",
      ephemeral: true,
    });
  }

  const member = await interaction.guild.members
    .fetch(user.id)
    .catch(() => null);

  if (!member) {
    return interaction.reply({
      content: "That user is not in the server!",
      ephemeral: true,
    });
  }

  if (!member.kickable) {
    return interaction.reply({
      content:
        "Error kicking user. Please make sure that I have the necessary permissions and that my role is higher than the target member or bot.",
      ephemeral: true,
    });
  }

  try {
    await member.kick(reason);
    await interaction.reply(
      `${member.user.tag} was successfully kicked from the server. Reason: \"${reason}\"`,
    );
  } catch (error) {
    console.error("Error kicking member:", error);
    await interaction.reply({
      content: "⚠️ An error occured while attempting to kick the member.",
      ephemeral: true,
    });
  }
}
