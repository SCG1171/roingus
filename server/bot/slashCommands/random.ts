import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";

export const command = new SlashCommandBuilder()
  .setName('random')
  .setDescription('Generate a random number between X and Y. Defaults to a random number between 1 and 100.')
  .addIntegerOption(option =>
    option
      .setName('min')
      .setDescription('Minimum number (default: 1)')
      .setMinValue(0)
      .setMaxValue(999999))
  .addIntegerOption(option =>
    option
      .setName('max')
      .setDescription('Maximum number (default: 100)')
      .setMinValue(2)  // Ensures "max" is greater than "min" by default
      .setMaxValue(1000000));

export async function execute(interaction: ChatInputCommandInteraction) {
  const min = interaction.options.getInteger('min') || 1;
  const max = interaction.options.getInteger('max') || 100;

  if (min >= max) {
    await interaction.reply(`⚠️ (**${min}**) is not less than (**${max}**). Please try different numbers.`);
    return;
  }

  const number = Math.floor(Math.random() * (max - min + 1)) + min;
  await interaction.reply(`🎲 Your random number is: **${number}**`);
}
