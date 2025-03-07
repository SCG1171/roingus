import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits, TextChannel } from "discord.js";

export const command = new SlashCommandBuilder()
  .setName("imgpurge")
  .setDescription("Delete multiple image attachments from a channel")
  .addIntegerOption(option =>
    option
      .setName("amount")
      .setDescription("Number of messages to check (max 100)")
      .setRequired(true)
      .setMinValue(1)
      .setMaxValue(100)
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages);

export async function execute(interaction: ChatInputCommandInteraction) {
  if (!interaction.guild) {
    return interaction.reply({ content: "This command can only be used in a server.", ephemeral: true });
  }

  if (!(interaction.channel instanceof TextChannel)) {
    return interaction.reply({ content: "This command can only be used in text channels.", ephemeral: true });
  }

  const amount = interaction.options.getInteger("amount", true);

  try {
    await interaction.deferReply({ ephemeral: true });

    const messages = await interaction.channel.messages.fetch({ limit: amount });

    // Filter messages containing image attachments only
    const imageMessages = messages.filter(msg =>
      msg.attachments.some(attachment => attachment.contentType?.startsWith("image/"))
    );

    if (imageMessages.size === 0) {
      return interaction.editReply("⚠️ I couldn't find any images to delete.");
    }
    
    // Only delete messages newer than 14 days
    const now = Date.now();
    const toDelete = imageMessages.filter(msg => now - msg.createdTimestamp < 1209600000); // 14 days in milliseconds

    if (toDelete.size === 0) {
      return interaction.editReply("⚠️ No images found within the deletable timeframe (last 14 days).");
    }

    let deletedCount = 0;
    for (const message of toDelete.values()) {
      await message.delete();
      deletedCount++;
    }

    await interaction.editReply(`✅ Successfully deleted ${deletedCount} image messages.`);
  } catch (error) {
    console.error("❌ Error deleting image messages:", error);
    await interaction.editReply("⚠️ There was an error while attempting to purge messages. Messages older than 14 days cannot be deleted.");
  }
}
