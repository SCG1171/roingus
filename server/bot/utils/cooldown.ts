import { storage } from "../../storage";

export async function checkCooldown(
  userId: string,
  command: string,
  cooldownSeconds: number
): Promise<boolean> {
  const cooldown = await storage.getCooldown(userId, command);
  const now = Date.now();

  if (cooldown && now - cooldown.timestamp < cooldownSeconds * 1000) {
    return true;
  }

  await storage.setCooldown({
    userId,
    command,
    timestamp: now
  });

  return false;
}
