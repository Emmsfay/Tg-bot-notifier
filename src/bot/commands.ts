import { Bot, Context } from 'grammy';
import { FileStore } from '../storage/file-store.ts';
import { Logger } from '../utils/logger.ts';
import { MESSAGES } from './messages.ts';
import { getSystemStats } from '../utils/system-stats.ts';
import { PM2Service } from '../utils/pm2-service.ts';
import { config } from '../utils/config.ts';

export function setupCommands(bot: Bot, storage: FileStore, logger: Logger) {
  // Initialize PM2 service
  const pm2Service = new PM2Service(logger);

  bot.command('start', async (ctx: Context) => {
    try {
      await ctx.reply(MESSAGES.welcome);
      logger.info(`User ${ctx.chat?.id} started the bot`);
    } catch (error) {
      logger.error('Error in /start command:', error);
    }
  });

  bot.command('notify', async (ctx: Context) => {
    try {
      const chatId = ctx.chat?.id;
      if (!chatId) {
        logger.warn('/notify called without chat ID');
        return;
      }

      const added = await storage.addSubscriber(chatId);

      if (added) {
        await ctx.reply(MESSAGES.subscribed);
        logger.info(`New subscriber: ${chatId}`);
      } else {
        await ctx.reply(MESSAGES.alreadySubscribed);
        logger.debug(`Duplicate subscription attempt: ${chatId}`);
      }
    } catch (error) {
      logger.error('Error in /notify command:', error);
      await ctx.reply('Sorry, something went wrong. Please try again later.');
    }
  });

  bot.command('stop', async (ctx: Context) => {
    try {
      const chatId = ctx.chat?.id;
      if (!chatId) {
        logger.warn('/stop called without chat ID');
        return;
      }

      const removed = await storage.removeSubscriber(chatId);

      if (removed) {
        await ctx.reply(MESSAGES.unsubscribed);
        logger.info(`User unsubscribed: ${chatId}`);
      } else {
        await ctx.reply(MESSAGES.notSubscribed);
        logger.debug(`Unsubscribe attempt by non-subscriber: ${chatId}`);
      }
    } catch (error) {
      logger.error('Error in /stop command:', error);
      await ctx.reply('Sorry, something went wrong. Please try again later.');
    }
  });

  bot.command('status', async (ctx: Context) => {
    try {
      logger.info(`User ${ctx.chat?.id} requested status`);

      // Gather system statistics
      const systemStats = getSystemStats();
      const subscribers = await storage.getSubscribers();
      const isPM2 = pm2Service.isRunningUnderPM2();

      // Format and send status message
      const statusMessage = MESSAGES.status({
        memory: systemStats.memory,
        uptime: systemStats.uptime,
        subscribers: subscribers.length,
        pm2: isPM2,
      });

      await ctx.reply(statusMessage);
      logger.debug('Status command completed successfully');
    } catch (error) {
      logger.error('Error in /status command:', error);
      await ctx.reply('Sorry, failed to retrieve status. Please try again later.');
    }
  });

  bot.command('restart', async (ctx: Context) => {
    try {
      const chatId = ctx.chat?.id;
      logger.info(`User ${chatId} attempted restart command`);

      // Extract password from command arguments
      const messageText = ctx.message?.text || '';
      const args = messageText.split(' ').slice(1); // Remove '/restart'
      const providedPassword = args[0];

      // Validate password
      if (providedPassword !== config.RESTART_PASSWORD) {
        logger.warn(`Unauthorized restart attempt from user ${chatId}`);
        await ctx.reply(MESSAGES.restart.unauthorized);
        return;
      }

      // Check if running under PM2
      if (!pm2Service.isRunningUnderPM2()) {
        logger.warn('Restart attempted but not running under PM2');
        await ctx.reply(MESSAGES.restart.notPM2);
        return;
      }

      // Send confirmation before restart
      await ctx.reply(MESSAGES.restart.initiating);
      logger.info(`Authorized restart initiated by user ${chatId}`);

      // Delay restart to allow message to be sent
      setTimeout(async () => {
        const result = await pm2Service.restart();

        if (!result.success) {
          logger.error('PM2 restart failed:', result.error);
          // Note: This may not send if restart happens too quickly
          await ctx.reply(MESSAGES.restart.failed(result.error || 'Unknown error'));
        }
      }, 1000); // 1 second delay
    } catch (error) {
      logger.error('Error in /restart command:', error);
      await ctx.reply('Sorry, restart failed. Please check logs.');
    }
  });

  logger.info('Bot commands registered: /start, /notify, /stop, /status, /restart');
}
