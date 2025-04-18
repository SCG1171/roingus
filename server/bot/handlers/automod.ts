import { GuildMember, Collection, Guild, GuildVerificationLevel } from "discord.js";

interface JoinTracker {
  count: number;
  members: string[];
  firstJoin: number;
}

// Track joins per guild
const joinTracking = new Collection<string, JoinTracker>();

// Constants for rate limiting
const JOIN_THRESHOLD = 5; // Number of joins
const JOIN_WINDOW = 20000; // 20 seconds

// Check for raid attempts
export async function handleMemberJoin(member: GuildMember): Promise<boolean> {
  const guild = member.guild;
  const currentTime = Date.now();

  // Get or create guild's join tracker
  let tracker = joinTracking.get(guild.id);
  if (!tracker) {
    tracker = { count: 0, members: [], firstJoin: currentTime };
    joinTracking.set(guild.id, tracker);
  }

  // Reset tracker if time window has passed
  if (currentTime - tracker.firstJoin > JOIN_WINDOW) {
    tracker.count = 0;
    tracker.members = [];
    tracker.firstJoin = currentTime;
  }

  tracker.count++;
  tracker.members.push(member.id);

  // Check if join rate indicates a raid
  if (tracker.count >= JOIN_THRESHOLD) {
    try {
      // Enable server verification level using correct enum
      await guild.setVerificationLevel(GuildVerificationLevel.High);

      // Timeout all recent joins
      for (const memberId of tracker.members) {
        const raidMember = await guild.members.fetch(memberId);
        await raidMember.timeout(300000, 'Automatic timeout: Potential raid detected');
      }

      // Alert admins in the system channel (if available)
      const systemChannel = guild.systemChannel;
      if (systemChannel && systemChannel.isTextBased()) {
        await systemChannel.send({
          content: '# 🚨 **WARNING: POTENTIAL RAID DETECTED!**\n' +
            `${tracker.count} members joined in the last ${JOIN_WINDOW / 1000} seconds.\n` +
            '**I\'m running security actions to prevent these slanks from raiding your server.**\n' +
            'Increasing server verification level to High...\n' +
            `Timing out ${tracker.count} recent joins...\n` +
            '**Please review these actions and adjust as needed. Thank you so much for using roingus!**'
        });
      }
      return true;
    } catch (error) {
      console.error('Error handling potential raid. Please ban new members manually. Error traceback:', error);
    }
  }

  return false;
}

// Cleanup old tracking data periodically
setInterval(() => {
  const currentTime = Date.now();
  joinTracking.sweep((tracker) => currentTime - tracker.firstJoin > JOIN_WINDOW);
}, JOIN_WINDOW);
