module.exports = {
  apps: [
    {
      name: 'pillsale-bot',
      script: 'src/index.ts',
      interpreter: 'bun',
      interpreter_args: 'run',
      instances: 1,
      exec_mode: 'fork',

      // Auto-restart configuration
      autorestart: true,
      watch: false,
      max_restarts: 10,
      min_uptime: '10s',
      restart_delay: 4000,

      // Memory management
      max_memory_restart: '500M',

      // Logging
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_file: './logs/pm2-combined.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,

      // Environment variables
      env: { NODE_ENV: 'production' },

      // Advanced PM2 features
      kill_timeout: 5000,
      listen_timeout: 3000,
      shutdown_with_message: true,
    },
  ],
};
