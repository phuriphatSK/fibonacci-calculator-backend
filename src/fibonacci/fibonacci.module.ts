import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FibonacciService } from './fibonacci.service';
import { FibonacciController } from './fibonacci.controller';
import { FibonacciCalculation } from './entities/fibonacci-calculation.entity';
import { RedisModule } from 'src/redis/redis.module';

@Module({
  imports: [TypeOrmModule.forFeature([FibonacciCalculation]), RedisModule],

  controllers: [FibonacciController],
  providers: [FibonacciService],
})
export class FibonacciModule {}
