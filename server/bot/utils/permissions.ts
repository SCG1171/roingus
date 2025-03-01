import { Message, PermissionsBitField } from "discord.js";

export async function checkPermissions(message: Message, permissions: bigint[]) {
  if (!message.member) return false;

  const missingPermissions = permissions.filter(
    permission => !message.member?.permissions.has(permission)
  );

  if (missingPermissions.length) {
    const permissionNames = missingPermissions.map(
      p => Object.keys(PermissionsBitField.Flags).find(
        k => PermissionsBitField.Flags[k as keyof typeof PermissionsBitField.Flags] === p
      )
    );
    
    await message.reply(
      `You're missing the following permissions: ${permissionNames.join(", ")}`
    );
    return false;
  }

  return true;
}
