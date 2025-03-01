import { Client, Collection, Message } from "discord.js";
import { readdirSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { checkCooldown } from "../utils/cooldown";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const commands = new Collection<string, any>();

export async function loadCommands() {
  console.log("Loading commands from:", join(__dirname, "../commands"));
  const commandsPath = join(__dirname, "../commands");
  const entries = readdirSync(commandsPath, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isDirectory()) {
      // Handle command folders (like moderation, fun)
      const folderPath = join(commandsPath, entry.name);
      const commandFiles = readdirSync(folderPath)
        .filter(file => file.endsWith(".ts") || file.endsWith(".js"));

      console.log(`Loading commands from ${entry.name} folder:`, commandFiles);
      for (const file of commandFiles) {
        const commandModule = await import(join(folderPath, file));
        commands.set(commandModule.name, commandModule);
        console.log(`Loaded command: ${commandModule.name}`);
      }
    } else if (entry.isFile() && (entry.name.endsWith(".ts") || entry.name.endsWith(".js"))) {
      // Handle root-level command files
      const commandModule = await import(join(commandsPath, entry.name));
      commands.set(commandModule.name, commandModule);
      console.log(`Loaded command: ${commandModule.name}`);
    }
  }

  console.log("Total commands loaded:", commands.size);
}

export async function handleCommand(client: Client, message: Message) {
  if (!message.content.startsWith("!") || message.author.bot) return;

  const args = message.content.slice(1).trim().split(/ +/);
  const commandName = args.shift()?.toLowerCase();

  if (!commandName) return;

  const command = commands.get(commandName);
  if (!command) {
    message.reply("That command doesn't exist! Use !help to see available commands.");
    return;
  }

  if (await checkCooldown(message.author.id, command.name, command.cooldown)) {
    const cooldownTime = command.cooldown || 3;
    return message.reply(`Please wait ${cooldownTime} seconds before using this command again.`);
  }

  try {
    await command.execute(message, args);
  } catch (error) {
    console.error(`Error executing command ${commandName}:`, error);
    message.reply("There was an error executing that command!");
  }
}