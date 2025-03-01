import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits } from "discord.js";

export const command = new SlashCommandBuilder()
  .setName('timeout')
  .setDescription('Timeout (mute) a member')
  .addUserOption(option =>
    option
      .setName('user')
      .setDescription('The user to timeout')
      .setRequired(true))
  .addIntegerOption(option =>
    option
      .setName('duration')
      .setDescription('Timeout duration in minutes')
      .setRequired(true)
      .setMinValue(1)
      .setMaxValue(40320)) // Max 28 days as per Discord limits
  .addStringOption(option =>
    option
      .setName('reason')
      .setDescription('The reason for the timeout'))
  .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers);

export async function execute(interaction: ChatInputCommandInteraction) {
  const user = interaction.options.getUser('user', true);
  const duration = interaction.options.getInteger('duration', true);
  const reason = interaction.options.getString('reason') ?? 'No reason provided';

  if (!interaction.guild) {
    return interaction.reply({ content: 'This command can only be used in a server!', ephemeral: true });
  }

  const member = await interaction.guild.members.fetch(user.id).catch(() => null);
  
  if (!member) {
    return interaction.reply({ content: 'That user is not in the server!', ephemeral: true });
  }

  try {
    await member.timeout(duration * 60 * 1000, reason);
    await interaction.reply(`Successfully timed out ${user.tag} for ${duration} minutes. Reason: ${reason}`);
  } catch (error) {
    console.error('Error timing out member:', error);
    await interaction.reply({ content: 'There was an error timing out the member.', ephemeral: true });
  }
}
