# Pillsale Monitor Bot

A Telegram bot that monitors [pillsale.fun](https://www.pillsale.fun/) and notifies subscribers when the site goes live.

## Features

- 🤖 Telegram bot with multi-user subscription support
- 🔍 Checks the website every 5 minutes
- 📢 Notifies all subscribers when "Coming Soon" disappears
- 💾 Persistent storage using JSON files
- 🛡️ Robust error handling and automatic retry logic
- 📊 Comprehensive logging

## Prerequisites

- [Bun](https://bun.sh/) installed on your system
- A Telegram account
- pnpm (recommended) or npm

## Setup Instructions

### 1. Create a Telegram Bot

1. Open Telegram and search for [@BotFather](https://t.me/botfather)
2. Send `/newbot` command
3. Follow the prompts:
   - Choose a name for your bot (e.g., "Pillsale Monitor")
   - Choose a username (must end in 'bot', e.g., "pillsale_monitor_bot")
4. BotFather will provide a token that looks like: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`
5. Save this token - you'll need it in the next step

### 2. Install Dependencies

```bash
cd /Users/macbookpro/Documents/code/personal/pillsale
pnpm install
```

### 3. Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` and add your bot token:

```bash
TELEGRAM_BOT_TOKEN=your_bot_token_here
TARGET_URL=https://www.pillsale.fun/
MONITOR_TEXT=Coming Soon
CHECK_INTERVAL_MS=300000
DATA_DIR=./data
```

### 4. Run the Bot

**Development mode (with auto-reload):**
```bash
pnpm dev
```

**Production mode:**
```bash
pnpm start
```

You should see output like:
```
[2026-01-03T21:30:00.000Z] [INFO] Starting Pillsale Monitor Bot...
[2026-01-03T21:30:00.100Z] [INFO] Target URL: https://www.pillsale.fun/
[2026-01-03T21:30:00.150Z] [INFO] ✅ Bot started and listening for commands
[2026-01-03T21:30:00.200Z] [INFO] Scheduler started, checking every 300000ms
```

## Using the Bot

### User Commands

Once the bot is running, users can interact with it on Telegram:

- `/start` - See welcome message and instructions
- `/notify` - Subscribe to notifications
- `/stop` - Unsubscribe from notifications

### Example Interaction

```
User: /start
Bot: 🎉 Welcome to Pillsale Launch Monitor!

     I'll notify you the moment pillsale.fun goes live.

     Commands:
     /notify - Get notified when the site launches
     /stop - Stop receiving notifications

     The site is currently showing "Coming Soon" - I'm checking every 5 minutes!

User: /notify
Bot: ✅ You're subscribed! I'll notify you when pillsale.fun launches.
```

When the site goes live, all subscribers receive:

```
🚀 PILLSALE IS LIVE! 🚀

The site has launched! Check it out now:
https://www.pillsale.fun/

Good luck! 🎊
```

## Project Structure

```
pillsale/
├── src/
│   ├── index.ts              # Main application entry point
│   ├── bot/
│   │   ├── commands.ts       # Command handlers (/start, /notify, /stop)
│   │   └── messages.ts       # Message templates
│   ├── monitor/
│   │   ├── checker.ts        # Website status checking
│   │   └── scheduler.ts      # Periodic monitoring and notifications
│   ├── storage/
│   │   └── file-store.ts     # JSON file operations for subscribers
│   ├── utils/
│   │   ├── config.ts         # Environment variable validation
│   │   └── logger.ts         # Logging utility
│   └── types/
│       └── index.ts          # TypeScript type definitions
├── data/
│   └── subscribers.json      # Persisted subscriber data (auto-created)
├── .env                      # Your configuration (git-ignored)
├── .env.example              # Configuration template
├── package.json
├── tsconfig.json
└── README.md
```

## Configuration

All configuration is done via environment variables in the `.env` file:

| Variable | Description | Default |
|----------|-------------|---------|
| `TELEGRAM_BOT_TOKEN` | Your Telegram bot token from @BotFather | *Required* |
| `TARGET_URL` | Website to monitor | `https://www.pillsale.fun/` |
| `MONITOR_TEXT` | Text to check for (site is "coming soon" when present) | `Coming Soon` |
| `CHECK_INTERVAL_MS` | How often to check the website (in milliseconds) | `300000` (5 minutes) |
| `DATA_DIR` | Directory for storing subscriber data | `./data` |
| `LOG_TO_FILE` | Enable file logging | `false` |
| `LOG_DIR` | Directory for log files | `./logs` |

## How It Works

1. **Bot Startup**: Initializes storage, starts Telegram bot, begins monitoring
2. **User Subscription**: Users send `/notify` to subscribe; their chat ID is saved to `data/subscribers.json`
3. **Periodic Checks**: Every 5 minutes, the bot:
   - Fetches the website HTML
   - Checks if "Coming Soon" text is present
   - Updates the last checked timestamp
4. **Notification**: When "Coming Soon" disappears:
   - Sends notification to all subscribers
   - Marks as notified (prevents duplicate notifications)
   - Removes failed deliveries (blocked users)

## Data Storage

Subscriber data is stored in `data/subscribers.json`:

```json
{
  "subscribers": [123456789, 987654321],
  "metadata": {
    "lastModified": "2026-01-03T21:30:00.000Z",
    "totalSubscribers": 2
  },
  "state": {
    "isLive": false,
    "notificationSent": false,
    "lastChecked": "2026-01-03T21:25:00.000Z"
  }
}
```

The file is automatically backed up on each write to `subscribers.json.bak`.

## Error Handling

The bot handles various error scenarios gracefully:

- **Website Down**: Treats as "still coming soon", continues checking
- **Network Errors**: Logs warning and retries on next interval
- **Blocked Users**: Automatically removes from subscriber list
- **Telegram Rate Limits**: 50ms delay between messages
- **File Corruption**: Falls back to backup file

## Deployment

### Running on a Server

1. Install Bun on your server
2. Clone the repository
3. Set up `.env` with your bot token
4. Use a process manager like PM2:

```bash
pnpm add -g pm2
pm2 start "bun run src/index.ts" --name pillsale-bot
pm2 save
pm2 startup
```

### Using Docker (Optional)

Create a `Dockerfile`:

```dockerfile
FROM oven/bun:1
WORKDIR /app
COPY package.json bun.lockb ./
RUN bun install
COPY . .
CMD ["bun", "run", "src/index.ts"]
```

Build and run:

```bash
docker build -t pillsale-bot .
docker run -d --env-file .env --name pillsale-bot pillsale-bot
```

## Development

```bash
# Install dependencies
pnpm install

# Run in development mode with auto-reload
pnpm dev

# Type check
pnpm run type-check

# Build for production
pnpm build
```

## Troubleshooting

### Bot doesn't respond to commands

- Verify `TELEGRAM_BOT_TOKEN` is correct in `.env`
- Check that the bot is running (no errors in console)
- Make sure you're using the correct bot username

### Website checks aren't working

- Verify `TARGET_URL` is accessible
- Check the logs for error messages
- Test the URL manually in a browser

### Notifications not sent

- Check `data/subscribers.json` has subscribers
- Verify `state.notificationSent` is `false`
- Check logs for error messages

### How to reset after testing

Edit `data/subscribers.json` and set:
```json
{
  "state": {
    "isLive": false,
    "notificationSent": false,
    "lastChecked": "2026-01-03T21:25:00.000Z"
  }
}
```

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.
