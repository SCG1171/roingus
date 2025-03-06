import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits, TextChannel } from "discord.js";

export const command = new SlashCommandBuilder()
  .setName('imgpurge')
  .setDescription('Delete multiple image attachments from a channel')
  .addIntegerOption(option =>
    option
      .setName('amount')
      .setDescription('Number of images to delete (max 100)')
      .setRequired(true)
      .setMinValue(1)
      .setMaxValue(100))
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages);

export async function execute(interaction: ChatInputCommandInteraction) {
  if (!interaction.guild) {
    return interaction.reply({ content: 'This command can only be used in a server!', ephemeral: true });
  }

  if (!(interaction.channel instanceof TextChannel)) {
    return interaction.reply({ content: 'This command can only be used in text channels!', ephemeral: true });
  }

  const amount = interaction.options.getInteger('amount', true);

  try {
    await interaction.deferReply({ ephemeral: true });

    const messages = await interaction.channel.messages.fetch({ limit: 100 });
    const imageMessages = messages.filter(msg => 
      msg.attachments.some(attachment => attachment.contentType?.startsWith('image/'))
    ).first(amount);

    if (!imageMessages.length) {
      return interaction.editReply('No images found to delete!');
    }

    const deleted = await interaction.channel.bulkDelete(imageMessages, true);
    await interaction.editReply(`Successfully deleted ${deleted.size} image messages.`);
  } catch (error) {
    console.error('Error purging images:', error);
    await interaction.editReply('There was an error deleting image messages. Messages older than 14 days cannot be bulk deleted.');
  }
}
