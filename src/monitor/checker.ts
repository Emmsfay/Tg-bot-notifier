import { parse } from 'node-html-parser';
import { Logger } from '../utils/logger.ts';
import type { CheckResult } from '../types/index.ts';

export class WebsiteChecker {
  private url: string;
  private monitorText: string;
  private logger: Logger;

  constructor(url: string, monitorText: string, logger: Logger) {
    this.url = url;
    this.monitorText = monitorText;
    this.logger = logger;
  }

  async checkStatus(): Promise<CheckResult> {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(this.url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; PillsaleBot/1.0)',
        },
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const error = `HTTP ${response.status}`;
        this.logger.warn(`Website check failed: ${error}`);
        return { isComingSoon: true, error };
      }

      const html = await response.text();
      const root = parse(html);

      const textContent = root.textContent;
      const isComingSoon = textContent.includes(this.monitorText);

      return { isComingSoon };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.warn(`Website check error: ${errorMessage}`);
      return {
        isComingSoon: true,
        error: errorMessage,
      };
    }
  }
}
