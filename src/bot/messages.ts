import { config } from '../utils/config.ts';

export const MESSAGES = {
  welcome: `
🎉 Welcome to Pillsale Launch Monitor!

I'll notify you the moment pillsale.fun goes live.

Commands:
/notify - Get notified when the site launches
/stop - Stop receiving notifications
/status - View bot health and statistics

The site is currently showing "Coming Soon" - I'm checking every 5 minutes!
  `.trim(),

  subscribed: "✅ You're subscribed! I'll notify you when pillsale.fun launches.",

  alreadySubscribed: "👍 You're already subscribed!",

  unsubscribed: "👋 You've been unsubscribed. Use /notify to subscribe again.",

  notSubscribed: "❓ You weren't subscribed. Use /notify to get notified!",

  siteLive: (url: string) => `
🚀 PILLSALE IS LIVE! 🚀

The site has launched! Check it out now:
${url}

Good luck! 🎊
  `.trim(),

  status: (stats: {
    memory: { heapUsedMB: string; heapTotalMB: string; rssMB: string };
    uptime: { formatted: string };
    subscribers: number;
    pm2: boolean;
  }) => `
📊 Bot Status

🧠 Memory Usage:
  • Heap: ${stats.memory.heapUsedMB} MB / ${stats.memory.heapTotalMB} MB
  • RSS: ${stats.memory.rssMB} MB

⏱ Uptime: ${stats.uptime.formatted}

👥 Subscribers: ${stats.subscribers}

⚙️ Process Manager: ${stats.pm2 ? 'PM2' : 'Direct'}
  `.trim(),

  restart: {
    unauthorized: '⛔ Unauthorized. This command requires admin access.',
    notPM2: '❌ Restart failed: Application is not running under PM2.',
    initiating: '🔄 Initiating restart... The bot will be back shortly!',
    failed: (error: string) => `❌ Restart failed: ${error}`,
  },
};
