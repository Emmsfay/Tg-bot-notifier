export interface SubscriberData {
  subscribers: number[];
  metadata: {
    lastModified: string;
    totalSubscribers: number;
  };
  state: StateData;
}

export interface StateData {
  isLive: boolean;
  notificationSent: boolean;
  lastChecked: string;
}

export interface CheckResult {
  isComingSoon: boolean;
  error?: string;
}

export interface Config {
  TELEGRAM_BOT_TOKEN: string;
  TARGET_URL: string;
  CHECK_INTERVAL_MS: number;
  MONITOR_TEXT: string;
  DATA_DIR: string;
  LOG_TO_FILE: boolean;
  LOG_DIR: string;
  RESTART_PASSWORD: string;
}
