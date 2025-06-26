// src/redis/redis.service.ts - เพิ่ม debug logs
import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private client: RedisClientType;
  private readonly logger = new Logger(RedisService.name);
  private isConnected = false;

  constructor(private configService: ConfigService) {
    const redisUrl = this.configService.get(
      'REDIS_URL',
      'redis://localhost:6379',
    );
    this.logger.log(`Connecting to Redis: ${redisUrl}`);

    this.client = createClient({
      url: redisUrl,
    });

    this.client.on('error', (err) => {
      this.logger.error('Redis Client Error:', err);
      this.isConnected = false;
    });

    this.client.on('connect', () => {
      this.logger.log('Redis Client Connected');
      this.isConnected = true;
    });

    this.client.on('ready', () => {
      this.logger.log('Redis Client Ready');
      this.isConnected = true;
    });

    this.client.on('end', () => {
      this.logger.warn('Redis Client Disconnected');
      this.isConnected = false;
    });

    this.client.connect().catch((err) => {
      this.logger.error('Failed to connect to Redis:', err);
      this.isConnected = false;
    });
  }

  async onModuleDestroy() {
    if (this.isConnected) {
      await this.client.quit();
    }
  }

  async get(key: string): Promise<string | null> {
    if (!this.isConnected) {
      this.logger.warn('Redis not connected, skipping GET operation');
      return null;
    }

    try {
      const result = await this.client.get(key);
      this.logger.debug(`Redis GET ${key}: ${result ? 'HIT' : 'MISS'}`);
      return result;
    } catch (error) {
      this.logger.error('Redis GET error:', error);
      return null;
    }
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (!this.isConnected) {
      this.logger.warn('Redis not connected, skipping SET operation');
      return;
    }

    try {
      if (ttl) {
        await this.client.setEx(key, ttl, value);
      } else {
        await this.client.set(key, value);
      }
      this.logger.debug(`Redis SET ${key}: SUCCESS (TTL: ${ttl || 'none'})`);
    } catch (error) {
      this.logger.error('Redis SET error:', error);
    }
  }

  async del(key: string): Promise<void> {
    if (!this.isConnected) {
      this.logger.warn('Redis not connected, skipping DEL operation');
      return;
    }

    try {
      await this.client.del(key);
      this.logger.debug(`Redis DEL ${key}: SUCCESS`);
    } catch (error) {
      this.logger.error('Redis DEL error:', error);
    }
  }

  async exists(key: string): Promise<boolean> {
    if (!this.isConnected) {
      this.logger.warn('Redis not connected, skipping EXISTS operation');
      return false;
    }

    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      this.logger.error('Redis EXISTS error:', error);
      return false;
    }
  }

  // เพิ่ม method สำหรับ health check
  async ping(): Promise<boolean> {
    if (!this.isConnected) {
      return false;
    }

    try {
      const result = await this.client.ping();
      return result === 'PONG';
    } catch (error) {
      this.logger.error('Redis PING error:', error);
      return false;
    }
  }

  // เพิ่ม method สำหรับดู connection status
  getConnectionStatus(): { connected: boolean; url: string } {
    return {
      connected: this.isConnected,
      url: this.configService.get('REDIS_URL', 'redis://localhost:6379'),
    };
  }

  async hSet(key: string, field: string, value: string): Promise<void> {
    if (!this.isConnected) {
      this.logger.warn('Redis not connected, skipping HSET operation');
      return;
    }

    try {
      await this.client.hSet(key, field, value);
    } catch (error) {
      this.logger.error('Redis HSET error:', error);
    }
  }

  async hGet(key: string, field: string): Promise<string | null> {
    if (!this.isConnected) {
      this.logger.warn('Redis not connected, skipping HGET operation');
      return null;
    }

    try {
      const result = await this.client.hGet(key, field);
      return result === undefined ? null : result;
    } catch (error) {
      this.logger.error('Redis HGET error:', error);
      return null;
    }
  }

  async hGetAll(key: string): Promise<Record<string, string>> {
    if (!this.isConnected) {
      this.logger.warn('Redis not connected, skipping HGETALL operation');
      return {};
    }

    try {
      return await this.client.hGetAll(key);
    } catch (error) {
      this.logger.error('Redis HGETALL error:', error);
      return {};
    }
  }
}
