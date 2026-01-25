import { z } from 'zod';
import type { Config } from '../types/index.ts';

const envSchema = z.object({
  TELEGRAM_BOT_TOKEN: z.string().min(1, 'TELEGRAM_BOT_TOKEN is required'),
  TARGET_URL: z.string().url().default('https://www.pillsale.fun/'),
  CHECK_INTERVAL_MS: z.coerce.number().default(300000),
  MONITOR_TEXT: z.string().default('Coming Soon'),
  DATA_DIR: z.string().default('./data'),
  LOG_TO_FILE: z.coerce.boolean().default(false),
  LOG_DIR: z.string().default('./logs'),
  RESTART_PASSWORD: z.string().min(1, 'RESTART_PASSWORD is required'),
});

export const config: Config = envSchema.parse(process.env);
