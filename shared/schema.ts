import { z } from "zod";

export interface Warning {
  userId: string;
  guildId: string;
  reason: string;
  moderatorId: string;
  timestamp: number;
}

export const warningSchema = z.object({
  userId: z.string(),
  guildId: z.string(),
  reason: z.string(),
  moderatorId: z.string(),
  timestamp: z.number()
});

export interface CommandCooldown {
  userId: string;
  command: string;
  timestamp: number;
}

export const cooldownSchema = z.object({
  userId: z.string(),
  command: z.string(),
  timestamp: z.number()
});
