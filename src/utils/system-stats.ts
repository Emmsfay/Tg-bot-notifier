import { memoryUsage, cpuUsage, uptime } from 'process';

export interface SystemStats {
  memory: {
    heapUsed: number;
    heapTotal: number;
    rss: number;
    external: number;
    heapUsedMB: string;
    heapTotalMB: string;
    rssMB: string;
  };
  cpu: {
    user: number;
    system: number;
  };
  uptime: {
    seconds: number;
    formatted: string;
  };
}

/**
 * Get current process memory usage statistics
 */
export function getMemoryStats() {
  const mem = memoryUsage();

  return {
    heapUsed: mem.heapUsed,
    heapTotal: mem.heapTotal,
    rss: mem.rss,
    external: mem.external,
    heapUsedMB: (mem.heapUsed / 1024 / 1024).toFixed(2),
    heapTotalMB: (mem.heapTotal / 1024 / 1024).toFixed(2),
    rssMB: (mem.rss / 1024 / 1024).toFixed(2),
  };
}

/**
 * Get current process CPU usage statistics
 */
export function getCpuStats() {
  const cpu = cpuUsage();

  return {
    user: cpu.user,
    system: cpu.system,
  };
}

/**
 * Get process uptime formatted as human-readable string
 */
export function getUptimeStats() {
  const seconds = uptime();
  const formatted = formatUptime(seconds);

  return {
    seconds,
    formatted,
  };
}

/**
 * Get all system statistics
 */
export function getSystemStats(): SystemStats {
  return {
    memory: getMemoryStats(),
    cpu: getCpuStats(),
    uptime: getUptimeStats(),
  };
}

/**
 * Format seconds into human-readable uptime string
 */
function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const parts: string[] = [];

  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

  return parts.join(' ');
}
