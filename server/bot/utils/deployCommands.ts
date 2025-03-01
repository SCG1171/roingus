import { REST, Routes } from "discord.js";

export async function deployCommands(commands: any[], token: string, clientId: string) {
  const rest = new REST().setToken(token);

  try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(
      Routes.applicationCommands(clientId),
      { body: commands.map(cmd => cmd.toJSON()) },
    );

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error('Error deploying commands:', error);
    throw error; // Re-throw to handle in the calling function
  }
}