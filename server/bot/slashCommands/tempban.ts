import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits } from "discord.js";

export const command = new SlashCommandBuilder()
  .setName('tempban')
  .setDescription('Temporarily ban a member')
  .addUserOption(option =>
    option
      .setName('user')
      .setDescription('The user to ban')
      .setRequired(true))
  .addIntegerOption(option =>
    option
      .setName('duration')
      .setDescription('Ban duration in hours')
      .setRequired(true)
      .setMinValue(1)
      .setMaxValue(720)) // Max 30 days
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
  const user = interaction.options.getUser('user', true);
  const duration = interaction.options.getInteger('duration', true);
  const reason = interaction.options.getString('reason') ?? 'No reason provided';
  const deleteDays = interaction.options.getInteger('deletedays') ?? 0;

  if (!interaction.guild) {
    return interaction.reply({ content: 'This command can only be used in a server!', ephemeral: true });
  }

  const member = await interaction.guild.members.fetch(user.id).catch(() => null);
  
  if (!member) {
    return interaction.reply({ content: 'That user is not in the server!', ephemeral: true });
  }

  if (!member.bannable) {
    return interaction.reply({ content: 'I cannot ban this user!', ephemeral: true });
  }

  try {
    await member.ban({ reason, deleteMessageDays: deleteDays });
    
    // Schedule unban
    setTimeout(async () => {
      try {
        await interaction.guild!.members.unban(user.id, 'Temporary ban duration expired');
        // Try to notify in the channel where the command was used
        await interaction.channel?.send(`Unbanned ${user.tag} (temporary ban expired)`);
      } catch (error) {
        console.error('Error unbanning member:', error);
        await interaction.channel?.send(`Failed to unban ${user.tag}. Please unban manually.`);
      }
    }, duration * 60 * 60 * 1000); // Convert hours to milliseconds

    await interaction.reply(
      `Successfully banned ${user.tag} for ${duration} hours.\nReason: ${reason}`
    );
  } catch (error) {
    console.error('Error temp-banning member:', error);
    await interaction.reply({ content: 'There was an error banning the member.', ephemeral: true });
  }
}
