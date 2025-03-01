import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";

export const command = new SlashCommandBuilder()
  .setName('random')
  .setDescription('Generate a random number')
  .addIntegerOption(option =>
    option
      .setName('max')
      .setDescription('Maximum number (default: 100)')
      .setMinValue(1)
      .setMaxValue(1000000));

export async function execute(interaction: ChatInputCommandInteraction) {
  const max = interaction.options.getInteger('max') || 100;
  const number = Math.floor(Math.random() * max) + 1;
  await interaction.reply(`🎲 Your random number is: **${number}**`);
}
