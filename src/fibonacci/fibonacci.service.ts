import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FibonacciCalculation } from './entities/fibonacci-calculation.entity';
import { RedisService } from '../redis/redis.service';
import { User } from '../users/entities/user.entity';
import { IPaginatedResult } from '../common/interfaces/pagination.interface';

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

    // Check Redis cache first
    const cacheKey = `fib:${index}`;
    const cachedResult = await this.redisService.get(cacheKey);

    let result: string;
    let fromCache = false;

    if (cachedResult) {
      result = cachedResult;
      fromCache = true;
    } else {
      // Calculate fibonacci
      result = this.calculateFibonacciValue(index);

      // Cache the result in Redis (no TTL = permanent cache)
      await this.redisService.set(cacheKey, result);
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
      // If duplicate, ignore the error (user already calculated this index)
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
    limit: number;
    totalPages: number;
  }> {
    // Validate pagination parameters
    if (page < 1) page = 1;
    if (limit < 1) limit = 10;
    if (limit > 100) limit = 100; // Max limit for performance

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
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getAllUserCalculations(
    userId: number,
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    calculations: FibonacciCalculation[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    // Validate pagination parameters
    if (page < 1) page = 1;
    if (limit < 1) limit = 10;
    if (limit > 100) limit = 100;

    const skip = (page - 1) * limit;

    const [calculations, total] = await this.fibonacciRepository.findAndCount({
      where: { userId },
      order: { index: 'ASC' }, // Order by fibonacci index
      skip,
      take: limit,
    });

    return {
      calculations,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  private calculateFibonacciValue(n: number): string {
    if (n <= 1) return n.toString();

    // Use BigInt for large numbers
    let a = 0n;
    let b = 1n;

    for (let i = 2; i <= n; i++) {
      const temp = a + b;
      a = b;
      b = temp;
    }

    return b.toString();
  }

  // Method for getting calculation statistics
  async getCalculationStats(userId: number): Promise<{
    totalCalculations: number;
    uniqueIndices: number;
    lastCalculation: Date | null;
    averageCalculationTime?: number;
    mostCalculatedIndex?: number;
  }> {
    const calculations = await this.fibonacciRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });

    const uniqueIndices = new Set(calculations.map((calc) => calc.index)).size;

    // Find most calculated index
    const indexCount = calculations.reduce(
      (acc, calc) => {
        acc[calc.index] = (acc[calc.index] || 0) + 1;
        return acc;
      },
      {} as Record<number, number>,
    );

    const mostCalculatedIndex =
      Object.keys(indexCount).length > 0
        ? parseInt(
            Object.keys(indexCount).reduce((a, b) =>
              indexCount[parseInt(a)] > indexCount[parseInt(b)] ? a : b,
            ),
          )
        : undefined;

    return {
      totalCalculations: calculations.length,
      uniqueIndices,
      lastCalculation: calculations.length ? calculations[0].createdAt : null,
      mostCalculatedIndex,
    };
  }

  // Search calculations by index range
  async searchCalculationsByRange(
    userId: number,
    minIndex: number,
    maxIndex: number,
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    calculations: FibonacciCalculation[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    if (page < 1) page = 1;
    if (limit < 1) limit = 10;
    if (limit > 100) limit = 100;

    const skip = (page - 1) * limit;

    const queryBuilder = this.fibonacciRepository
      .createQueryBuilder('calc')
      .where('calc.userId = :userId', { userId })
      .andWhere('calc.index >= :minIndex', { minIndex })
      .andWhere('calc.index <= :maxIndex', { maxIndex })
      .orderBy('calc.index', 'ASC')
      .skip(skip)
      .take(limit);

    const [calculations, total] = await queryBuilder.getManyAndCount();

    return {
      calculations,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
