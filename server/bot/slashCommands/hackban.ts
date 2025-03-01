import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits } from "discord.js";

export const command = new SlashCommandBuilder()
  .setName('hackban')
  .setDescription('Ban a user by ID (even if they are not in the server)')
  .addStringOption(option =>
    option
      .setName('userid')
      .setDescription('The ID of the user to ban')
      .setRequired(true))
  .addStringOption(option =>
    option
      .setName('reason')
      .setDescription('The reason for the ban'))
  .addIntegerOption(option =>
    option
      .setName('deletedays')
      .setDescription('Number of days of messages to delete')
      .setMinValue(0)
      .setMaxValue(7))
  .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers);

export async function execute(interaction: ChatInputCommandInteraction) {
  const userId = interaction.options.getString('userid', true);
  const reason = interaction.options.getString('reason') ?? 'No reason provided';
  const deleteDays = interaction.options.getInteger('deletedays') ?? 0;

  if (!interaction.guild) {
    return interaction.reply({ content: 'This command can only be used in a server!', ephemeral: true });
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

    await interaction.reply(`Successfully banned user ID ${userId} for: ${reason}`);
  } catch (error) {
    console.error('Error banning user:', error);
    await interaction.reply({ 
      content: 'There was an error banning the user. Make sure the ID is valid.',
      ephemeral: true 
    });
  }
}
