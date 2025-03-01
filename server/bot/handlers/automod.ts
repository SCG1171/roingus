import { GuildMember, Collection, Guild } from "discord.js";

interface JoinTracker {
  count: number;
  members: string[];
  firstJoin: number;
}

// Track joins per guild
const joinTracking = new Collection<string, JoinTracker>();

// Constants for rate limiting
const JOIN_THRESHOLD = 10; // Number of joins
const JOIN_WINDOW = 30000; // 30 seconds

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
      // Enable server verification level
      await guild.setVerificationLevel('HIGH');

      // Timeout all recent joins
      for (const memberId of tracker.members) {
        const raidMember = await guild.members.fetch(memberId);
        await raidMember.timeout(300000, 'Automatic timeout: Potential raid detected');
      }

      // Alert admins
      const systemChannel = guild.systemChannel;
      if (systemChannel) {
        await systemChannel.send({
          content: '🚨 **POTENTIAL RAID DETECTED**\n' +
            `${tracker.count} members joined in the last ${JOIN_WINDOW/1000} seconds.\n` +
            'Auto-moderation has:\n' +
            '- Increased server verification level\n' +
            `- Timed out ${tracker.count} recent joins\n` +
            'Please review these actions and adjust as needed.'
        });
      }
      return true;
    } catch (error) {
      console.error('Error handling potential raid:', error);
    }
  }

  return false;
}

// Cleanup old tracking data periodically
setInterval(() => {
  const currentTime = Date.now();
  joinTracking.sweep((tracker) => currentTime - tracker.firstJoin > JOIN_WINDOW);
}, JOIN_WINDOW);