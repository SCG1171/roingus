import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits } from "discord.js";
import { storage } from "../../storage";

export const command = new SlashCommandBuilder()
  .setName('warn')
  .setDescription('Warn a member')
  .addUserOption(option =>
    option
      .setName('user')
      .setDescription('The user to warn')
      .setRequired(true))
  .addStringOption(option =>
    option
      .setName('reason')
      .setDescription('The reason for the warning')
      .setRequired(true))
  .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers);

export async function execute(interaction: ChatInputCommandInteraction) {
  const user = interaction.options.getUser('user', true);
  const reason = interaction.options.getString('reason', true);

  if (!interaction.guild) {
    return interaction.reply({ content: 'This command can only be used in a server!', ephemeral: true });
  }

  const member = await interaction.guild.members.fetch(user.id).catch(() => null);
  
  if (!member) {
    return interaction.reply({ content: 'That user is not in the server!', ephemeral: true });
  }

  try {
    await storage.addWarning({
      userId: member.id,
      guildId: interaction.guild.id,
      reason,
      moderatorId: interaction.user.id,
      timestamp: Date.now()
    });

    const warnings = await storage.getWarnings(member.id, interaction.guild.id);
    await interaction.reply(
      `Warned ${user.tag} for: ${reason}\nThis user now has ${warnings.length} warning(s).`
    );
  } catch (error) {
    console.error('Error warning member:', error);
    await interaction.reply({ content: 'There was an error warning the member.', ephemeral: true });
  }
}
