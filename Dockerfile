FROM oven/bun:1

WORKDIR /app

# Only copy package.json (or package-lock.json if npm)
COPY package.json ./

# Install dependencies
RUN bun install --production

# Copy source code
COPY src ./src
COPY tsconfig.json ./

# Run the bot
CMD ["bun", "run", "start"]
