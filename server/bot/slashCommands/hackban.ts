import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits } from "discord.js";

export const command = new SlashCommandBuilder()
  .setName('forceban')
  .setDescription('Ban a user by ID (even if they are not in the server)')
  .addStringOption(option =>
    option
      .setName('userid')
      .setDescription('UID of target user')
      .setRequired(true))
  .addStringOption(option =>
    option
      .setName('reason')
      .setDescription('Ban reason'))
  .addIntegerOption(option =>
    option
      .setName('deletedays')
      .setDescription('Purge all messages from target user within X days (max 7 days)')
      .setMinValue(0)
      .setMaxValue(7))
  .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers);

export async function execute(interaction: ChatInputCommandInteraction) {
  const userId = interaction.options.getString('userid', true);
  const reason = interaction.options.getString('reason') ?? 'No reason provided';
  const deleteDays = interaction.options.getInteger('deletedays') ?? 0;

  if (!interaction.guild) {
    return interaction.reply({ content: 'This command can only be used in a server.', ephemeral: true });
  }

  try {
    // Validate the user ID format
    if (!/^\d{17,19}$/.test(userId)) {
      return interaction.reply({ 
        content: 'Invalid user ID format. User IDs are 17-19 digit numbers.',
        ephemeral: true 
      });
    }

    await interaction.guild.members.ban(userId, { 
      reason,
      deleteMessageDays: deleteDays
    });

    await interaction.reply(`UID ${userId} (<@${userId}>) was successfully banned from the server. ${reason}`);
  } catch (error) {
    console.error('Error banning user:', error);
    await interaction.reply({ 
      content: '⚠️ An error occurred while attempting to ban the target member. Please ensure that you have the correct UID and permissions.',
      ephemeral: true 
    });
  }
}
