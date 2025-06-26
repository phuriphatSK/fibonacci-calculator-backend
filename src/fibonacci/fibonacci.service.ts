import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FibonacciCalculation } from './entities/fibonacci-calculation.entity';
import { RedisService } from '../redis/redis.service';
import { User } from '../users/entities/user.entity';

@Injectable()
export class FibonacciService {
  constructor(
    @InjectRepository(FibonacciCalculation)
    private fibonacciRepository: Repository<FibonacciCalculation>,
    private redisService: RedisService,
  ) {}

  async calculateFibonacci(
    index: number,
    user: User,
  ): Promise<{ index: number; result: string; fromCache: boolean }> {
    if (index < 0 || index > 1000) {
      throw new BadRequestException('Index must be between 0 and 1000');
    }

    const cacheKey = `fib:${index}`;
    const cachedResult = await this.redisService.get(cacheKey);

    let result: string;
    let fromCache = false;

    if (cachedResult) {
      result = cachedResult;
      fromCache = true;
    } else {
      result = this.calculateFibonacciValue(index);

      // Cache the result in Redis (TTL: 1 hour)
      await this.redisService.set(cacheKey, result, 3600);
    }

    // Save to database for user history
    try {
      const calculation = this.fibonacciRepository.create({
        userId: user.id,
        index,
        result,
      });
      await this.fibonacciRepository.save(calculation);
    } catch (error) {
      console.log(
        `Duplicate calculation ignored for user ${user.id}, index ${index}`,
      );
    }

    return { index, result, fromCache };
  }

  async getUserCalculations(
    userId: number,
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    calculations: FibonacciCalculation[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;

    const [calculations, total] = await this.fibonacciRepository.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      calculations,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  private calculateFibonacciValue(n: number): string {
    if (n <= 1) return n.toString();

    let a = 0n;
    let b = 1n;

    for (let i = 2; i <= n; i++) {
      const temp = a + b;
      a = b;
      b = temp;
    }

    return b.toString();
  }

  async getCalculationStats(userId: number): Promise<{
    totalCalculations: number;
    uniqueIndices: number;
    lastCalculation: Date | null;
  }> {
    const calculations = await this.fibonacciRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });

    const uniqueIndices = new Set(calculations.map((calc) => calc.index)).size;

    return {
      totalCalculations: calculations.length,
      uniqueIndices,
      lastCalculation: calculations.length ? calculations[0].createdAt : null,
    };
  }
}
