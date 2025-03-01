import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits, TextChannel, Collection, Message } from "discord.js";

export const command = new SlashCommandBuilder()
  .setName("purge")
  .setDescription("Delete multiple messages from a channel")
  .addIntegerOption((option) =>
    option
      .setName("amount")
      .setDescription("Number of messages to delete (max 100)")
      .setRequired(true)
      .setMinValue(1)
      .setMaxValue(100)
  )
  .addUserOption((option) =>
    option.setName("user").setDescription("Delete messages from a specific target user.")
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages);

export async function execute(interaction: ChatInputCommandInteraction) {
  if (!interaction.guild) {
    return interaction.reply({ content: "This command can only be used in a server.", ephemeral: true });
  }

  if (!(interaction.channel instanceof TextChannel)) {
    return interaction.reply({ content: "This command can only be used in a text channel.", ephemeral: true });
  }

  const amount = interaction.options.getInteger("amount", true);
  const user = interaction.options.getUser("user");

  try {
    await interaction.deferReply({ ephemeral: true });

    const messages: Collection<string, Message> = await interaction.channel.messages.fetch({ limit: 100 });

    let filteredMessages: Message[] = [];

    if (user) {
      filteredMessages = messages
        .filter((msg) => msg.author.id === user.id)
        .first(amount);
    } else {
      filteredMessages = messages.first(amount);
    }

    if (!filteredMessages.length) {
      return interaction.editReply("No messages found to delete!");
    }

    const deleted = await interaction.channel.bulkDelete(filteredMessages, true);
    await interaction.editReply(`Successfully deleted ${deleted.size} messages.`);
  } catch (error) {
    console.error("Error purging messages:", error);
    await interaction.editReply(
      "⚠️ An error occurred while attempting to delete messages. Messages older than 14 days cannot be bulk deleted."
    );
  }
}
