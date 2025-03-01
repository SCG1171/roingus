import { Warning, CommandCooldown } from "@shared/schema";

export interface IStorage {
  getWarnings(userId: string, guildId: string): Promise<Warning[]>;
  addWarning(warning: Warning): Promise<void>;
  getCooldown(userId: string, command: string): Promise<CommandCooldown | undefined>;
  setCooldown(cooldown: CommandCooldown): Promise<void>;
}

export class MemStorage implements IStorage {
  private warnings: Warning[] = [];
  private cooldowns: CommandCooldown[] = [];

  async getWarnings(userId: string, guildId: string): Promise<Warning[]> {
    return this.warnings.filter(w => w.userId === userId && w.guildId === guildId);
  }

  async addWarning(warning: Warning): Promise<void> {
    this.warnings.push(warning);
  }

  async getCooldown(userId: string, command: string): Promise<CommandCooldown | undefined> {
    return this.cooldowns.find(c => c.userId === userId && c.command === command);
  }

  async setCooldown(cooldown: CommandCooldown): Promise<void> {
    const index = this.cooldowns.findIndex(
      c => c.userId === cooldown.userId && c.command === cooldown.command
    );
    if (index !== -1) {
      this.cooldowns[index] = cooldown;
    } else {
      this.cooldowns.push(cooldown);
    }
  }
}

export const storage = new MemStorage();
