import { Client, Collection, Message } from "discord.js";
import { readdirSync, statSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { checkCooldown } from "../utils/cooldown";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const commands = new Collection<string, any>();

async function loadCommandFile(filePath: string) {
  try {
    const commandModule = await import(`file://${filePath}`); // Ensure proper dynamic import
    if (!commandModule.name || !commandModule.execute) {
      console.warn(`⚠️ Skipping ${filePath}: Missing 'name' or 'execute' function`);
      return;
    }
    commands.set(commandModule.name, commandModule);
    console.log(`✅ Loaded command: ${commandModule.name}`);
  } catch (error) {
    console.error(`❌ Error loading command ${filePath}:`, error);
  }
}

export async function loadCommands() {
  // Ensure correct absolute path resolution
  const commandsPath = join(__dirname, "../../server/bot/commands");

  console.log(`📂 Loading commands from: ${commandsPath}`);

  // :red_circle: Ensure the folder exists before scanning
  if (!existsSync(commandsPath)) {
    console.error(`❌ ERROR: Commands directory does not exist at ${commandsPath}`);
    process.exit(1); // Stop execution to avoid further errors
  }

  function scanDirectory(directory: string) {
    const entries = readdirSync(directory, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(directory, entry.name);
      if (entry.isDirectory()) {
        scanDirectory(fullPath); // Recursively scan subdirectories
      } else if (entry.isFile() && (entry.name.endsWith(".ts") || entry.name.endsWith(".js"))) {
        loadCommandFile(fullPath);
      }
    }
  }

  scanDirectory(commandsPath);
  console.log(`✅ Total commands loaded: ${commands.size}`);
}

export async function handleCommand(client: Client, message: Message) {
  if (!message.content.startsWith("!") || message.author.bot) return;

  const args = message.content.slice(1).trim().split(/ +/);
  const commandName = args.shift()?.toLowerCase();

  if (!commandName) return;

  const command = commands.get(commandName);
  if (!command) {
    return message.reply(":warning: That command doesn't exist! Use !help to see available commands.");
  }

  if (await checkCooldown(message.author.id, command.name, command.cooldown)) {
    return message.reply(`⏳ Please wait ${command.cooldown || 3} seconds before using this command again.`);
  }

  try {
    await command.execute(message, args);
  } catch (error) {
    console.error(`❌ Error executing command '${commandName}':`, error);
    message.reply(":warning: There was an error executing that command!");
  }
}
