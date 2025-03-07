import { Client, Collection, Events, IntentsBitField } from "discord.js";
import { loadCommands, handleCommand } from "./handlers/command";
import { handleAutoResponse } from "./handlers/autoresponse";
import { handleMemberJoin } from "./handlers/automod";
import { deployCommands } from "./utils/deployCommands";
import * as ping from "./slashCommands/ping";
import * as ban from "./slashCommands/ban";
import * as kick from "./slashCommands/kick";
import * as timeout from "./slashCommands/timeout";
import * as purge from "./slashCommands/purge";
import * as imgpurge from "./slashCommands/imgpurge"; // ✅ Ensure imgpurge is included
import * as warn from "./slashCommands/warn";
import * as hackban from "./slashCommands/hackban";
import * as tempban from "./slashCommands/tempban";
import * as eightball from "./slashCommands/8ball";
import * as coinflip from "./slashCommands/coinflip";
import * as random from "./slashCommands/random";
import * as userinfo from "./slashCommands/userinfo";

import "../keepalive"; // Ensure this file exists

const intents = new IntentsBitField([
  IntentsBitField.Flags.Guilds,
  IntentsBitField.Flags.GuildMessages,
  IntentsBitField.Flags.GuildMembers,
  IntentsBitField.Flags.MessageContent,
  IntentsBitField.Flags.GuildBans,
  IntentsBitField.Flags.GuildModeration,
  IntentsBitField.Flags.GuildPresences,
]);

const slashCommands = new Collection<string, any>();
const commands = [
  ping,
  ban,
  kick,
  timeout,
  purge,
  imgpurge, // ✅ Ensure imgpurge is included
  warn,
  hackban,
  tempban,
  eightball,
  coinflip,
  random,
  userinfo,
];

export async function startBot() {
  const token = process.env.DISCORD_TOKEN;
  const clientId = process.env.CLIENT_ID;

  if (!token || !clientId) {
    throw new Error("DISCORD_TOKEN or CLIENT_ID not found in environment variables");
  }

  console.log("Starting Discord bot initialization...");
  console.log(`Token validation: length=${token.length}, starts with=${token.substring(0, 4)}...`);

  const client = new Client({ intents });

  // Register slash commands
  for (const module of commands) {
    slashCommands.set(module.command.name, module);
  }

  try {
    console.log("Attempting to log in to Discord...");
    await client.login(token);
    console.log("✅ Successfully logged in to Discord");

    // Deploy slash commands
    await deployCommands(
      commands.map((c) => c.command),
      token,
      clientId
    );

    // Load traditional commands
    console.log("Loading traditional commands...");
    await loadCommands();
    console.log("✅ Commands loaded successfully");

    client.once(Events.ClientReady, () => {
      console.log(`🎉 Logged in as ${client.user?.tag}`);
    });

    // Handle commands and autoresponses
    client.on(Events.MessageCreate, async (message) => {
      await handleAutoResponse(message);
      handleCommand(client, message);
    });

    // Handle member joins for raid protection
    client.on(Events.GuildMemberAdd, async (member) => {
      await handleMemberJoin(member);
    });

    // Handle slash commands
    client.on(Events.InteractionCreate, async (interaction) => {
      if (!interaction.isChatInputCommand()) return;

      const command = slashCommands.get(interaction.commandName);
      if (!command) {
        console.warn(`⚠️ Command ${interaction.commandName} not found.`);
        return;
      }

      try {
        await command.execute(interaction);
      } catch (error) {
        console.error("❌ Error executing command:", error);
        const errorMessage = {
          content: "⚠️ An error occurred while attempting to run this command. Please try again.",
          ephemeral: true,
        };
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp(errorMessage);
        } else {
          await interaction.reply(errorMessage);
        }
      }
    });

    return client;
  } catch (error) {
    console.error("❌ Error during bot initialization:", error);
    throw error;
  }
}
