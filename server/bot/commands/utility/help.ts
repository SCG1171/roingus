import { Message, EmbedBuilder } from "discord.js";
import { commands } from "../../handlers/command";

export const name = "help";
export const description = "List all commands or get info about a specific command";
export const usage = "!help [command]";
export const cooldown = 3;

export async function execute(message: Message, args: string[]) {
  const embed = new EmbedBuilder()
    .setColor("#0099ff")
    .setTitle("Command Help");

  if (!args.length) {
    embed
      .setDescription("Here's a list of all commands:")
      .addFields(
        { name: "Moderation", value: commands
          .filter(cmd => ["ban", "kick", "timeout", "warn", "clear"].includes(cmd.name))
          .map(cmd => `\`${cmd.name}\``)
          .join(", ")
        },
        { name: "Fun", value: commands
          .filter(cmd => ["8ball", "coinflip", "random", "userinfo"].includes(cmd.name))
          .map(cmd => `\`${cmd.name}\``)
          .join(", ")
        }
      )
      .setFooter({ text: "Use !help <command> for detailed information about a command." });
  } else {
    const command = commands.find(c => c.name === args[0].toLowerCase());
    if (!command) {
      return message.reply("That command doesn't exist!");
    }

    embed
      .setTitle(`Command: ${command.name}`)
      .addFields(
        { name: "Description", value: command.description },
        { name: "Usage", value: command.usage },
        { name: "Cooldown", value: `${command.cooldown} seconds` }
      );
  }

  message.reply({ embeds: [embed] });
}
