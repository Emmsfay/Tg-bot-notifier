import { Bot } from 'grammy';
import { config } from './utils/config.ts';
import { Logger } from './utils/logger.ts';
import { FileStore } from './storage/file-store.ts';
import { setupCommands } from './bot/commands.ts';
import { WebsiteChecker } from './monitor/checker.ts';
import { MonitorScheduler } from './monitor/scheduler.ts';

async function main() {
  const logger = new Logger(config.LOG_TO_FILE, config.LOG_DIR);

  logger.info('Starting Pillsale Monitor Bot...');
  logger.info(`Target URL: ${config.TARGET_URL}`);
  logger.info(`Check interval: ${config.CHECK_INTERVAL_MS}ms`);

  // Log PM2 status
  const isPM2 = !!process.env.PM2_HOME || !!process.env.pm_id;
  logger.info(`Process Manager: ${isPM2 ? 'PM2' : 'Direct'}`);
  if (isPM2) {
    logger.info(`PM2 Instance ID: ${process.env.pm_id || 'unknown'}`);
  }

  const storage = new FileStore(config.DATA_DIR);
  await storage.initialize();
  logger.info('Storage initialized');

  const bot = new Bot(config.TELEGRAM_BOT_TOKEN);

  setupCommands(bot, storage, logger);

  const checker = new WebsiteChecker(
    config.TARGET_URL,
    config.MONITOR_TEXT,
    logger
  );
  const scheduler = new MonitorScheduler(checker, storage, bot, logger);

  bot.start({
    onStart: () => {
      logger.info('✅ Bot started and listening for commands');
    },
  });

  scheduler.start(config.CHECK_INTERVAL_MS);

  const shutdown = async () => {
    logger.info('Shutting down...');
    scheduler.stop();
    await bot.stop();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
