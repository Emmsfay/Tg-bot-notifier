import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

export class Logger {
  private logToFile: boolean;
  private logDir?: string;

  constructor(logToFile = false, logDir?: string) {
    this.logToFile = logToFile;
    this.logDir = logDir;
  }

  debug(message: string, ...args: any[]) {
    this.log('DEBUG', message, args);
  }

  info(message: string, ...args: any[]) {
    this.log('INFO', message, args);
  }

  warn(message: string, ...args: any[]) {
    this.log('WARN', message, args);
  }

  error(message: string, ...args: any[]) {
    this.log('ERROR', message, args);
  }

  private log(level: LogLevel, message: string, args: any[]) {
    const timestamp = new Date().toISOString();
    const formattedMessage = `[${timestamp}] [${level}] ${message}`;

    console.log(formattedMessage, ...args);

    if (this.logToFile && this.logDir) {
      this.writeToFile(formattedMessage, args).catch((err) => {
        console.error('Failed to write to log file:', err);
      });
    }
  }

  private async writeToFile(message: string, args: any[]) {
    if (!this.logDir) return;

    try {
      if (!existsSync(this.logDir)) {
        await mkdir(this.logDir, { recursive: true });
      }

      const date = new Date().toISOString().split('T')[0];
      const logFile = join(this.logDir, `${date}.log`);

      const argsStr = args.length > 0 ? ' ' + JSON.stringify(args) : '';
      const logEntry = `${message}${argsStr}\n`;

      await writeFile(logFile, logEntry, { flag: 'a' });
    } catch (error) {
      // Silent fail to avoid infinite loop
    }
  }
}
