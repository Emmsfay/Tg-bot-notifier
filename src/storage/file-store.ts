import { readFile, writeFile, mkdir, rename, copyFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { z } from 'zod';
import type { SubscriberData, StateData } from '../types/index.ts';

const subscriberDataSchema = z.object({
  subscribers: z.array(z.number()),
  metadata: z.object({
    lastModified: z.string(),
    totalSubscribers: z.number(),
  }),
  state: z.object({
    isLive: z.boolean(),
    notificationSent: z.boolean(),
    lastChecked: z.string(),
  }),
});

export class FileStore {
  private filePath: string;
  private backupPath: string;
  private cache: SubscriberData | null = null;

  constructor(dataDir: string) {
    this.filePath = join(dataDir, 'subscribers.json');
    this.backupPath = join(dataDir, 'subscribers.json.bak');
  }

  async initialize(): Promise<void> {
    const dataDir = join(this.filePath, '..');

    if (!existsSync(dataDir)) {
      await mkdir(dataDir, { recursive: true });
    }

    if (!existsSync(this.filePath)) {
      const defaultData: SubscriberData = {
        subscribers: [],
        metadata: {
          lastModified: new Date().toISOString(),
          totalSubscribers: 0,
        },
        state: {
          isLive: false,
          notificationSent: false,
          lastChecked: new Date().toISOString(),
        },
      };

      await this.write(defaultData);
    }

    await this.read();
  }

  async read(): Promise<SubscriberData> {
    if (this.cache) {
      return this.cache;
    }

    try {
      const content = await readFile(this.filePath, 'utf-8');
      const data = JSON.parse(content);
      const validated = subscriberDataSchema.parse(data);
      this.cache = validated;
      return validated;
    } catch (error) {
      if (existsSync(this.backupPath)) {
        try {
          const backupContent = await readFile(this.backupPath, 'utf-8');
          const backupData = JSON.parse(backupContent);
          const validated = subscriberDataSchema.parse(backupData);
          this.cache = validated;
          await this.write(validated);
          return validated;
        } catch (backupError) {
          throw new Error('Both primary and backup files are corrupted');
        }
      }
      throw error;
    }
  }

  async write(data: SubscriberData): Promise<void> {
    const tempPath = `${this.filePath}.tmp`;

    data.metadata.lastModified = new Date().toISOString();
    data.metadata.totalSubscribers = data.subscribers.length;

    const content = JSON.stringify(data, null, 2);

    await writeFile(tempPath, content, 'utf-8');

    if (existsSync(this.filePath)) {
      await copyFile(this.filePath, this.backupPath);
    }

    await rename(tempPath, this.filePath);

    this.cache = data;
  }

  async addSubscriber(chatId: number): Promise<boolean> {
    const data = await this.read();

    if (data.subscribers.includes(chatId)) {
      return false;
    }

    data.subscribers.push(chatId);
    await this.write(data);

    return true;
  }

  async removeSubscriber(chatId: number): Promise<boolean> {
    const data = await this.read();

    const initialLength = data.subscribers.length;
    data.subscribers = data.subscribers.filter((id) => id !== chatId);

    if (data.subscribers.length === initialLength) {
      return false;
    }

    await this.write(data);
    return true;
  }

  async getSubscribers(): Promise<number[]> {
    const data = await this.read();
    return [...data.subscribers];
  }

  async getState(): Promise<StateData> {
    const data = await this.read();
    return { ...data.state };
  }

  async updateState(partialState: Partial<StateData>): Promise<void> {
    const data = await this.read();
    data.state = { ...data.state, ...partialState };
    await this.write(data);
  }
}
