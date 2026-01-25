import pm2 from 'pm2';
import { Logger } from './logger.ts';

export interface PM2RestartResult {
  success: boolean;
  error?: string;
}

export class PM2Service {
  private logger: Logger;
  private appName = 'pillsale-bot';

  constructor(logger: Logger) {
    this.logger = logger;
  }

  /**
   * Check if the current process is running under PM2
   */
  isRunningUnderPM2(): boolean {
    return !!process.env.PM2_HOME || !!process.env.pm_id;
  }

  /**
   * Restart the current PM2 process
   */
  async restart(): Promise<PM2RestartResult> {
    return new Promise((resolve) => {
      if (!this.isRunningUnderPM2()) {
        this.logger.warn('Restart command called but not running under PM2');
        resolve({
          success: false,
          error: 'Application is not running under PM2',
        });
        return;
      }

      pm2.connect((err) => {
        if (err) {
          this.logger.error('PM2 connection error:', err);
          resolve({
            success: false,
            error: `Failed to connect to PM2: ${err.message}`,
          });
          return;
        }

        this.logger.info(`Restarting PM2 process: ${this.appName}`);

        pm2.restart(this.appName, (restartErr) => {
          pm2.disconnect();

          if (restartErr) {
            this.logger.error('PM2 restart error:', restartErr);
            resolve({
              success: false,
              error: `Failed to restart: ${restartErr.message}`,
            });
            return;
          }

          this.logger.info('PM2 restart initiated successfully');
          resolve({ success: true });
        });
      });
    });
  }
}
