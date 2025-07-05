import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { FibonacciModule } from './fibonacci/fibonacci.module';
import { mysql } from './config/mysql.config';
import { FibonacciCalculation } from './fibonacci/entities/fibonacci-calculation.entity';
import { User } from './users/entities/user.entity';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-store';
import { ConfigModule } from '@nestjs/config';
import { RedisModule } from './redis/redis.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3307'),
      username: process.env.DB_USERNAME || 'dbadmin',
      password: process.env.DB_PASSWORD || 'dbadmin1793',
      database: process.env.DB_NAME || 'fibonacci_db',
      entities: [FibonacciCalculation, User],
      synchronize: process.env.NODE_ENV !== 'production',
      logging: process.env.NODE_ENV === 'development',
    }),
    FibonacciModule,
    AuthModule,
    RedisModule,
    UsersModule,
    HealthModule,
  ],
})
export class AppModule {}
