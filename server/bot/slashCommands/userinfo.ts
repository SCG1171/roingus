import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";

export const command = new SlashCommandBuilder()
  .setName('userinfo')
  .setDescription('Get detailed information about a user')
  .addUserOption(option =>
    option
      .setName('user')
      .setDescription('The user to get info about (defaults to yourself)'));

export async function execute(interaction: ChatInputCommandInteraction) {
  const targetUser = interaction.options.getUser('user') || interaction.user;
  const member = interaction.guild?.members.cache.get(targetUser.id);

  if (!interaction.guild) {
    return interaction.reply({ content: 'This command can only be used in a server!', ephemeral: true });
  }

  const embed = new EmbedBuilder()
    .setColor('#0099ff')
    .setTitle(`User Info - ${targetUser.tag}`)
    .setThumbnail(targetUser.displayAvatarURL())
    .addFields(
      { name: '🆔 ID', value: targetUser.id },
      { name: '📅 Account Created', value: targetUser.createdAt.toLocaleDateString() },
      { name: '🎮 Activity', value: member?.presence?.activities[0]?.name || 'None' },
      { name: '🎭 Roles', value: member?.roles.cache.map(r => r.name).join(', ') || 'None' },
      { name: '🌟 Server Member Since', value: member?.joinedAt?.toLocaleDateString() || 'Unknown' }
    )
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}
