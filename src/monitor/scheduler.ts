import { Bot } from 'grammy';
import { WebsiteChecker } from './checker.ts';
import { FileStore } from '../storage/file-store.ts';
import { Logger } from '../utils/logger.ts';
import { MESSAGES } from '../bot/messages.ts';
import { config } from '../utils/config.ts';

const DELAY_BETWEEN_SENDS = 50;

export class MonitorScheduler {
  private intervalId: Timer | null = null;
  private checker: WebsiteChecker;
  private storage: FileStore;
  private bot: Bot;
  private logger: Logger;

  constructor(
    checker: WebsiteChecker,
    storage: FileStore,
    bot: Bot,
    logger: Logger
  ) {
    this.checker = checker;
    this.storage = storage;
    this.bot = bot;
    this.logger = logger;
  }

  start(intervalMs: number) {
    this.intervalId = setInterval(async () => {
      await this.checkAndNotify();
    }, intervalMs);

    this.checkAndNotify();

    this.logger.info(`Scheduler started, checking every ${intervalMs}ms`);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      this.logger.info('Scheduler stopped');
    }
  }

  private async checkAndNotify() {
    try {
      const state = await this.storage.getState();

      if (state.notificationSent) {
        this.logger.debug('Already notified, skipping check');
        return;
      }

      const { isComingSoon, error } = await this.checker.checkStatus();

      await this.storage.updateState({
        lastChecked: new Date().toISOString(),
      });

      if (error) {
        this.logger.warn(`Check failed: ${error}`);
        return;
      }

      if (!isComingSoon) {
        await this.notifyAllSubscribers();
        await this.storage.updateState({
          isLive: true,
          notificationSent: true,
        });
        this.logger.info('🚀 SITE IS LIVE! Notifications sent.');
      } else {
        this.logger.debug('Still coming soon');
      }
    } catch (error) {
      this.logger.error('Scheduler error:', error);
    }
  }

  private async notifyAllSubscribers() {
    const subscribers = await this.storage.getSubscribers();
    const failedChatIds: number[] = [];

    this.logger.info(`Notifying ${subscribers.length} subscribers`);

    for (const chatId of subscribers) {
      try {
        await this.bot.api.sendMessage(chatId, MESSAGES.siteLive(config.TARGET_URL));
        await new Promise((resolve) => setTimeout(resolve, DELAY_BETWEEN_SENDS));
      } catch (error: any) {
        const errorMessage = error?.message || 'Unknown error';
        this.logger.warn(`Failed to notify ${chatId}: ${errorMessage}`);
        failedChatIds.push(chatId);
      }
    }

    for (const chatId of failedChatIds) {
      await this.storage.removeSubscriber(chatId);
    }

    if (failedChatIds.length > 0) {
      this.logger.info(`Removed ${failedChatIds.length} failed subscribers`);
    }
  }
}
