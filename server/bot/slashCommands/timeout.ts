import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits } from "discord.js";

export const command = new SlashCommandBuilder()
  .setName('silence')
  .setDescription('Times out and prevents a member from speaking or joining voice channels.')
  .addUserOption(option =>
    option
      .setName('user')
      .setDescription('Target user')
      .setRequired(true))
  .addIntegerOption(option =>
    option
      .setName('duration')
      .setDescription('Timeout duration in minutes (1 day is 1440 minutes).')
      .setRequired(true)
      .setMinValue(1)
      .setMaxValue(40320)) // Max 28 days as per Discord limits
  .addStringOption(option =>
    option
      .setName('reason')
      .setDescription('Reason for member timeout'))
  .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers);

export async function execute(interaction: ChatInputCommandInteraction) {
  const user = interaction.options.getUser('user', true);
  const duration = interaction.options.getInteger('duration', true);
  const reason = interaction.options.getString('reason') ?? 'No reason provided';

  if (!interaction.guild) {
    return interaction.reply({ content: 'This command can only be used in a server.', ephemeral: true });
  }

  const member = await interaction.guild.members.fetch(user.id).catch(() => null);
  
  if (!member) {
    return interaction.reply({ content: '⚠️ The target user is not in this server or channel.', ephemeral: true });
  }

  try {
    await member.timeout(duration * 60 * 1000, reason);
    await interaction.reply(`${user.tag} was timed out for ${duration}. Reason: ${reason}`);
  } catch (error) {
    console.error('Error timing out member:', error);
    await interaction.reply({ content: '⚠️ An error occurred while attempting to time out the target member. Please try again.', ephemeral: true });
  }
}
