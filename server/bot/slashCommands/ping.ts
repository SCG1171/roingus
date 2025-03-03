import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";

export const command = new SlashCommandBuilder()
  .setName('ping')
  .setDescription('Check roingus\'s ping and responsiveness.');

export async function execute(interaction: ChatInputCommandInteraction) {
  const sent = await interaction.reply({ content: 'Pinging...', fetchReply: true });
  const latency = sent.createdTimestamp - interaction.createdTimestamp;
  await interaction.editReply(`${latency}ms`);
}
