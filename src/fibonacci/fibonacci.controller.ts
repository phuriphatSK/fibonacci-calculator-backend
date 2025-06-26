import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Query,
  ParseIntPipe,
  ValidationPipe,
} from '@nestjs/common';
import { FibonacciService } from './fibonacci.service';
import { CalculateFibonacciDto } from './dto/calculate-fibonacci.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { PaginationDto } from 'src/common/dto/pageination.dto';
import { PaginatedResponseDto } from 'src/common/dto/paginated-response.dto';
import { FibonacciCalculation } from './entities/fibonacci-calculation.entity';

@Controller('fibonacci')
@UseGuards(JwtAuthGuard)
export class FibonacciController {
  constructor(private readonly fibonacciService: FibonacciService) {}

  @Post('calculate')
  async calculate(
    @Body() calculateDto: CalculateFibonacciDto,
    @CurrentUser() user: User,
  ) {
    return this.fibonacciService.calculateFibonacci(calculateDto.index, user);
  }

  @Get('history')
  async getHistory(
    @CurrentUser() user: User,
    @Query(new ValidationPipe({ transform: true }))
    paginationDto: PaginationDto,
  ): Promise<PaginatedResponseDto<FibonacciCalculation>> {
    const result = await this.fibonacciService.getAllUserCalculations(
      user.id,
      paginationDto.page,
      paginationDto.limit,
    );

    return new PaginatedResponseDto(
      result.calculations,
      result.page,
      result.limit,
      result.total,
    );
  }

  @Get('stats')
  async getStats(@CurrentUser() user: User) {
    return this.fibonacciService.getCalculationStats(user.id);
  }

  @Get('all')
  async getAllCalculations(
    @CurrentUser() user: User,
    @Query(new ValidationPipe({ transform: true }))
    paginationDto: PaginationDto,
  ): Promise<PaginatedResponseDto<FibonacciCalculation>> {
    const result = await this.fibonacciService.getAllUserCalculations(
      user.id,
      paginationDto.page,
      paginationDto.limit,
    );

    return new PaginatedResponseDto(
      result.calculations,
      result.page,
      result.limit,
      result.total,
    );
  }
}
